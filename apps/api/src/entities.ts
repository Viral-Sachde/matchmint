import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export const ORG_TYPES = ['INDIVIDUAL', 'NGO', 'COMPANY', 'BRAND', 'UNIVERSITY', 'CREATOR', 'COMMUNITY', 'EVENT'] as const;
export type OrgType = (typeof ORG_TYPES)[number];

export const POST_KINDS = ['REQUEST', 'OFFER'] as const; // REQUEST = seeking backing, OFFER = has backing to give
export type PostKind = (typeof POST_KINDS)[number];

export const NEEDS = ['FUNDING', 'SPONSORSHIP', 'PARTNERSHIP', 'IN_KIND'] as const;
export type Need = (typeof NEEDS)[number];

export const CATEGORIES = ['Startup', 'NGO', 'Business', 'College Fest', 'Community', 'University', 'Creator', 'Conference', 'Sports', 'Expo'] as const;
export type Category = (typeof CATEGORIES)[number];

export const PROPOSAL_STATUSES = ['PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN'] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export type Verification = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type Role = 'OWNER' | 'MEMBER';
export type MemberStatus = 'ACTIVE' | 'PENDING';

/** Organisation names are compared without case, punctuation or spacing so one organisation cannot be registered twice. */
export function orgKey(name: string) {
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '');
}

@Entity('orgs')
export class Org {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Index({ unique: true }) @Column() nameKey: string;
  @Column({ type: 'text' }) type: OrgType;
  @Column({ type: 'text', default: '' }) bio: string;
  @Column({ type: 'text', default: '' }) location: string;
  @Column({ type: 'text', default: '' }) website: string;
  @Column({ type: 'text', default: 'UNVERIFIED' }) verification: Verification;
  @Column({ type: 'text', default: '' }) regType: string;
  @Column({ type: 'text', default: '' }) regNumber: string;
  @Column({ type: 'text', default: '' }) docUrl: string;
  @Column({ type: 'text', default: '' }) verificationNote: string; // what the organisation told us
  @Column({ type: 'text', default: '' }) reviewNote: string; // what the reviewer answered
  @Column({ type: 'datetime', nullable: true }) verificationAt: Date | null;
  @CreateDateColumn() createdAt: Date;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column() email: string;
  @Column({ select: false }) passwordHash: string;
  @Column() name: string;
  @Column() orgId: string;
  @ManyToOne(() => Org, { eager: true, onDelete: 'CASCADE' }) @JoinColumn({ name: 'orgId' }) org: Org;
  @Column({ type: 'text', default: 'OWNER' }) role: Role;
  @Column({ type: 'text', default: 'ACTIVE' }) memberStatus: MemberStatus;
  @CreateDateColumn() createdAt: Date;
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() orgId: string;
  @ManyToOne(() => Org, { eager: true, onDelete: 'CASCADE' }) @JoinColumn({ name: 'orgId' }) org: Org;
  /** The person who wrote it. Kept for the contact email; the organisation owns the post. */
  @Column({ type: 'text', nullable: true }) authorId: string | null;
  @Column({ type: 'text' }) kind: PostKind;
  @Column({ type: 'text' }) need: Need;
  @Column({ type: 'text' }) category: Category;
  @Column() title: string;
  @Column({ type: 'text' }) summary: string;
  @Column({ type: 'text', default: '' }) description: string;
  @Column({ type: 'integer', default: 0 }) amountMin: number;
  @Column({ type: 'integer', default: 0 }) amountMax: number;
  @Column({ type: 'text', default: '' }) location: string;
  @Column({ type: 'text', nullable: true }) deadline: string | null;
  @Column({ type: 'integer', default: 0 }) audienceSize: number;
  @Column({ type: 'text', default: '' }) audienceNote: string;
  @Column({ type: 'simple-json' }) perks: string[];
  @Column({ type: 'text', default: 'OPEN' }) status: 'OPEN' | 'CLOSED';
  @CreateDateColumn() createdAt: Date;
  @OneToMany(() => Proposal, (p) => p.post) proposals: Proposal[];
  proposalCount?: number;
}

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() postId: string;
  @ManyToOne(() => Post, (p) => p.proposals, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'postId' }) post: Post;
  @Column() senderOrgId: string;
  @ManyToOne(() => Org, { eager: true, onDelete: 'CASCADE' }) @JoinColumn({ name: 'senderOrgId' }) senderOrg: Org;
  @Column({ type: 'text', nullable: true }) senderId: string | null;
  /** The organisation that pays. The post's organisation on an offer, the sender's on a request. */
  @Column() payerOrgId: string;
  @Column({ type: 'text' }) message: string;
  @Column({ type: 'integer', default: 0 }) amount: number;
  @Column({ type: 'text', default: 'PENDING' }) status: ProposalStatus;
  @CreateDateColumn() createdAt: Date;
  @Column({ type: 'datetime', nullable: true }) decidedAt: Date | null;
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'text' }) kind: 'contact' | 'newsletter';
  @Column() email: string;
  @Column({ type: 'text', default: '' }) name: string;
  @Column({ type: 'text', default: '' }) company: string;
  @Column({ type: 'text', default: '' }) message: string;
  @CreateDateColumn() createdAt: Date;
}
