import type { LucideIcon } from 'lucide-react';
import {
  Brain,
  Cloud,
  Code2,
  Database,
  Gamepad2,
  Link2,
  Shield,
  Smartphone,
} from 'lucide-react';

export type SkillTestTrack = {
  fieldId: string;
  title: string;
  tagline: string;
  purpose: string;
  highlights: string[];
  marks: string[];
  price: string;
  duration: string;
  access: string;
  iconClass: string;
  iconTint: string;
  Icon: LucideIcon;
  cardImageSrc?: string;
  cardImageAlt?: string;
};

export type ResearchHubArticle = {
  image: string;
  imageAlt: string;
  category: string;
  readTime: string;
  title: string;
  date: string;
  href: string;
};

export const ALUMNI_TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    followersLabel: 'LinkedIn followers',
    followers: '98K+',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&q=80',
    quote:
      'TrueAssess certifications gave our engineering team the structured, research-backed curriculum we needed to ship enterprise-grade solutions with confidence.',
  },
  {
    name: 'Marcus Webb',
    followersLabel: 'LinkedIn followers',
    followers: '42K+',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&h=160&fit=crop&q=80',
    quote:
      'The assessments mapped cleanly to how we hire — verified skills instead of buzzwords. Candidates with credentials stood out immediately in our pipeline.',
  },
  {
    name: 'Elena Vasquez',
    followersLabel: 'LinkedIn followers',
    followers: '120K+',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&q=80',
    quote:
      'From prep to credential, the flow felt serious but fair. My NFT-backed credential gets opens from recruiters that ignored my resume alone.',
  },
] as const;

/** Employer logos: favicon loaded by domain (same pattern as typical “logo clouds”). */
export const ALUMNI_ORGS: readonly { name: string; domain: string }[] = [
  { name: 'Microsoft', domain: 'microsoft.com' },
  { name: 'IBM', domain: 'ibm.com' },
  { name: 'KPMG', domain: 'kpmg.com' },
  { name: 'GlobalLogic', domain: 'globallogic.com' },
  { name: 'Cognizant', domain: 'cognizant.com' },
  { name: 'Dubai Customs', domain: 'dubai.ae' },
  { name: 'CGI', domain: 'cgi.com' },
  { name: 'Pepsi', domain: 'pepsi.com' },
  { name: 'Capgemini', domain: 'capgemini.com' },
  { name: 'Citizens Financial Group', domain: 'citizensbank.com' },
  { name: 'EY', domain: 'ey.com' },
  { name: 'Accenture', domain: 'accenture.com' },
  { name: 'Cloudchain', domain: 'cloudchain.com' },
  { name: 'TCS', domain: 'tcs.com' },
  { name: 'NetSPI', domain: 'netspi.com' },
  { name: 'SAP', domain: 'sap.com' },
];

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

