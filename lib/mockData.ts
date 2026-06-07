// lib/mockData.ts — Complete mock tailoring run for static UI
import type {
  ResumeProfile,
  JobDescriptionProfile,
  MatchScore,
  TailoredResume,
  GapAnalysis,
  BulletRewrite,
  ResumeGap,
  Experience,
} from "@/lib/schemas";

// ── Resume: Priya Sharma ───────────────────────────────────────
export const MOCK_RESUME: ResumeProfile = {
  contact: {
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    linkedin: "linkedin.com/in/priyasharma",
    website: undefined,
  },
  summary:
    "Product-minded software engineer with 3 years of experience building consumer-facing features. Skilled in React, TypeScript, and Python. Passionate about data-driven product decisions and user-centric development.",
  skills: [
    "React",
    "TypeScript",
    "JavaScript",
    "Python",
    "Node.js",
    "PostgreSQL",
    "Git",
    "REST APIs",
    "HTML/CSS",
    "Tailwind CSS",
  ],
  experience: [
    {
      company: "Swiggy",
      title: "Software Engineer",
      startDate: "Jul 2022",
      endDate: "Present",
      bullets: [
        { text: "Built the restaurant onboarding dashboard in React and TypeScript, reducing onboarding time by 30% for 500+ restaurant partners monthly." },
        { text: "Designed and implemented REST APIs for the menu management system, handling 200K daily requests with 99.5% uptime." },
        { text: "Collaborated with product and design teams to launch a new ratings feature used by 2M+ monthly active users." },
      ],
    },
    {
      company: "Zoho",
      title: "Associate Software Engineer",
      startDate: "Aug 2020",
      endDate: "Jun 2022",
      bullets: [
        { text: "Developed frontend components for the CRM dashboard using React, improving page load performance by 25%." },
        { text: "Wrote Python scripts to automate data migration for enterprise clients, saving 15 hours of manual work per migration." },
        { text: "Participated in code reviews and mentored 2 interns during their onboarding." },
      ],
    },
  ],
  projects: [
    {
      name: "FoodDash — Restaurant Analytics Tool",
      description: "Side project: analytics dashboard for small restaurants to track order trends.",
      bullets: ["Built with Next.js, TypeScript, and PostgreSQL", "200+ active restaurant owners"],
    },
  ],
  education: [
    {
      institution: "Anna University, Chennai",
      degree: "B.Tech",
      field: "Computer Science",
      startDate: "2016",
      endDate: "2020",
    },
  ],
  certifications: [],
};

// ── JD: Meesho APM ─────────────────────────────────────────────
export const MOCK_JD: JobDescriptionProfile = {
  jobTitle: "Associate Product Manager",
  company: "Meesho",
  requiredSkills: [
    "SQL",
    "Data Analysis",
    "A/B Testing",
    "Product Sense",
    "Stakeholder Management",
  ],
  preferredSkills: [
    "Python",
    "Tableau",
    "Figma",
    "User Research",
  ],
  responsibilities: [
    "Define product roadmap and prioritize features based on user data and business impact",
    "Work with engineering, design, and business teams to ship product improvements",
    "Analyze product metrics and run A/B experiments to validate hypotheses",
    "Write product requirement documents (PRDs) and user stories",
    "Conduct user research and competitive analysis",
  ],
  qualifications: [
    "1-3 years of experience in product management or technical role transitioning to PM",
    "Strong analytical skills with proficiency in SQL",
    "Experience with A/B testing and experimentation frameworks",
  ],
  tools: ["SQL", "Excel", "Mixpanel", "Figma", "Jira"],
  keywords: [
    "product management",
    "APM",
    "SQL",
    "A/B testing",
    "data analysis",
    "user research",
    "PRD",
    "roadmap",
    "metrics",
    "experimentation",
    "stakeholder management",
    "product sense",
    "consumer tech",
    "e-commerce",
  ],
  seniorityLevel: "entry",
  domainSignals: ["e-commerce", "consumer tech", "B2C"],
};

// ── Original Match Score ───────────────────────────────────────
export const MOCK_ORIGINAL_SCORE: MatchScore = {
  overallScore: 61,
  skillCoverageScore: 55,
  responsibilityAlignmentScore: 58,
  keywordScore: 65,
  seniorityScore: 72,
  criticalMissingRequirements: [
    "SQL proficiency",
    "A/B testing experience",
    "Product roadmap experience",
  ],
  explanation:
    "Priya has strong engineering experience but limited product management exposure. Her technical skills in Python and data work are relevant, but she lacks explicit PM artifacts like PRDs, roadmaps, and A/B testing. SQL is a notable gap. With targeted rewrites, her analytical and cross-functional work can be reframed to better match PM expectations.",
};

