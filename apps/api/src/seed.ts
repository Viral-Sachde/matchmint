import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import { Category, Need, Org, OrgType, Post, PostKind, Proposal, User, Verification, orgKey } from './entities';

type SeedUser = { key: string; email: string; name: string; orgName: string; orgType: OrgType; location: string; bio: string };
type SeedPost = {
  key: string; owner: string; kind: PostKind; need: Need; category: Category; title: string; summary: string; description: string;
  amountMin: number; amountMax: number; location: string; deadline: string | null; audienceSize: number; audienceNote: string; perks: string[];
};

const USERS: SeedUser[] = [
  { key: 'greenroots', email: 'asha@greenroots.demo', name: 'Asha Menon', orgName: 'GreenRoots Foundation', orgType: 'NGO', location: 'Pune', bio: 'Registered non-profit running volunteer-led reforestation drives across Maharashtra since 2016.' },
  { key: 'techfest', email: 'rohan@techfest.demo', name: 'Rohan Iyer', orgName: 'Techfest, IIT Bombay', orgType: 'EVENT', location: 'Mumbai', bio: 'Student-run science and technology festival with participants from 2,500 colleges.' },
  { key: 'kestrel', email: 'ananya@kestrel.demo', name: 'Ananya Rao', orgName: 'Kestrel Energy', orgType: 'BRAND', location: 'Bengaluru', bio: 'Clean-energy drinks brand backing student builders, athletes and community sport.' },
  { key: 'priya', email: 'priya@priyabuilds.demo', name: 'Priya Nair', orgName: 'Priya Builds', orgType: 'CREATOR', location: 'Remote', bio: 'Developer creator. Long-form build videos for 840k followers across YouTube and Instagram.' },
  { key: 'strides', email: 'kabir@strides.demo', name: 'Kabir Sethi', orgName: 'Strides Collective', orgType: 'COMMUNITY', location: 'Delhi NCR', bio: 'A 12,000-member running community with weekly runs at nine locations.' },
  { key: 'lumen', email: 'meera@lumenlabs.demo', name: 'Meera Shah', orgName: 'Lumen Labs', orgType: 'COMPANY', location: 'Bengaluru', bio: 'Developer tools company. We fund communities, conferences and open-source maintainers.' },
  { key: 'loop', email: 'dev@looprecycle.demo', name: 'Dev Kapoor', orgName: 'Loop Recycle', orgType: 'COMPANY', location: 'Hyderabad', bio: 'Early-stage startup turning multilayer plastic waste into construction boards.' },
  { key: 'northwind', email: 'sara@northwind.demo', name: 'Sara Thomas', orgName: 'Northwind Bank', orgType: 'COMPANY', location: 'Mumbai', bio: 'Retail bank with a CSR mandate across education, climate and financial literacy.' },
];

