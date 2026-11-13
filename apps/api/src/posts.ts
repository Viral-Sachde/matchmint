import {
  BadRequestException, Body, ConflictException, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch,
  Post as HttpPost, Query, Res, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import type { Response } from 'express';
import { Repository } from 'typeorm';
import { AuthGuard, OptionalAuthGuard, UserId } from './auth';
import { CATEGORIES, Category, NEEDS, Need, POST_KINDS, Post, PostKind, Proposal, User } from './entities';
import { contactEmail, loadUser, orgCard, postOut, requireActive } from './shape';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const MAX_AMOUNT = 1_000_000_000;
/** Signed-out visitors see this many posts; the rest sit behind sign-in. */
const PREVIEW_LIMIT = 6;

export class CreatePostDto {
  @IsIn(POST_KINDS as unknown as string[]) kind: PostKind;
  @IsIn(NEEDS as unknown as string[]) need: Need;
  @IsIn(CATEGORIES as unknown as string[]) category: Category;
  @Transform(trim) @IsString() @MinLength(6) @MaxLength(110) title: string;
  @Transform(trim) @IsString() @MinLength(20) @MaxLength(240) summary: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(4000) description?: string;
  @Type(() => Number) @IsInt() @Min(0) @Max(MAX_AMOUNT) amountMin: number;
  @Type(() => Number) @IsInt() @Min(0) @Max(MAX_AMOUNT) amountMax: number;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) location?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'deadline must be a date (YYYY-MM-DD)' }) deadline?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(MAX_AMOUNT) audienceSize?: number;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(200) audienceNote?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(8) @IsString({ each: true }) @MaxLength(90, { each: true }) perks?: string[];
}

export class CreateProposalDto {
  @Transform(trim) @IsString() @MinLength(20) @MaxLength(2000) message: string;
  @Type(() => Number) @IsInt() @Min(0) @Max(MAX_AMOUNT) amount: number;
}

export class DecisionDto {
  @IsIn(['accept', 'decline', 'withdraw']) action: 'accept' | 'decline' | 'withdraw';
}

export class StatusDto {
  @IsIn(['OPEN', 'CLOSED']) status: 'OPEN' | 'CLOSED';
}

