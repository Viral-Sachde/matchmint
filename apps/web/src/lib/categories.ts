import type { Need } from "./types";

/** Everything a category page needs. Amounts are typical ranges seen on the board, in rupees. */
export type CategoryPage = {
  key: string; // matches the category stored on posts
  slug: string;
  name: string; // singular, for buttons such as "Post as a startup"
  title: string; // page headline
  intro: string;
  needs: { need: Need; what: string; range: string }[];
  backersGet: string[];
  whoBacks: string;
  example: { title: string; ask: string; gives: string };
  tips: [string, string][];
  faq: [string, string][];
};

export const CATEGORY_PAGES: CategoryPage[] = [
  {
    key: "Startup", slug: "startups", name: "startup",
    title: "Pilots, grants and first partners for startups",
    intro: "You have a product and a team. What you need is a first customer to run a pilot, a grant to cover the next six months, or a partner who opens doors. Post it once and let the right companies find you.",
    needs: [
      { need: "FUNDING", what: "Grants, innovation challenges and paid pilots", range: "₹5 L to ₹1 Cr" },
      { need: "PARTNERSHIP", what: "A first customer or a distribution partner", range: "Paid pilot or revenue share" },
      { need: "IN_KIND", what: "Cloud credits, tools, office space, mentors", range: "Worth ₹50,000 to ₹25 L" },
      { need: "SPONSORSHIP", what: "Co-branded launches and events", range: "₹1 L to ₹10 L" },
    ],
    backersGet: ["Early access to a new product before it reaches the market", "Pilot results and a case study they can share", "Innovation and ESG stories for their reports", "A first look before the startup raises a round"],
    whoBacks: "Corporate innovation teams, CSR funds, accelerators and established companies",
    example: { title: "Pilot funding to turn plastic waste into building boards", ask: "₹15 L to ₹60 L", gives: "Co-branded pilot, first right to buy, diversion data for ESG reports" },
    tips: [["Lead with the result", "Say what the pilot proves, in one sentence, before you explain the technology."], ["Name the number", "A range like ₹15 L to ₹60 L gets more replies than 'open to discussion'."], ["Show what they get", "Case study, first access, data for their reports. Make the backer's win concrete."]],
    faq: [["Is this equity investment?", "No. MatchMint is for grants, pilots, sponsorship and partnerships. Equity rounds are agreed outside the platform."], ["Can a company post a challenge for startups?", "Yes. A company can post an Offering with its budget and the problem it wants solved."]],
  },
  {
    key: "NGO", slug: "ngos", name: "NGO",
    title: "CSR funding and partners for NGOs",
    intro: "Companies with CSR budgets are looking for causes with clear outcomes. Post your program with the amount you need and the impact it creates, and let CSR teams come to you.",
    needs: [
      { need: "FUNDING", what: "CSR grants for a program or a season", range: "₹2 L to ₹2 Cr" },
      { need: "PARTNERSHIP", what: "Employee volunteering and long-term partners", range: "Multi-year programs" },
      { need: "IN_KIND", what: "Supplies, equipment, skills and pro bono work", range: "Worth ₹25,000 to ₹50 L" },
      { need: "SPONSORSHIP", what: "Named drives, campaigns and events", range: "₹50,000 to ₹25 L" },
    ],
    backersGet: ["Measurable impact for their CSR and ESG reports", "Employee volunteering days that people remember", "Named programs, groves, classrooms or drives", "Stories and photos to share with their teams"],
    whoBacks: "CSR teams, foundations, banks, brands and family offices",
    example: { title: "Fund 50,000 native saplings before the monsoon", ask: "₹5 L to ₹50 L", gives: "Named grove, volunteering days, audited impact report" },
    tips: [["Put the outcome first", "50,000 saplings, 400 children, 6 schools. Lead with what the money changes."], ["Mention your registration", "Say if you are 80G or CSR-1 registered. CSR teams check this first."], ["Offer a way to take part", "Volunteering days and site visits turn a grant into a partnership."]],
    faq: [["Do you check NGO registration?", "Not yet. Backers ask for documents directly once matched. Verification is planned."], ["Can individuals back an NGO?", "Yes. Anyone can send a proposal, including people giving on their own."]],
  },
  {
    key: "Business", slug: "businesses", name: "business",
    title: "Partners and causes for businesses",
    intro: "Businesses use MatchMint both ways. Find partners for a launch or a co-marketing push, or put a sponsorship or CSR budget behind something your customers care about.",
    needs: [
      { need: "PARTNERSHIP", what: "Co-marketing, distribution and joint launches", range: "Shared budget or revenue share" },
      { need: "SPONSORSHIP", what: "Events, creators and communities to sponsor", range: "₹1 L to ₹50 L" },
      { need: "FUNDING", what: "CSR and impact programs to fund", range: "₹5 L to ₹5 Cr" },
      { need: "IN_KIND", what: "Products, services or expertise to give", range: "Any size" },
    ],
    backersGet: ["Audiences that are hard to reach with ads", "Partners that already have their customers' trust", "Proof of impact for CSR and ESG reporting", "Stories their teams are proud to share"],
    whoBacks: "Brands, retailers, banks, manufacturers and service companies",
    example: { title: "Sponsoring 10 university sports teams this season", ask: "₹1 L to ₹3 L per team", gives: "Cash, full kit and product for the season" },
    tips: [["Say which side you are on", "Post a Seeking post to find partners, or an Offering post to give a budget."], ["Describe who you want", "The clearer the fit, the better the proposals you receive."], ["Set a deadline", "A closing date gets replies faster than an open-ended post."]],
    faq: [["Can one account seek and offer?", "Yes. A business can look for a partner and sponsor a community from the same account."], ["Do you take a fee?", "No. Posting, proposals and matching are free."]],
  },
  {
    key: "College Fest", slug: "college-fests", name: "college fest",
    title: "Sponsors for college fests",
    intro: "Brands want students, and your fest brings thousands of them to one place. Post your sponsorship slots with footfall, dates and what a sponsor gets, and stop chasing brands one email at a time.",
    needs: [
      { need: "SPONSORSHIP", what: "Title, associate and event sponsors", range: "₹50,000 to ₹50 L" },
      { need: "IN_KIND", what: "Prizes, devices, cloud credits, food and drink", range: "Worth ₹10,000 to ₹10 L" },
      { need: "PARTNERSHIP", what: "Media, hiring and community partners", range: "Visibility swaps" },
      { need: "FUNDING", what: "Grants for hackathons and competitions", range: "₹1 L to ₹15 L" },
    ],
    backersGet: ["Thousands of students in one place, in person", "Stage, stall and naming visibility", "First access to talent for hiring", "Content and social reach during the fest"],
    whoBacks: "Consumer brands, tech companies, banks, edtech and recruiters",
    example: { title: "Hackathon partner for Techfest 2027", ask: "₹8 L to ₹12 L", gives: "Problem statement, judging seat, hiring access to finalists" },
    tips: [["Give real numbers", "Footfall, colleges, social reach. Sponsors compare fests on these."], ["List your slots", "Title, associate, event-level. Each with a price and what it includes."], ["Post early", "Brands plan budgets a quarter ahead. Post three months before the fest."]],
    faq: [["Can we post several sponsorship slots?", "Yes. Make one post per slot, or one post with a range and list the tiers in the description."], ["Does next year's team keep our history?", "Your account and past posts stay, so the next committee can pick up where you left off."]],
  },
  {
    key: "Community", slug: "communities", name: "community",
    title: "Grants and brand partners for communities",
    intro: "Run clubs, meetups, alumni networks and Discord groups bring people together week after week. Brands want that trust. Post what your community needs to keep going and grow.",
    needs: [
      { need: "SPONSORSHIP", what: "Season partners and event sponsors", range: "₹25,000 to ₹10 L" },
      { need: "FUNDING", what: "Community grants for venues and travel", range: "₹50,000 to ₹5 L" },
      { need: "IN_KIND", what: "Venue, food, kit and product", range: "Any size" },
      { need: "PARTNERSHIP", what: "Long-term brand or cause partners", range: "Ongoing" },
    ],
    backersGet: ["A loyal group that meets regularly", "Product sampling and honest feedback", "Content made by real members", "Goodwill that lasts longer than a campaign"],
    whoBacks: "Lifestyle and tech brands, local businesses and developer tools companies",
    example: { title: "Hydration partner for 52 Sunday runs", ask: "₹2 L to ₹9 L", gives: "Station branding, sampling, jersey logo, monthly feature" },
    tips: [["Show how often you meet", "Weekly, monthly, yearly. Regular contact is what brands pay for."], ["Count active members", "Active people matter more than total sign-ups."], ["Keep it authentic", "Say what fits your community and what does not."]],
    faq: [["Do we need to be registered?", "No. Informal communities can post. Backers may ask how payments will be handled."], ["Can members see the deal?", "Only you and the backer see proposals and contact details."]],
  },
  {
    key: "University", slug: "universities", name: "university",
    title: "Research, lab and program partners for universities",
    intro: "Departments, labs, clubs and placement cells all need partners. Post the research, program or campus initiative that needs backing, and reach companies looking for exactly that.",
    needs: [
      { need: "PARTNERSHIP", what: "Research, lab and curriculum partners", range: "Multi-year" },
      { need: "FUNDING", what: "Scholarships, chairs and program grants", range: "₹2 L to ₹1 Cr" },
      { need: "SPONSORSHIP", what: "Clubs, competitions and campus events", range: "₹25,000 to ₹10 L" },
      { need: "IN_KIND", what: "Equipment, software and expert time", range: "Any size" },
    ],
    backersGet: ["Research that solves their problems", "Early access to graduates and interns", "Their name on programs and labs", "Credibility in their field"],
    whoBacks: "Technology companies, research foundations, alumni and CSR teams",
    example: { title: "University partners for a campus rewilding program", ask: "Up to ₹4 L", gives: "Design, student training, three years of biodiversity data" },
    tips: [["Name the department", "A specific lab or club gets more replies than the whole university."], ["Explain the outcome", "A paper, a prototype, 200 trained students. Say what the backer can point to."], ["Add a contact person", "Backers want one person to talk to, not an office."]],
    faq: [["Can student clubs post?", "Yes. Clubs, cells and societies can post on their own."], ["What about research agreements?", "Agree terms directly once matched. MatchMint connects you; contracts stay with you."]],
  },
  {
    key: "Creator", slug: "creators", name: "creator",
    title: "Sponsors for creators",
    intro: "Channels, podcasts, newsletters and series reach people brands cannot buy their way to. Post the series or season you want sponsored, with your audience and what an integration looks like.",
    needs: [
      { need: "SPONSORSHIP", what: "Series, season and episode sponsors", range: "₹25,000 to ₹25 L" },
      { need: "PARTNERSHIP", what: "Long-term brand partners", range: "Monthly retainer" },
      { need: "IN_KIND", what: "Gear, software and travel", range: "Any size" },
      { need: "FUNDING", what: "Grants for documentary and education work", range: "₹1 L to ₹20 L" },
    ],
    backersGet: ["An audience that trusts the creator", "Integrations that feel natural, not like ads", "Usage rights for their own channels", "Performance reports after each piece"],
    whoBacks: "Consumer and tech brands, apps, publishers and education companies",
    example: { title: "Series sponsor for 'Build in Public', 12 episodes", ask: "₹4 L to ₹9 L", gives: "Integration in every episode, pinned link, 90-day usage rights" },
    tips: [["Share real numbers", "Average views and engagement beat follower counts."], ["Describe the integration", "Say how the sponsor appears, so there are no surprises."], ["Post a season, not a video", "Series sponsorships are easier to plan and pay better."]],
    faq: [["Do I need a minimum following?", "No. Smaller creators with a focused audience often match fastest."], ["Who owns the content?", "You do, unless you agree usage rights with the sponsor."]],
  },
  {
    key: "Conference", slug: "conferences", name: "conference",
    title: "Sponsors and partners for conferences",
    intro: "A room full of the right people is valuable. Post your event with dates, audience and sponsorship tiers, and reach companies that budget for exactly this kind of room.",
    needs: [
      { need: "SPONSORSHIP", what: "Headline, booth and session sponsors", range: "₹1 L to ₹50 L" },
      { need: "PARTNERSHIP", what: "Community, media and venue partners", range: "Visibility swaps" },
      { need: "IN_KIND", what: "Venue, catering, swag and AV", range: "Any size" },
      { need: "FUNDING", what: "Scholarships for students and speakers", range: "₹50,000 to ₹5 L" },
    ],
    backersGet: ["Decision makers in one room", "Speaking slots and workshops", "Leads from people who opted in", "Their brand beside a respected event"],
    whoBacks: "B2B companies, developer tools, investors and industry bodies",
    example: { title: "Developer conferences to sponsor in 2027", ask: "₹3 L to ₹15 L", gives: "Sponsorship fee, a hands-on workshop, scholarship tickets" },
    tips: [["Describe who attends", "Job titles and seniority matter more than total headcount."], ["List the tiers", "Name each tier, its price and what is included."], ["Show past sponsors", "Mention who backed earlier editions, if they agree."]],
    faq: [["Can sponsors post what they are looking for?", "Yes. Many companies post an Offering with their event budget for the year."], ["What about ticketing?", "Keep using your ticketing tool. MatchMint handles the sponsor side."]],
  },
  {
    key: "Sports", slug: "sports", name: "sports team",
    title: "Kit, travel and title sponsors for sports",
    intro: "Teams, leagues, races and tournaments need kit, travel and title partners. Post your season with your following and what a sponsor gets, from jersey logos to naming rights.",
    needs: [
      { need: "SPONSORSHIP", what: "Title, kit and event sponsors", range: "₹25,000 to ₹50 L" },
      { need: "IN_KIND", what: "Kit, equipment, nutrition and travel", range: "Any size" },
      { need: "FUNDING", what: "Grants for athletes and grassroots programs", range: "₹50,000 to ₹10 L" },
      { need: "PARTNERSHIP", what: "Season-long brand partners", range: "Ongoing" },
    ],
    backersGet: ["Logos on kit, bibs and podiums", "Broadcast and stream visibility", "Fans who notice and remember", "Stories of athletes they helped"],
    whoBacks: "Sports and nutrition brands, banks, telecoms and local businesses",
    example: { title: "Title sponsor for the Strides 10K", ask: "₹12 L to ₹25 L", gives: "Race naming rights, bib and medal branding, 40 entries" },
    tips: [["Show the season", "Fixtures, races and dates tell a sponsor when they will be seen."], ["Count your audience", "Spectators, streams and followers. Give each number."], ["Offer visible spots", "Jersey, banner, podium. Price each one."]],
    faq: [["Can individual athletes post?", "Yes. Pick Individual when you sign up and post as yourself."], ["Can a brand back several teams?", "Yes. Post one Offering and accept as many teams as fit your budget."]],
  },
  {
    key: "Expo", slug: "expos", name: "expo",
    title: "Exhibitors and pavilion partners for expos",
    intro: "Trade shows bring an industry together for a few days. Post your pavilion, stall or partner slots with visitor numbers and dates, and reach the companies that should be on your floor.",
    needs: [
      { need: "SPONSORSHIP", what: "Pavilion, stage and naming partners", range: "₹2 L to ₹1 Cr" },
      { need: "PARTNERSHIP", what: "Industry bodies and media partners", range: "Visibility swaps" },
      { need: "IN_KIND", what: "Venue services, logistics and tech", range: "Any size" },
      { need: "FUNDING", what: "Support for startup and student zones", range: "₹1 L to ₹10 L" },
    ],
    backersGet: ["Buyers and suppliers in one place", "Named pavilions and stages", "Leads from qualified visitors", "Standing in their industry"],
    whoBacks: "Manufacturers, industry bodies, banks and logistics companies",
    example: { title: "Pavilion partner for an auto-components expo", ask: "₹10 L to ₹35 L", gives: "Pavilion naming, seminar slot, directory listing" },
    tips: [["Say who visits", "Buyers, procurement heads, export houses. Be specific."], ["Price every slot", "Pavilion, stage, booth. Each with what it includes."], ["Give the dates early", "Exhibitors book months ahead."]],
    faq: [["Is there a board for expos yet?", "Expos are new on MatchMint. Be one of the first to post."], ["Can exhibitors find us?", "Yes. Exhibitors can browse posts and send a proposal for a stall or pavilion."]],
  },
];

export const BY_SLUG = Object.fromEntries(CATEGORY_PAGES.map((c) => [c.slug, c]));
export const SLUG_OF = Object.fromEntries(CATEGORY_PAGES.map((c) => [c.key, c.slug])) as Record<string, string>;

/** The four kinds of support, described from each side. */
export const SUPPORT: { need: Need; title: string; seeker: string; backer: string }[] = [
  { need: "FUNDING", title: "Funding", seeker: "Money for a program, a pilot or a season, usually a grant.", backer: "Put a grant or CSR budget behind work you believe in." },
  { need: "SPONSORSHIP", title: "Sponsorship", seeker: "A brand pays and gets visibility, access or content back.", backer: "Pay for visibility, access to an audience or content." },
  { need: "PARTNERSHIP", title: "Partnership", seeker: "Someone to work with over time: a pilot, a program, a launch.", backer: "Work alongside a team over months, not a one-off payment." },
  { need: "IN_KIND", title: "In-kind support", seeker: "Products, equipment, space, credits or expert time.", backer: "Give products, services, space or your team's time." },
];