const L = 100_000;
const POSTS: SeedPost[] = [
  { key: 'p1', owner: 'greenroots', kind: 'REQUEST', need: 'FUNDING', category: 'NGO', title: 'Fund 50,000 native saplings before the 2027 monsoon', summary: 'We plant and maintain native trees on degraded land near Pune with 4,000 volunteers. We need a CSR partner for the next planting season.', description: 'GreenRoots has planted 310,000 saplings since 2016 with a three-year survival rate of 82 percent, audited by an independent agency.\n\nFunding covers saplings, soil preparation, drip lines and two years of maintenance. We are 80G and CSR-1 registered and provide quarterly impact reports with geotagged photos.', amountMin: 5 * L, amountMax: 50 * L, location: 'Pune, Maharashtra', deadline: '2027-04-30', audienceSize: 45000, audienceNote: 'Volunteers, schools and local residents', perks: ['Named grove with signage', 'Employee volunteering days', 'Audited impact report', 'Social features and press mention'] },
  { key: 'p2', owner: 'techfest', kind: 'REQUEST', need: 'SPONSORSHIP', category: 'College Fest', title: 'Hackathon partner for Techfest 2027', summary: 'Three days, 175,000 visitors, 2,500 colleges. We are looking for one partner to own the 36-hour flagship hackathon.', description: 'The hackathon draws 1,200 shortlisted student developers. The partner sets one problem statement, sits on the judging panel and gets first access to the finalists for hiring.\n\nPast partners report an average of 60 interview conversions per edition.', amountMin: 8 * L, amountMax: 12 * L, location: 'Mumbai', deadline: '2026-12-20', audienceSize: 175000, audienceNote: 'Engineering students aged 18 to 24, pan-India', perks: ['Problem statement and naming', 'Judging panel seat', 'Hiring access to finalists', 'Main stage logo placement'] },
  { key: 'p3', owner: 'kestrel', kind: 'OFFER', need: 'SPONSORSHIP', category: 'Sports', title: 'Sponsoring 10 university sports teams this season', summary: 'Kestrel Energy is backing ten university teams with kit, travel and product. Apply with your team, sport and season calendar.', description: 'We care about teams with a real following on campus, whatever the sport. Each selected team receives a cash grant, full kit and product for the season.\n\nIn return we ask for kit branding and two short content pieces per month.', amountMin: 1 * L, amountMax: 3 * L, location: 'India', deadline: '2026-12-31', audienceSize: 0, audienceNote: 'Open to any registered university team', perks: ['Cash grant per team', 'Full kit for the squad', 'Season supply of product', 'Feature on Kestrel channels'] },
  { key: 'p4', owner: 'priya', kind: 'REQUEST', need: 'SPONSORSHIP', category: 'Creator', title: 'Series sponsor for "Build in Public", 12 episodes', summary: 'A weekly long-form series where I build and ship a real product on camera. Looking for one developer-tools sponsor for the season.', description: 'Average episode: 310,000 views, 9.2 percent engagement, 71 percent of viewers work as developers.\n\nThe sponsor is integrated into the build itself rather than read out as an ad.', amountMin: 4 * L, amountMax: 9 * L, location: 'Remote', deadline: null, audienceSize: 840000, audienceNote: 'Developers aged 18 to 30, global', perks: ['Integration in all 12 episodes', 'Pinned link and description credit', '90-day usage rights', 'Monthly performance report'] },
  { key: 'p5', owner: 'strides', kind: 'REQUEST', need: 'PARTNERSHIP', category: 'Community', title: 'Hydration and recovery partner for 52 Sunday runs', summary: 'We run every Sunday at nine locations across Delhi NCR. Looking for a brand to own hydration stations for the full year.', description: 'Each run draws between 600 and 1,400 runners. Stations sit at the start, midpoint and finish.\n\nWe are open to a mix of product and cash.', amountMin: 2 * L, amountMax: 9 * L, location: 'Delhi NCR', deadline: '2027-01-15', audienceSize: 12000, audienceNote: 'Urban runners aged 22 to 35', perks: ['Station branding at 52 runs', 'Product sampling', 'Jersey sleeve logo', 'Monthly community feature'] },
  { key: 'p6', owner: 'lumen', kind: 'OFFER', need: 'FUNDING', category: 'Community', title: 'Community grants for developer meetups', summary: 'Lumen Labs funds local developer communities. Grants cover venue, food and speaker travel for groups that meet at least monthly.', description: 'We fund around thirty communities a year. No pitch deck needed: tell us who shows up, how often you meet and what you would do with the money.', amountMin: 50_000, amountMax: 2 * L, location: 'India and Southeast Asia', deadline: null, audienceSize: 0, audienceNote: 'Communities with 100 or more active members', perks: ['Grant paid in two parts', 'Speakers from the Lumen team', 'Swag for members', 'No exclusivity required'] },
  { key: 'p7', owner: 'loop', kind: 'REQUEST', need: 'FUNDING', category: 'Startup', title: 'Pilot funding to turn plastic waste into building boards', summary: 'Our boards replace plywood in interior fit-outs. We need funding and a corporate partner for a 20-tonne pilot.', description: 'Loop Recycle has a working process at lab scale and letters of intent from two fit-out contractors.\n\nThe pilot proves unit economics at 20 tonnes per month. We are open to grants, CSR funding or a paid pilot with a waste-generating partner.', amountMin: 15 * L, amountMax: 60 * L, location: 'Hyderabad', deadline: '2027-02-28', audienceSize: 0, audienceNote: '', perks: ['Co-branded pilot and case study', 'First right to offtake', 'Quarterly diversion data for ESG reports'] },
  { key: 'p8', owner: 'northwind', kind: 'OFFER', need: 'FUNDING', category: 'NGO', title: 'CSR grants for financial literacy programs', summary: 'Northwind Bank is funding non-profits that teach money skills to first-time earners. Applications reviewed every month.', description: 'We fund programs with a clear curriculum and a way to measure outcomes six months later. Multi-year partnerships are possible after a successful first cycle.', amountMin: 10 * L, amountMax: 75 * L, location: 'India', deadline: '2027-03-31', audienceSize: 0, audienceNote: 'Registered non-profits with 80G and CSR-1', perks: ['Multi-year funding possible', 'Volunteer trainers from the bank', 'Co-developed curriculum', 'Reporting support'] },
  { key: 'p9', owner: 'techfest', kind: 'REQUEST', need: 'IN_KIND', category: 'College Fest', title: 'Cloud credits and devices for 40 student teams', summary: 'Our robotics and AI tracks need compute credits and test devices. In-kind support welcome from hardware and cloud companies.', description: 'Teams build for six weeks before the finale. Partners get a demo slot at the finale and can keep working with the teams afterwards.', amountMin: 0, amountMax: 5 * L, location: 'Mumbai', deadline: '2026-12-05', audienceSize: 175000, audienceNote: 'Finale audience and live stream', perks: ['Demo slot at the finale', 'Logo on team jerseys', 'Access to all project repos'] },
  { key: 'p10', owner: 'lumen', kind: 'OFFER', need: 'SPONSORSHIP', category: 'Conference', title: 'Looking for developer conferences to sponsor in 2027', summary: 'We have budget for eight conferences next year. Tell us about your audience, dates and what a sponsor gets.', description: 'Preference for community-run events with a strong hallway track. We do not need a keynote slot; we would rather run a workshop.', amountMin: 3 * L, amountMax: 15 * L, location: 'Anywhere', deadline: '2027-01-31', audienceSize: 0, audienceNote: 'Events with 300 or more developers', perks: ['Sponsorship fee', 'A hands-on workshop for attendees', 'Scholarship tickets for students'] },
  { key: 'p11', owner: 'strides', kind: 'REQUEST', need: 'SPONSORSHIP', category: 'Sports', title: 'Title sponsor for the Strides 10K, February 2027', summary: 'Our annual race: 6,000 runners, closed roads through central Delhi and a finish-line festival. One title slot open.', description: 'Last year sold out in nine days. The race is covered by two national sports outlets and streamed live.', amountMin: 12 * L, amountMax: 25 * L, location: 'New Delhi', deadline: '2026-12-15', audienceSize: 6000, audienceNote: 'Runners plus 15,000 spectators', perks: ['Race naming rights', 'Bib and medal branding', 'Finish arch and podium backdrop', '40 complimentary entries'] },
  { key: 'p12', owner: 'greenroots', kind: 'REQUEST', need: 'PARTNERSHIP', category: 'University', title: 'University partners for a campus rewilding program', summary: 'We help campuses convert unused land into native micro-forests with students doing the work for credit.', description: 'Three campuses completed so far. We bring the method, saplings and training. The university brings land, student time and a faculty lead.', amountMin: 0, amountMax: 4 * L, location: 'Maharashtra and Karnataka', deadline: null, audienceSize: 20000, audienceNote: 'Students and faculty on each campus', perks: ['Design of the micro-forest', 'Training for student leads', 'Biodiversity monitoring for three years'] },
  { key: 'p13', owner: 'northwind', kind: 'REQUEST', need: 'PARTNERSHIP', category: 'Business', title: 'Fintech partners for a small-business lending pilot', summary: 'Northwind Bank wants two fintech partners to test faster loans for shop owners in three cities.', description: 'We bring the balance sheet, compliance and branch network. Partners bring onboarding and underwriting technology. The pilot runs for six months.', amountMin: 10 * L, amountMax: 40 * L, location: 'Mumbai, Pune, Nagpur', deadline: '2027-02-15', audienceSize: 0, audienceNote: '', perks: ['Paid pilot', 'Access to branch network', 'Joint announcement'] },
  { key: 'p14', owner: 'strides', kind: 'REQUEST', need: 'IN_KIND', category: 'Community', title: 'A weekday venue for our beginners running clinic', summary: 'Sixty new runners, one evening a week for eight weeks. We need a hall or a ground, not money.', description: 'Any indoor hall or a lit ground in South Delhi works. We bring coaches, insurance and equipment.', amountMin: 0, amountMax: 0, location: 'South Delhi', deadline: '2027-01-10', audienceSize: 60, audienceNote: 'First-time runners aged 20 to 45', perks: ['Venue named in every session', 'Free places for your staff'] },
];