// ── Tailored Match Score ───────────────────────────────────────
export const MOCK_TAILORED_SCORE: MatchScore = {
  overallScore: 88,
  skillCoverageScore: 88,
  responsibilityAlignmentScore: 90,
  keywordScore: 92,
  seniorityScore: 82,
  criticalMissingRequirements: [],
  explanation:
    "After tailoring, Priya's engineering experience is strongly reframed to highlight product thinking, data-driven decisions, stakeholder collaboration, and user research. The tailored resume now closely aligns with APM requirements — product sense, metrics analysis, cross-functional work, and feature ownership are clearly demonstrated. Remaining gaps are minor and can be addressed with learning markers.",
};

// ── Tailored Bullet Rewrites ───────────────────────────────────
const SWIGGY_BULLETS: BulletRewrite[] = [
  {
    original:
      "Built the restaurant onboarding dashboard in React and TypeScript, reducing onboarding time by 30% for 500+ restaurant partners monthly.",
    tailored:
      "Led development of a restaurant onboarding product that reduced partner onboarding time by 30%, impacting 500+ monthly users — collaborated with product to define success metrics and iterate on UX.",
    changeReason:
      "Reframed as product-led initiative; added collaboration and metrics language relevant to PM roles.",
    keywordsAddressed: ["product management", "metrics", "user research"],
    confidence: "high",
    riskFlag: undefined,
  },
  {
    original:
      "Designed and implemented REST APIs for the menu management system, handling 200K daily requests with 99.5% uptime.",
    tailored:
      "Designed scalable APIs powering a menu management platform serving 200K daily requests — worked with stakeholders to define API contracts and prioritize reliability features based on partner feedback.",
    changeReason:
      "Added stakeholder collaboration and prioritization language. Emphasized product thinking behind technical decisions.",
    keywordsAddressed: ["stakeholder management", "data analysis"],
    confidence: "high",
    riskFlag: undefined,
  },
  {
    original:
      "Collaborated with product and design teams to launch a new ratings feature used by 2M+ monthly active users.",
    tailored:
      "Partnered with product and design to ship a user-facing ratings feature, contributing to requirements gathering, sprint planning, and post-launch metric analysis — feature adopted by 2M+ MAU.",
    changeReason:
      "Expanded to show PM-adjacent activities: requirements gathering, sprint planning, metric analysis.",
    keywordsAddressed: ["product management", "PRD", "metrics", "experimentation"],
    confidence: "medium",
    riskFlag: "Original role may not have included formal PRD writing — verify before claiming.",
  },
];

const ZOHO_BULLETS: BulletRewrite[] = [
  {
    original:
      "Developed frontend components for the CRM dashboard using React, improving page load performance by 25%.",
    tailored:
      "Improved CRM dashboard performance by 25% through frontend optimization — analyzed user pain points via support tickets and prioritized fixes based on customer impact data.",
    changeReason:
      "Added data-driven decision framing and user-centric language.",
    keywordsAddressed: ["data analysis", "product sense", "consumer tech"],
    confidence: "high",
    riskFlag: undefined,
  },
  {
    original:
      "Wrote Python scripts to automate data migration for enterprise clients, saving 15 hours of work per migration.",
    tailored:
      "Built Python automation tools that reduced data migration time by 15 hrs/client — used to inform product decisions on enterprise onboarding flows.",
    changeReason:
      "Connected automation work to product-level impact and decision-making.",
    keywordsAddressed: ["Python", "data analysis", "product management"],
    confidence: "medium",
    riskFlag: "Product decision framing is inferred — confirm actual involvement.",
  },
  {
    original:
      "Participated in code reviews and mentored 2 interns during their onboarding.",
    tailored:
      "Mentored 2 interns through structured onboarding and contributed to engineering best practices via code reviews — built reusable onboarding documentation adopted across the team.",
    changeReason:
      "Added documentation/process improvement angle relevant to PM stakeholder management.",
    keywordsAddressed: ["stakeholder management"],
    confidence: "high",
    riskFlag: undefined,
  },
];

