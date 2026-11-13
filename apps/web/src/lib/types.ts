export type OrgType = "INDIVIDUAL" | "NGO" | "COMPANY" | "BRAND" | "UNIVERSITY" | "CREATOR" | "COMMUNITY" | "EVENT";
export type PostKind = "REQUEST" | "OFFER";
export type Need = "FUNDING" | "SPONSORSHIP" | "PARTNERSHIP" | "IN_KIND";
export type ProposalStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";

export type Verification = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
export type Role = "OWNER" | "MEMBER";

/** An organisation as it appears on posts and proposals. `name` and `email` are the contact person, shared after a match. */
export type OrgCard = {
  id: string; orgName: string; orgType: OrgType; bio: string; location: string; website: string; verified: boolean; createdAt: string;
  name?: string; email?: string;
};

/** The signed-in person, with their organisation's details alongside. */
export type User = {
  id: string; email: string; name: string; orgId: string; role: Role; memberStatus: "ACTIVE" | "PENDING";
  orgName: string; orgType: OrgType; bio: string; location: string; website: string; verified: boolean; verification: Verification;
  isAdmin?: boolean; createdAt: string;
};

export type Org = {
  id: string; name: string; type: OrgType; bio: string; location: string; website: string; verification: Verification;
  regType: string; regNumber: string; docUrl: string; verificationNote: string; reviewNote: string; verificationAt: string | null; createdAt: string;
};

export type Member = { id: string; name: string; email: string; role: Role; memberStatus: "ACTIVE" | "PENDING"; createdAt: string };

export type Post = {
  id: string; ownerId: string; owner: OrgCard; kind: PostKind; need: Need; category: string; title: string; summary: string; description: string;
  amountMin: number; amountMax: number; location: string; deadline: string | null; audienceSize: number; audienceNote: string; perks: string[];
  status: "OPEN" | "CLOSED"; createdAt: string; proposalCount?: number;
};

export type Proposal = {
  id: string; postId: string; senderId: string; payerId: string; sender: OrgCard; post?: Post; message: string; amount: number;
  status: ProposalStatus; createdAt: string; decidedAt: string | null;
};

export type PostDetail = Post & {
  /** true for signed-out visitors: the full story and the perks are held back */
  gated: boolean;
  isOwner: boolean;
  myProposal: { id: string; postId: string; amount: number; message: string; status: ProposalStatus; createdAt: string; ownerEmail?: string } | null;
};

export type Stats = { posts: number; members: number; matches: number; openValue: number };