const PROPOSALS: { post: string; sender: string; amount: number; message: string; status: 'PENDING' | 'ACCEPTED' }[] = [
  { post: 'p2', sender: 'lumen', amount: 10 * L, status: 'PENDING', message: 'We would like to own the hackathon. Our team can set an API-design problem statement and send four engineers as mentors for the full 36 hours.' },
  { post: 'p2', sender: 'kestrel', amount: 8 * L, status: 'PENDING', message: 'Kestrel would love to fuel the hackathon: product for all 1,200 participants overnight plus the cash component at your minimum tier.' },
  { post: 'p1', sender: 'northwind', amount: 25 * L, status: 'ACCEPTED', message: 'Northwind Bank would like to fund 25,000 saplings as part of our climate CSR mandate, with two employee volunteering days.' },
  { post: 'p3', sender: 'strides', amount: 2 * L, status: 'PENDING', message: 'Our university chapter fields a track team of 40 athletes at Delhi University with a full season calendar from January to April.' },
  { post: 'p6', sender: 'priya', amount: 1 * L, status: 'PENDING', message: 'I run a monthly builders meetup in Kochi with around 180 regulars. A grant would let us move to a proper venue and record the talks.' },
  { post: 'p8', sender: 'greenroots', amount: 12 * L, status: 'PENDING', message: 'Alongside planting, we run savings groups for the women who staff our nurseries. We would like to formalise this into a curriculum.' },
];

