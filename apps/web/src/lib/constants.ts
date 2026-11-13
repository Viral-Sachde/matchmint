import type { Need, OrgType, PostKind } from "./types";

// Ordered by who MatchMint serves first.
export const CATEGORIES = ["Startup", "NGO", "Business", "College Fest", "Community", "University", "Creator", "Conference", "Sports", "Expo"] as const;

export const CATEGORY_INFO: Record<string, { plural: string; blurb: string; seeks: string; tone: string; img: string }> = {
  Startup: { plural: "Startups", blurb: "Young companies looking for pilots, grants and first partners.", seeks: "pilots, grants, first partners", tone: "slate", img: "/img/startup.jpg" },
  NGO: { plural: "NGOs", blurb: "Registered causes with measurable impact.", seeks: "CSR funding, donors, volunteers", tone: "pine", img: "/img/ngo.jpg" },
  Business: { plural: "Businesses", blurb: "Established companies looking for partners, or with a budget to give.", seeks: "partners, co-marketing, causes to back", tone: "navy", img: "/img/business.jpg" },
  "College Fest": { plural: "College fests", blurb: "Tech, cultural and management festivals.", seeks: "title sponsors, stalls, prizes", tone: "olive", img: "/img/fest.jpg" },
  Community: { plural: "Communities", blurb: "Clubs, collectives and member networks.", seeks: "venue, grants, brand partners", tone: "maroon", img: "/img/community.jpg" },
  University: { plural: "Universities", blurb: "Departments, clubs, labs and placement cells.", seeks: "research and lab partners", tone: "ice", img: "/img/university.jpg" },
  Creator: { plural: "Creators", blurb: "Channels, podcasts, newsletters and series.", seeks: "series and episode sponsors", tone: "salmon", img: "/img/creator.jpg" },
  Conference: { plural: "Conferences", blurb: "Summits, meetups and community-run events.", seeks: "event sponsors, speakers", tone: "blue", img: "/img/conference.jpg" },
  Sports: { plural: "Sports", blurb: "Teams, leagues, races and tournaments.", seeks: "kit, travel, title sponsors", tone: "forest", img: "/img/sports.jpg" },
  Expo: { plural: "Expos", blurb: "Trade shows and industry exhibitions.", seeks: "exhibitors, pavilion partners", tone: "plum", img: "/img/expo.jpg" },
};

export const NEED_LABEL: Record<Need, string> = { FUNDING: "Funding", SPONSORSHIP: "Sponsorship", PARTNERSHIP: "Partnership", IN_KIND: "In-kind support" };
export const KIND_LABEL: Record<PostKind, string> = { REQUEST: "Seeking", OFFER: "Offering" };
export const ORG_LABEL: Record<OrgType, string> = {
  INDIVIDUAL: "Individual", NGO: "NGO", COMPANY: "Company", BRAND: "Brand", UNIVERSITY: "University", CREATOR: "Creator", COMMUNITY: "Community", EVENT: "Event or fest",
};