// ── Tailored Resume ────────────────────────────────────────────
export const MOCK_TAILORED_RESUME: TailoredResume = {
  tailoredSummary:
    "Product-oriented software engineer with 3 years of experience building data-informed consumer features at scale. Skilled at bridging engineering, product, and design to ship features used by millions. Strong analytical foundation with Python and metrics-driven decision-making. Seeking to transition into product management to drive roadmap and strategy.",
  tailoredSkills: [
    "Product Strategy",
    "Data Analysis",
    "Python",
    "React",
    "TypeScript",
    "Stakeholder Management",
    "A/B Testing",
    "User Research",
    "Roadmap Planning",
    "SQL (intermediate)",
    "REST APIs",
    "PostgreSQL",
    "Git",
    "Figma (familiar)",
  ],
  tailoredExperience: [
    {
      company: "Swiggy",
      title: "Software Engineer",
      bullets: SWIGGY_BULLETS,
    },
    {
      company: "Zoho",
      title: "Associate Software Engineer",
      bullets: ZOHO_BULLETS,
    },
  ],
};

// ── Gap Analysis ───────────────────────────────────────────────
export const MOCK_GAP_ANALYSIS: GapAnalysis = {
  gaps: [
    {
      name: "SQL Proficiency",
      importance: "high",
      jdEvidence:
        "JD lists SQL as a required skill: 'Strong analytical skills with proficiency in SQL'",
      resumeEvidence: "Resume lists PostgreSQL but not SQL directly — may imply familiarity.",
      suggestedAction:
        "If you have SQL experience, add it explicitly to your skills section. If not, add 'SQL (learning)' and prepare to discuss in interviews.",
      canSafelyAdd: false,
    },
    {
      name: "A/B Testing Experience",
      importance: "medium",
      jdEvidence:
        "JD requires: 'Analyze product metrics and run A/B experiments to validate hypotheses'",
      resumeEvidence:
        "Ratings feature launch may have involved experimentation, but A/B testing is not explicitly mentioned.",
      suggestedAction:
        "If you have run any experiments (even informal), add a bullet describing the test and result. Otherwise, study A/B testing frameworks before interviews.",
      canSafelyAdd: true,
    },
    {
      name: "Figma / Design Tools",
      importance: "low",
      jdEvidence:
        "JD lists Figma under preferred skills and tools.",
      resumeEvidence: "Not mentioned in resume.",
      suggestedAction:
        "If you have used Figma for mockups or design collaboration, add to skills. Otherwise, mention 'Figma (familiar)' if you've viewed designs — no need to fabricate expertise.",
      canSafelyAdd: true,
    },
  ],
};

// ── Aggregate Run ──────────────────────────────────────────────
export const MOCK_RUN = {
  resumeRaw: `Priya Sharma
priya.sharma@email.com | +91 98765 43210 | Bangalore, India | linkedin.com/in/priyasharma

SUMMARY
Product-minded software engineer with 3 years of experience building consumer-facing features. Skilled in React, TypeScript, and Python. Passionate about data-driven product decisions and user-centric development.

SKILLS
React, TypeScript, JavaScript, Python, Node.js, PostgreSQL, Git, REST APIs, HTML/CSS, Tailwind CSS

EXPERIENCE
Software Engineer | Swiggy | Jul 2022 – Present
- Built the restaurant onboarding dashboard in React and TypeScript, reducing onboarding time by 30% for 500+ restaurant partners monthly.
- Designed and implemented REST APIs for the menu management system, handling 200K daily requests with 99.5% uptime.
- Collaborated with product and design teams to launch a new ratings feature used by 2M+ monthly active users.

Associate Software Engineer | Zoho | Aug 2020 – Jun 2022
- Developed frontend components for the CRM dashboard using React, improving page load performance by 25%.
- Wrote Python scripts to automate data migration for enterprise clients, saving 15 hours of manual work per migration.
- Participated in code reviews and mentored 2 interns during their onboarding.

PROJECTS
FoodDash — Restaurant Analytics Tool | Side project
- Analytics dashboard for small restaurants to track order trends. Built with Next.js, TypeScript, and PostgreSQL. 200+ active restaurant owners.

EDUCATION
B.Tech Computer Science | Anna University, Chennai | 2016 – 2020`,

  jdRaw: `Associate Product Manager — Meesho

About the Role
We are looking for an Associate Product Manager to join our product team at Meesho. You will work on defining product strategy, prioritizing features, and collaborating with engineering and design to ship impactful consumer experiences.

Responsibilities
- Define product roadmap and prioritize features based on user data and business impact
- Work with engineering, design, and business teams to ship product improvements
- Analyze product metrics and run A/B experiments to validate hypotheses
- Write product requirement documents (PRDs) and user stories
- Conduct user research and competitive analysis

Requirements
- 1-3 years of experience in product management or technical role transitioning to PM
- Strong analytical skills with proficiency in SQL
- Experience with A/B testing and experimentation frameworks

Preferred
- Experience with Python, Tableau, Figma, or similar tools
- Background in e-commerce or consumer tech
- User research experience`,
};
