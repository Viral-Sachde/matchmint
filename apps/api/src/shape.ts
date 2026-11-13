import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Org, Post, User } from './entities';

/** How an organisation appears on posts and proposals. Named `owner` fields for the web app. */
export function orgCard(org: Org) {
  return {
    id: org.id, orgName: org.name, orgType: org.type, bio: org.bio, location: org.location, website: org.website,
    verified: org.verification === 'VERIFIED', createdAt: org.createdAt,
  };
}

/** A signed-in person, with their organisation's public details flattened in. */
export function userOut(u: User) {
  const { id: _orgId, ...org } = orgCard(u.org);
  return { ...org, id: u.id, email: u.email, name: u.name, orgId: u.orgId, role: u.role, memberStatus: u.memberStatus, verification: u.org.verification, createdAt: u.createdAt };
}

export function postOut(post: Post) {
  const { proposals: _p, org, authorId: _a, ...rest } = post;
  return { ...rest, ownerId: post.orgId, owner: orgCard(org) };
}

export async function loadUser(users: Repository<User>, id: string) {
  const user = await users.findOne({ where: { id } });
  if (!user) throw new UnauthorizedException('Your session has expired. Sign in again.');
  return user;
}

/** Only approved team members can act for an organisation. */
export function requireActive(user: User) {
  if (user.memberStatus !== 'ACTIVE') throw new ForbiddenException(`Your request to join ${user.org.name} is waiting for approval`);
  return user;
}
export function requireOwner(user: User) {
  requireActive(user);
  if (user.role !== 'OWNER') throw new ForbiddenException('Only an owner of the organisation can do this');
  return user;
}

/** The email shared with the other side after a match: the author's, or failing that an owner's. */
export async function contactEmail(users: Repository<User>, orgId: string, personId: string | null) {
  if (personId) {
    const p = await users.findOne({ where: { id: personId, orgId, memberStatus: 'ACTIVE' } });
    if (p) return { name: p.name, email: p.email };
  }
  const owner = await users.findOne({ where: { orgId, role: 'OWNER', memberStatus: 'ACTIVE' }, order: { createdAt: 'ASC' } });
  return owner ? { name: owner.name, email: owner.email } : null;
}

// Addresses anyone can register, so a matching domain proves nothing about where someone works.
const PUBLIC_MAIL = new Set(['gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'me.com', 'proton.me', 'protonmail.com', 'aol.com', 'rediffmail.com', 'zoho.com', 'gmx.com', 'mail.com']);
export function workDomain(email: string) {
  const d = email.split('@')[1]?.toLowerCase() ?? '';
  return d && !PUBLIC_MAIL.has(d) ? d : null;
}
