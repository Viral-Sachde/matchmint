import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, Get, NotFoundException, Param, Patch, Post as HttpPost, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Not, Repository } from 'typeorm';
import { AuthGuard, UserId } from './auth';
import { ORG_TYPES, Org, OrgType, User, orgKey } from './entities';
import { loadUser, requireActive, requireOwner } from './shape';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpdateOrgDto {
  @IsOptional() @Transform(trim) @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @IsOptional() @IsIn(ORG_TYPES as unknown as string[]) type?: OrgType;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(600) bio?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) location?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(200) website?: string;
}
export class VerificationDto {
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(80) regType: string;
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(80) regNumber: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(300) docUrl?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(600) note?: string;
}
export class MemberActionDto {
  @IsIn(['approve', 'remove', 'make_owner', 'make_member']) action: 'approve' | 'remove' | 'make_owner' | 'make_member';
}
export class ReviewDto {
  @IsIn(['approve', 'reject']) action: 'approve' | 'reject';
  @IsOptional() @Transform(trim) @IsString() @MaxLength(400) note?: string;
}

function orgFull(org: Org) {
  return {
    id: org.id, name: org.name, type: org.type, bio: org.bio, location: org.location, website: org.website,
    verification: org.verification, regType: org.regType, regNumber: org.regNumber, docUrl: org.docUrl,
    verificationNote: org.verificationNote, reviewNote: org.reviewNote, verificationAt: org.verificationAt, createdAt: org.createdAt,
  };
}
const member = (u: User) => ({ id: u.id, name: u.name, email: u.email, role: u.role, memberStatus: u.memberStatus, createdAt: u.createdAt });

@Controller()
export class OrgController {
  constructor(@InjectRepository(Org) private orgs: Repository<Org>, @InjectRepository(User) private users: Repository<User>) {}

  private admins() {
    return (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  }

  @UseGuards(AuthGuard)
  @Get('org')
  async mine(@UserId() id: string) {
    const me = requireActive(await loadUser(this.users, id));
    return orgFull(me.org);
  }

  @UseGuards(AuthGuard)
  @Patch('org')
  async update(@UserId() id: string, @Body() dto: UpdateOrgDto) {
    const me = requireOwner(await loadUser(this.users, id));
    const patch: Partial<Org> = { ...dto };
    if (dto.name && dto.name !== me.org.name) {
      const key = orgKey(dto.name);
      if (key.length < 2) throw new BadRequestException('Enter a name');
      if (await this.orgs.findOne({ where: { nameKey: key, id: Not(me.orgId) } })) throw new ConflictException('Another organisation already uses that name');
      // a verified name cannot quietly become a different one
      if (key !== me.org.nameKey && me.org.verification === 'VERIFIED') patch.verification = 'UNVERIFIED';
      patch.nameKey = key;
    }
    await this.orgs.update({ id: me.orgId }, patch);
    return orgFull((await this.orgs.findOne({ where: { id: me.orgId } }))!);
  }

  @UseGuards(AuthGuard)
  @HttpPost('org/verification')
  async submit(@UserId() id: string, @Body() dto: VerificationDto) {
    const me = requireOwner(await loadUser(this.users, id));
    if (me.org.verification === 'VERIFIED') throw new BadRequestException('Your organisation is already verified');
    if (!me.org.bio || !me.org.location) throw new BadRequestException('Complete your organisation profile first: add a description and a location');
    await this.orgs.update({ id: me.orgId }, {
      verification: 'PENDING', regType: dto.regType, regNumber: dto.regNumber, docUrl: dto.docUrl ?? '', verificationNote: dto.note ?? '', reviewNote: '', verificationAt: new Date(),
    });
    return orgFull((await this.orgs.findOne({ where: { id: me.orgId } }))!);
  }

  @UseGuards(AuthGuard)
  @Get('org/members')
  async members(@UserId() id: string) {
    const me = requireActive(await loadUser(this.users, id));
    const list = await this.users.find({ where: { orgId: me.orgId }, order: { createdAt: 'ASC' } });
    return list.map(member);
  }

  @UseGuards(AuthGuard)
  @Patch('org/members/:memberId')
  async manage(@UserId() id: string, @Param('memberId') memberId: string, @Body() dto: MemberActionDto) {
    const me = requireOwner(await loadUser(this.users, id));
    const target = await this.users.findOne({ where: { id: memberId, orgId: me.orgId } });
    if (!target) throw new NotFoundException('That person is not in your organisation');
    if (dto.action === 'approve') {
      await this.users.update({ id: memberId }, { memberStatus: 'ACTIVE' });
    } else if (dto.action === 'make_owner') {
      if (target.memberStatus !== 'ACTIVE') throw new BadRequestException('Approve this person first');
      await this.users.update({ id: memberId }, { role: 'OWNER' });
    } else {
      // removing or demoting: the organisation must always keep one owner
      const owners = await this.users.count({ where: { orgId: me.orgId, role: 'OWNER', memberStatus: 'ACTIVE' } });
      if (target.role === 'OWNER' && owners <= 1) throw new BadRequestException('An organisation needs at least one owner');
      if (dto.action === 'make_member') await this.users.update({ id: memberId }, { role: 'MEMBER' });
      else {
        if (memberId === id) throw new BadRequestException('To leave, delete your account from the Account section');
        await this.users.delete({ id: memberId });
      }
    }
    return { ok: true };
  }

  // ───────── MatchMint staff: review verification requests ─────────

  private async requireAdmin(id: string) {
    const me = await loadUser(this.users, id);
    if (!this.admins().includes(me.email)) throw new ForbiddenException('Only MatchMint staff can do this');
    return me;
  }

  @UseGuards(AuthGuard)
  @Get('admin/verifications')
  async queue(@UserId() id: string) {
    await this.requireAdmin(id);
    const rows = await this.orgs.find({ where: [{ verification: 'PENDING' }, { verification: 'VERIFIED' }, { verification: 'REJECTED' }], order: { verificationAt: 'DESC' } });
    return rows.map(orgFull);
  }

  @UseGuards(AuthGuard)
  @Patch('admin/verifications/:orgId')
  async review(@UserId() id: string, @Param('orgId') orgId: string, @Body() dto: ReviewDto) {
    await this.requireAdmin(id);
    const org = await this.orgs.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException();
    await this.orgs.update({ id: orgId }, { verification: dto.action === 'approve' ? 'VERIFIED' : 'REJECTED', reviewNote: dto.note ?? '', verificationAt: new Date() });
    return { ok: true };
  }
}