// Who is verified, who is waiting, and who has not asked yet.
const VERIFIED: Record<string, Verification> = { greenroots: 'VERIFIED', northwind: 'VERIFIED', kestrel: 'VERIFIED', techfest: 'PENDING' };
const REG: Record<string, [string, string]> = { greenroots: ['80G and CSR-1', 'CSR00012345'], northwind: ['Company (CIN)', 'L65110MH1994PLC000001'], kestrel: ['Company (CIN)', 'U15549KA2018PTC000002'], techfest: ['Institute letter', 'IITB/SA/2026/117'] };

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private log = new Logger('Seed');
  constructor(
    @InjectRepository(Org) private orgs: Repository<Org>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Post) private posts: Repository<Post>,
    @InjectRepository(Proposal) private proposals: Repository<Proposal>,
    private config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if ((await this.users.count()) > 0) return;
    // Demo accounts share DEMO_PASSWORD from .env. Without it they get an unusable random password.
    const password = this.config.get<string>('DEMO_PASSWORD') || randomBytes(24).toString('hex');
    const passwordHash = await bcrypt.hash(password, 10);

    const orgByKey = new Map<string, Org>();
    const userByKey = new Map<string, User>();
    for (const u of USERS) {
      const status = VERIFIED[u.key] ?? 'UNVERIFIED';
      const org = await this.orgs.save(this.orgs.create({
        name: u.orgName, nameKey: orgKey(u.orgName), type: u.orgType, bio: u.bio, location: u.location,
        verification: status, regType: REG[u.key]?.[0] ?? '', regNumber: REG[u.key]?.[1] ?? '', verificationAt: status === 'UNVERIFIED' ? null : new Date(),
      }));
      orgByKey.set(u.key, org);
      userByKey.set(u.key, await this.users.save(this.users.create({ email: u.email, name: u.name, passwordHash, orgId: org.id, role: 'OWNER', memberStatus: 'ACTIVE' })));
    }

    // a team: one colleague already in, one waiting for approval
    const green = orgByKey.get('greenroots')!;
    await this.users.save(this.users.create({ email: 'ravi@greenroots.demo', name: 'Ravi Kulkarni', passwordHash, orgId: green.id, role: 'MEMBER', memberStatus: 'ACTIVE' }));
    await this.users.save(this.users.create({ email: 'neha.joshi@example.demo', name: 'Neha Joshi', passwordHash, orgId: green.id, role: 'MEMBER', memberStatus: 'PENDING' }));

    // MatchMint staff, who review verification requests (see ADMIN_EMAILS)
    const staff = await this.orgs.save(this.orgs.create({ name: 'MatchMint', nameKey: orgKey('MatchMint'), type: 'COMPANY', bio: 'The team behind MatchMint.', location: 'India', verification: 'VERIFIED', verificationAt: new Date() }));
    await this.users.save(this.users.create({ email: 'admin@matchmint.demo', name: 'MatchMint Admin', passwordHash, orgId: staff.id, role: 'OWNER', memberStatus: 'ACTIVE' }));

    const postByKey = new Map<string, Post>();
    let i = 0;
    for (const { key, owner, ...p } of POSTS) {
      const createdAt = new Date(Date.now() - i++ * 1000 * 60 * 60 * 19);
      postByKey.set(key, await this.posts.save(this.posts.create({ ...p, orgId: orgByKey.get(owner)!.id, authorId: userByKey.get(owner)!.id, status: 'OPEN', createdAt })));
    }

    for (const pr of PROPOSALS) {
      const post = postByKey.get(pr.post)!;
      const sender = userByKey.get(pr.sender)!;
      await this.proposals.save(this.proposals.create({
        postId: post.id, senderOrgId: sender.orgId, senderId: sender.id, payerOrgId: post.kind === 'OFFER' ? post.orgId : sender.orgId,
        message: pr.message, amount: pr.amount, status: pr.status, decidedAt: pr.status === 'ACCEPTED' ? new Date() : null,
      }));
    }
    this.log.log(`Seeded ${USERS.length + 1} organisations, ${POSTS.length} posts and ${PROPOSALS.length} proposals`);
  }
}