@Controller()
export class PostsController {
  constructor(
    @InjectRepository(Post) private posts: Repository<Post>,
    @InjectRepository(Proposal) private proposals: Repository<Proposal>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  private base() {
    return this.posts.createQueryBuilder('post').leftJoinAndSelect('post.org', 'org').loadRelationCountAndMap('post.proposalCount', 'post.proposals');
  }

  private fields(dto: CreatePostDto) {
    if (dto.amountMax < dto.amountMin) throw new BadRequestException('The maximum amount must be at least the minimum');
    return {
      kind: dto.kind, need: dto.need, category: dto.category, title: dto.title, summary: dto.summary,
      description: dto.description ?? '', amountMin: dto.amountMin, amountMax: dto.amountMax, location: dto.location ?? '',
      deadline: dto.deadline ?? null, audienceSize: dto.audienceSize ?? 0, audienceNote: dto.audienceNote ?? '',
      perks: (dto.perks ?? []).map((p) => p.trim()).filter(Boolean),
    };
  }

  /** A proposal as either side sees it. Contact details appear only once it is accepted. */
  private async proposalOut(p: Proposal, viewerOrgId: string) {
    const matched = p.status === 'ACCEPTED';
    const senderContact = matched || p.senderOrgId === viewerOrgId ? await contactEmail(this.users, p.senderOrgId, p.senderId) : null;
    const ownerContact = p.post && matched ? await contactEmail(this.users, p.post.orgId, p.post.authorId) : null;
    return {
      id: p.id, postId: p.postId, senderId: p.senderOrgId, payerId: p.payerOrgId, message: p.message, amount: p.amount,
      status: p.status, createdAt: p.createdAt, decidedAt: p.decidedAt,
      sender: { ...orgCard(p.senderOrg), name: senderContact?.name ?? p.senderOrg.name, email: senderContact?.email },
      post: p.post ? { ...postOut(p.post), owner: { ...orgCard(p.post.org), name: ownerContact?.name ?? p.post.org.name, email: ownerContact?.email } } : undefined,
    };
  }

  @Get('stats')
  async stats() {
    const [posts, members, matches] = await Promise.all([
      this.posts.count({ where: { status: 'OPEN' } }),
      this.users.count(),
      this.proposals.count({ where: { status: 'ACCEPTED' } }),
    ]);
    const row = await this.posts.createQueryBuilder('p').select('COALESCE(SUM(p.amountMax), 0)', 'total').where("p.status = 'OPEN'").getRawOne<{ total: number }>();
    return { posts, members, matches, openValue: Number(row?.total ?? 0) };
  }

  @UseGuards(OptionalAuthGuard)
  @Get('posts')
  async list(
    @Res({ passthrough: true }) res: Response,
    @UserId() userId?: string,
    @Query('kind') kind?: string,
    @Query('category') category?: string,
    @Query('need') need?: string,
    @Query('q') q?: string,
    @Query('sort') sort?: string,
    @Query('limit') limit?: string,
  ) {
    const qb = this.base().where("post.status = 'OPEN'");
    if (kind && (POST_KINDS as readonly string[]).includes(kind)) qb.andWhere('post.kind = :kind', { kind });
    if (category && (CATEGORIES as readonly string[]).includes(category)) qb.andWhere('post.category = :category', { category });
    if (need && (NEEDS as readonly string[]).includes(need)) qb.andWhere('post.need = :need', { need });
    if (q && q.trim()) {
      const term = `%${q.trim().toLowerCase().slice(0, 80)}%`;
      qb.andWhere('(LOWER(post.title) LIKE :t OR LOWER(post.summary) LIKE :t OR LOWER(post.location) LIKE :t OR LOWER(org.name) LIKE :t)', { t: term });
    }
    if (sort === 'amount') qb.orderBy('post.amountMax', 'DESC');
    else if (sort === 'deadline') qb.orderBy('post.deadline IS NULL', 'ASC').addOrderBy('post.deadline', 'ASC');
    else qb.orderBy('post.createdAt', 'DESC');

    const total = await qb.getCount();
    const asked = Math.min(Math.max(Number(limit) || 60, 1), 100);
    const take = userId ? asked : Math.min(asked, PREVIEW_LIMIT);
    res.setHeader('X-Total-Count', String(total));
    return (await qb.take(take).getMany()).map(postOut);
  }

  @UseGuards(AuthGuard)
  @Get('posts/mine')
  async mine(@UserId() userId: string) {
    const me = requireActive(await loadUser(this.users, userId));
    return (await this.base().where('post.orgId = :o', { o: me.orgId }).orderBy('post.createdAt', 'DESC').getMany()).map(postOut);
  }

  @UseGuards(OptionalAuthGuard)
  @Get('posts/:id')
  async one(@Param('id') id: string, @UserId() userId?: string) {
    const post = await this.base().where('post.id = :id', { id }).getOne();
    if (!post) throw new NotFoundException('This post does not exist');
    const me = userId ? await this.users.findOne({ where: { id: userId } }) : null;
    if (!me) {
      // preview for signed-out visitors: the headline facts, not the full story
      return { ...postOut(post), description: '', perks: [], audienceNote: '', audienceSize: 0, gated: true, isOwner: false, myProposal: null };
    }
    const active = me.memberStatus === 'ACTIVE';
    const isOwner = active && post.orgId === me.orgId;
    const mine = active && !isOwner
      ? await this.proposals.findOne({ where: { postId: id, senderOrgId: me.orgId }, order: { createdAt: 'DESC' } })
      : null;
    const ownerContact = mine?.status === 'ACCEPTED' ? await contactEmail(this.users, post.orgId, post.authorId) : null;
    return {
      ...postOut(post), gated: false, isOwner,
      myProposal: mine ? { id: mine.id, postId: mine.postId, amount: mine.amount, message: mine.message, status: mine.status, createdAt: mine.createdAt, ownerEmail: ownerContact?.email } : null,
    };
  }

  @UseGuards(AuthGuard)
  @HttpPost('posts')
  async create(@UserId() userId: string, @Body() dto: CreatePostDto) {
    const me = requireActive(await loadUser(this.users, userId));
    const saved = await this.posts.save(this.posts.create({ ...this.fields(dto), orgId: me.orgId, authorId: me.id, status: 'OPEN' }));
    return { id: saved.id };
  }

  private async ownPost(id: string, userId: string) {
    const me = requireActive(await loadUser(this.users, userId));
    const post = await this.posts.findOne({ where: { id } });
    if (!post) throw new NotFoundException('This post does not exist');
    if (post.orgId !== me.orgId) throw new ForbiddenException('Only the organisation that posted this can change it');
    return { me, post };
  }

  @UseGuards(AuthGuard)
  @Patch('posts/:id')
  async edit(@Param('id') id: string, @UserId() userId: string, @Body() dto: CreatePostDto) {
    const { post } = await this.ownPost(id, userId);
    const next = this.fields(dto);
    // the side a post is on cannot flip once people have answered it
    if (next.kind !== post.kind && (await this.proposals.count({ where: { postId: id } })) > 0) throw new BadRequestException('This post already has proposals, so it cannot switch between seeking and offering');
    await this.posts.update({ id }, next);
    return { id };
  }

  @UseGuards(AuthGuard)
  @Patch('posts/:id/status')
  async setStatus(@Param('id') id: string, @UserId() userId: string, @Body() dto: StatusDto) {
    await this.ownPost(id, userId);
    await this.posts.update({ id }, { status: dto.status });
    return { id, status: dto.status };
  }

  @UseGuards(AuthGuard)
  @Delete('posts/:id')
  async remove(@Param('id') id: string, @UserId() userId: string) {
    await this.ownPost(id, userId);
    await this.posts.delete({ id }); // its proposals go with it
    return { ok: true };
  }

  // ───────── Proposals ─────────

  @UseGuards(AuthGuard)
  @HttpPost('posts/:id/proposals')
  async propose(@Param('id') id: string, @UserId() userId: string, @Body() dto: CreateProposalDto) {
    const me = requireActive(await loadUser(this.users, userId));
    const post = await this.posts.findOne({ where: { id } });
    if (!post) throw new NotFoundException('This post does not exist');
    if (post.status !== 'OPEN') throw new BadRequestException('This post is closed');
    if (post.orgId === me.orgId) throw new BadRequestException('You cannot respond to your own organisation\'s post');
    if (await this.proposals.findOne({ where: { postId: id, senderOrgId: me.orgId, status: 'PENDING' } })) throw new ConflictException('Your organisation already has a pending proposal on this post');
    const saved = await this.proposals.save(this.proposals.create({
      postId: id, senderOrgId: me.orgId, senderId: me.id, payerOrgId: post.kind === 'OFFER' ? post.orgId : me.orgId,
      message: dto.message, amount: dto.amount, status: 'PENDING',
    }));
    return { id: saved.id };
  }

  @UseGuards(AuthGuard)
  @Get('posts/:id/proposals')
  async forPost(@Param('id') id: string, @UserId() userId: string) {
    const { me } = await this.ownPost(id, userId);
    const rows = await this.proposals.find({ where: { postId: id }, order: { createdAt: 'DESC' } });
    return Promise.all(rows.map((p) => this.proposalOut(p, me.orgId)));
  }

  @UseGuards(AuthGuard)
  @Get('proposals/sent')
  async sent(@UserId() userId: string) {
    const me = requireActive(await loadUser(this.users, userId));
    const rows = await this.proposals.find({ where: { senderOrgId: me.orgId }, relations: { post: true }, order: { createdAt: 'DESC' } });
    return Promise.all(rows.map((p) => this.proposalOut(p, me.orgId)));
  }

  @UseGuards(AuthGuard)
  @Get('proposals/incoming')
  async incoming(@UserId() userId: string) {
    const me = requireActive(await loadUser(this.users, userId));
    const rows = await this.proposals
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.senderOrg', 'senderOrg')
      .leftJoinAndSelect('pr.post', 'post')
      .leftJoinAndSelect('post.org', 'org')
      .where('post.orgId = :o', { o: me.orgId })
      .andWhere("pr.status != 'WITHDRAWN'")
      .orderBy('pr.createdAt', 'DESC')
      .getMany();
    return Promise.all(rows.map((p) => this.proposalOut(p, me.orgId)));
  }

  @UseGuards(AuthGuard)
  @Patch('proposals/:id')
  async decide(@Param('id') id: string, @UserId() userId: string, @Body() dto: DecisionDto) {
    const me = requireActive(await loadUser(this.users, userId));
    const pr = await this.proposals.findOne({ where: { id }, relations: { post: true } });
    if (!pr) throw new NotFoundException();
    if (pr.status !== 'PENDING') throw new BadRequestException('This proposal has already been settled');
    if (dto.action === 'withdraw') {
      if (pr.senderOrgId !== me.orgId) throw new ForbiddenException('Only the organisation that sent it can withdraw');
      await this.proposals.update({ id }, { status: 'WITHDRAWN', decidedAt: new Date() });
      return { id, status: 'WITHDRAWN' };
    }
    if (pr.post.orgId !== me.orgId) throw new ForbiddenException('Only the organisation that posted can decide');
    const status = dto.action === 'accept' ? 'ACCEPTED' : 'DECLINED';
    await this.proposals.update({ id }, { status, decidedAt: new Date() });
    return { id, status };
  }
}