function AlumniEmployerTile({ name, domain }: { name: string; domain: string }) {
  const [iconFailed, setIconFailed] = React.useState(false);
  const initials = React.useMemo(() => {
    const parts = name.replace(/[^a-zA-Z ]/g, '').split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  return (
    <div className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-parchment-300/55 bg-parchment-150/85 px-2 py-3 text-center shadow-[0_2px_8px_-4px_rgba(30,41,59,0.1)]">
      {!iconFailed ? (
        <img
          src={faviconUrl(domain)}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          loading="lazy"
          decoding="async"
          onError={() => setIconFailed(true)}
        />
      ) : (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-parchment-150/90 font-sans text-[11px] font-bold tabular-nums text-stone-600"
          aria-hidden
        >
          {initials}
        </div>
      )}
      <span className="max-w-full text-[10px] font-semibold leading-snug text-stone-700 sm:text-[11px]">{name}</span>
    </div>
  );
}

export export const RESEARCH_HUB_ARTICLES: ResearchHubArticle[] = {
  image: string;
  imageAlt: string;
  category: string;
  readTime: string;
  title: string;
  date: string;
  href: string;
}[] = [
  {
    image:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Abstract blockchain visualization',
    category: 'Blockchain',
    readTime: '12 min read',
    title: 'Understanding Zero-Knowledge Proofs: A Comprehensive Guide',
    date: 'Feb 28, 2026',
    href: '#',
  },
  {
    image:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Artificial intelligence concept',
    category: 'Artificial Intelligence',
    readTime: '9 min read',
    title: 'Responsible AI in Production: Patterns Teams Actually Ship',
    date: 'Feb 22, 2026',
    href: '#',
  },
  {
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Technology and connected world',
    category: 'Web3',
    readTime: '15 min read',
    title: 'Credentials and Identity: What Changes When Talent Is Verifiable',
    date: 'Feb 18, 2026',
    href: '#',
  },
];

export const SKILL_TEST_TRACKS: {
  fieldId: string;
  title: string;
  tagline: string;
  purpose: string;
  highlights: string[];
  marks: string[];
  price: string;
  duration: string;
  access: string;
  iconClass: string;
  iconTint: string;
  Icon: LucideIcon;
  cardImageSrc?: string;
  cardImageAlt?: string;
}[] = [
  {
    fieldId: 'web-development',
    title: 'Web Development',
    tagline: 'Frontend + backend + database',
    purpose: 'Assess practical web development skills across frontend implementation, backend API development, and database design.',
    highlights: ['Frontend: React.js, CSS, JavaScript', 'Backend: Node.js, Django, FastAPI', 'Database: PostgreSQL'],
    marks: ['React.js', 'CSS', 'JavaScript', 'Node.js', 'Django', 'FastAPI', 'PostgreSQL'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-sky-700',
    iconTint: 'bg-sky-500/[0.11]',
    Icon: Code2,
    cardImageSrc: '/web-development-card.png',
    cardImageAlt: 'Web development learning illustration',
  },
  {
    fieldId: 'ai',
    title: 'AI & machine learning',
    tagline: 'ML, NLP, GenAI & responsible use',
    purpose: 'Evaluate your ability to build, reason about, and apply AI/ML systems responsibly in real product scenarios.',
    highlights: ['Model selection', 'Prompting and GenAI', 'Responsible AI'],
    marks: ['Python', 'TensorFlow', 'NLP'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-violet-700',
    iconTint: 'bg-violet-500/[0.11]',
    Icon: Brain,
    cardImageSrc: '/ai-machine-learning-card.png',
    cardImageAlt: 'AI and machine learning abstract visual',
  },
  {
    fieldId: 'devops-cloud',
    title: 'Cloud & DevOps',
    tagline: 'Containers, CI/CD & infrastructure',
    purpose: 'Measure readiness for cloud operations, delivery pipelines, automation, and infrastructure reliability decisions.',
    highlights: ['CI/CD workflows', 'Cloud infra basics', 'Reliability mindset'],
    marks: ['Docker', 'Kubernetes', 'CI/CD'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-cyan-700',
    iconTint: 'bg-cyan-500/[0.11]',
    Icon: Cloud,
    cardImageSrc: '/cloud-devops-card.png',
    cardImageAlt: 'Cloud and DevOps networking concept',
  },
  {
    fieldId: 'cybersecurity',
    title: 'Cybersecurity',
    tagline: 'Threat modeling, secure design & ops',
    purpose: 'Validate defensive security judgment in threat modeling, secure implementation, and operational risk response.',
    highlights: ['Threat modeling', 'Secure coding', 'Risk response'],
    marks: ['OWASP', 'SOC', 'Secure Code'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-emerald-700',
    iconTint: 'bg-emerald-500/[0.11]',
    Icon: Shield,
    cardImageSrc: '/cybersecurity-card.png',
    cardImageAlt: 'Cybersecurity lock and network concept',
  },
  {
    fieldId: 'data-engineering',
    title: 'Data engineering',
    tagline: 'Pipelines, warehousing & quality',
    purpose: 'Test your ability to design robust data pipelines, maintain quality, and support analytics-ready platforms.',
    highlights: ['Data pipelines', 'Warehouse modeling', 'Data quality'],
    marks: ['SQL', 'ETL', 'Spark'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-amber-700',
    iconTint: 'bg-amber-500/[0.11]',
    Icon: Database,
    cardImageSrc: '/data-engineering-card.png',
    cardImageAlt: 'Data engineering network and analytics concept',
  },
  {
    fieldId: 'mobile-development',
    title: 'Mobile development',
    tagline: 'iOS, Android & cross-platform',
    purpose: 'Assess mobile app delivery skills including architecture choices, platform constraints, and performance trade-offs.',
    highlights: ['App architecture', 'Platform constraints', 'Performance tuning'],
    marks: ['React Native', 'Flutter', 'Android'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-rose-700',
    iconTint: 'bg-rose-500/[0.11]',
    Icon: Smartphone,
    cardImageSrc: '/mobile-development-card.png',
    cardImageAlt: 'Mobile development learning concept',
  },
  {
    fieldId: 'blockchain',
    title: 'Blockchain & Web3',
    tagline: 'Contracts, wallets & security',
    purpose: 'Check your understanding of smart contracts, wallet workflows, and security practices in Web3 ecosystems.',
    highlights: ['Smart contracts', 'Wallet flows', 'Web3 security'],
    marks: ['Solidity', 'EVM', 'Web3'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-yellow-700',
    iconTint: 'bg-yellow-500/[0.14]',
    Icon: Link2,
    cardImageSrc: '/blockchain-card.png',
    cardImageAlt: 'Blockchain and Web3 network concept',
  },
  {
    fieldId: 'game-development',
    title: 'Game development',
    tagline: 'Engines, gameplay & performance',
    purpose: 'Evaluate game dev capability in gameplay systems, engine usage, optimization, and production problem solving.',
    highlights: ['Gameplay systems', 'Engine workflows', 'Optimization'],
    marks: ['Unity', 'Unreal', 'C#'],
    price: '$19',
    duration: '1 hour',
    access: 'Per attempt',
    iconClass: 'text-fuchsia-700',
    iconTint: 'bg-fuchsia-500/[0.11]',
    Icon: Gamepad2,
    cardImageSrc: '/game-development-card.png',
    cardImageAlt: 'Game strategy concept image',
  },
];
