import {
  BadRequestException, Body, CanActivate, ConflictException, Controller, Delete, ExecutionContext, ForbiddenException, Get, Injectable,
  Patch, Post as HttpPost, Query, UnauthorizedException, UseGuards, createParamDecorator,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { ORG_TYPES, Org, OrgType, User, orgKey } from './entities';
import { loadUser, userOut, workDomain } from './shape';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const lower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

export class SignupDto {
  @Transform(lower) @IsEmail() email: string;
  @IsString() @MinLength(8) @MaxLength(72) password: string;
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(80) name: string;
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(120) orgName: string;
  @IsOptional() @IsIn(ORG_TYPES as unknown as string[]) orgType?: OrgType;
}
export class LoginDto {
  @Transform(lower) @IsEmail() email: string;
  @IsString() @MinLength(1) password: string;
}
export class UpdateMeDto {
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(80) name: string;
}
export class PasswordDto {
  @IsString() @MinLength(1) current: string;
  @IsString() @MinLength(8) @MaxLength(72) next: string;
}
export class DeleteMeDto {
  @IsString() @MinLength(1) password: string;
}

function readToken(req: { headers: Record<string, string | undefined> }) {
  const h = req.headers['authorization'];
  return h && h.startsWith('Bearer ') ? h.slice(7) : null;
}

/** Requires a valid token. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const token = readToken(req);
    if (!token) throw new UnauthorizedException('Sign in to continue');
    try {
      req.userId = this.jwt.verify<{ sub: string }>(token).sub;
      return true;
    } catch {
      throw new UnauthorizedException('Your session has expired. Sign in again.');
    }
  }
}

/** Attaches the user if a valid token is present, never rejects. */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const token = readToken(req);
    if (token) {
      try {
        req.userId = this.jwt.verify<{ sub: string }>(token).sub;
      } catch {
        /* treat as signed out */
      }
    }
    return true;
  }
}

export const UserId = createParamDecorator((_: unknown, ctx: ExecutionContext): string | undefined => ctx.switchToHttp().getRequest().userId);

@Controller()
export class AuthController {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Org) private orgs: Repository<Org>,
    private jwt: JwtService,
  ) {}

  private session(user: User) {
    return { token: this.jwt.sign({ sub: user.id }), user: userOut(user) };
  }

  /** Tells the sign-up form whether an organisation is already registered, so nobody creates a duplicate. */
  @Get('orgs/check')
  async check(@Query('name') name?: string) {
    const key = orgKey(name ?? '');
    if (key.length < 2) return { exists: false };
    const org = await this.orgs.findOne({ where: { nameKey: key } });
    return org ? { exists: true, name: org.name, type: org.type, verified: org.verification === 'VERIFIED' } : { exists: false };
  }

  @HttpPost('auth/signup')
  async signup(@Body() dto: SignupDto) {
    if (await this.users.findOne({ where: { email: dto.email } })) throw new ConflictException('An account with this email already exists');
    const key = orgKey(dto.orgName);
    if (key.length < 2) throw new BadRequestException('Enter the name of your organisation or project');
    const passwordHash = await bcrypt.hash(dto.password, 10);

    let org = await this.orgs.findOne({ where: { nameKey: key } });
    let role: User['role'] = 'OWNER';
    let memberStatus: User['memberStatus'] = 'ACTIVE';
    if (org) {
      // The organisation exists: this person joins it instead of creating a second copy.
      // A matching work email domain is trusted. Anything else waits for an owner to approve.
      role = 'MEMBER';
      const domain = workDomain(dto.email);
      const team = await this.users.find({ where: { orgId: org.id, memberStatus: 'ACTIVE' } });
      memberStatus = domain && team.some((m) => workDomain(m.email) === domain) ? 'ACTIVE' : 'PENDING';
    } else {
      if (!dto.orgType) throw new BadRequestException('Choose what kind of organisation you are');
      org = await this.orgs.save(this.orgs.create({ name: dto.orgName, nameKey: key, type: dto.orgType }));
    }
    const saved = await this.users.save(this.users.create({ email: dto.email, name: dto.name, passwordHash, orgId: org.id, role, memberStatus }));
    const user = await loadUser(this.users, saved.id);
    return { ...this.session(user), joined: role === 'OWNER' ? 'created' : memberStatus === 'ACTIVE' ? 'joined' : 'pending' };
  }

  @HttpPost('auth/login')
  async login(@Body() dto: LoginDto) {
    const user = await this.users.createQueryBuilder('u').leftJoinAndSelect('u.org', 'org').addSelect('u.passwordHash').where('u.email = :e', { e: dto.email }).getOne();
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Wrong email or password');
    return this.session(user);
  }

  /**
   * Local development only: signs in as a seeded demo account without a password.
   * Refused unless DEMO_LOGIN=true is set in apps/api/.env and NODE_ENV is not production.
   */
  @HttpPost('auth/demo')
  async demo(@Body() body: { as?: string }) {
    if (process.env.DEMO_LOGIN !== 'true' || process.env.NODE_ENV === 'production') throw new ForbiddenException('Demo sign-in is turned off');
    const email = body?.as === 'backer' ? 'ananya@kestrel.demo' : body?.as === 'admin' ? 'admin@matchmint.demo' : 'asha@greenroots.demo';
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Demo accounts are not seeded');
    return this.session(user);
  }

  @UseGuards(AuthGuard)
  @Get('auth/me')
  async me(@UserId() id: string) {
    const user = await loadUser(this.users, id);
    const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    return { ...userOut(user), isAdmin: admins.includes(user.email) };
  }

  @UseGuards(AuthGuard)
  @Patch('auth/me')
  async update(@UserId() id: string, @Body() dto: UpdateMeDto) {
    await this.users.update({ id }, { name: dto.name });
    return userOut(await loadUser(this.users, id));
  }

  @UseGuards(AuthGuard)
  @HttpPost('auth/password')
  async password(@UserId() id: string, @Body() dto: PasswordDto) {
    const user = await this.users.createQueryBuilder('u').addSelect('u.passwordHash').where('u.id = :id', { id }).getOne();
    if (!user || !(await bcrypt.compare(dto.current, user.passwordHash))) throw new BadRequestException('Your current password is not right');
    await this.users.update({ id }, { passwordHash: await bcrypt.hash(dto.next, 10) });
    return { ok: true };
  }

  /** Deletes the account. If this is the last person in the organisation, the organisation and its posts go too. */
  @UseGuards(AuthGuard)
  @Delete('auth/me')
  async remove(@UserId() id: string, @Body() dto: DeleteMeDto) {
    const user = await this.users.createQueryBuilder('u').leftJoinAndSelect('u.org', 'org').addSelect('u.passwordHash').where('u.id = :id', { id }).getOne();
    if (!user) throw new UnauthorizedException();
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) throw new BadRequestException('That password is not right');
    const others = await this.users.find({ where: { orgId: user.orgId, memberStatus: 'ACTIVE' } }).then((list) => list.filter((m) => m.id !== id));
    if (user.memberStatus === 'ACTIVE' && others.length === 0) {
      await this.orgs.delete({ id: user.orgId }); // cascades to people, posts and proposals
      return { ok: true, orgDeleted: true };
    }
    if (user.role === 'OWNER' && !others.some((m) => m.role === 'OWNER')) {
      throw new BadRequestException('You are the only owner. Make a team member an owner first, then delete your account.');
    }
    await this.users.delete({ id });
    return { ok: true, orgDeleted: false };
  }
}
