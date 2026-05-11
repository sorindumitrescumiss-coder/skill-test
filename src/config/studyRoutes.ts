import { PASTED_WEB_STUDY_PROJECT_URL } from '@/config/webStudyProjectUrl';

/** Short studying intro (same app shell). */
export const STUDYING_OVERVIEW_HREF = '/studying';
/** Entry page that lists study items before going deeper. */
export const STUDYING_ITEMS_HREF = '/studying/items';
/** Page listing core web programming languages. */
export const STUDYING_LANGUAGE_LIST_HREF = '/studying/languages';
/** Auto-generated list of all projects in `studying/web code`. */
export const STUDYING_WEB_CODE_PROJECTS_HREF = '/studying/web-code-projects';

/** Hub page listing demos from the bundled `studying/Ultimate-Web-Development-Resources-main` tree (served under `/ultimate-web-development-resources-main`). */
export const STUDYING_WEB_RESOURCES_HREF = '/studying/web-resources';

/** Static root for the copied Ultimate Web Development Resources folder (see `public/ultimate-web-development-resources-main`). */
export const BUNDLED_ULTIMATE_WEB_DEV_STATIC_ROOT = '/ultimate-web-development-resources-main';

/**
 * Where “Web · Full stack” / Open web study goes.
 * Resolution: pasted URL → `NEXT_PUBLIC_WEB_STUDY_PROJECT_URL` → {@link STUDYING_ITEMS_HREF}.
 */
export function getWebDevelopmentStudyHref(): string {
  const pasted = PASTED_WEB_STUDY_PROJECT_URL?.trim();
  if (pasted) return pasted;
  const fromEnv = process.env.NEXT_PUBLIC_WEB_STUDY_PROJECT_URL?.trim();
  if (fromEnv) return fromEnv;
  return STUDYING_ITEMS_HREF;
}

/** Learning World card primary link: study hubs where they exist, otherwise skill test deep link. */
export function getLearningWorldTrackHref(fieldId: string): string {
  switch (fieldId) {
    case 'web-development':
      return getWebDevelopmentStudyHref();
    case 'ai':
      return '/studying/ai-items';
    case 'game-development':
      return '/studying/game-items';
    case 'blockchain':
      return '/studying/blockchain-items';
    case 'architecture':
      return '/studying/architecture-items';
    case 'art':
      return '/studying/art-items';
    case 'marketing':
      return '/studying/marketing-items';
    case 'multimedia':
      return '/studying/multimedia-items';
    case 'mobile-development':
      return '/studying/mobile-development-items';
    case 'desktop-applications':
      return '/studying/desktop-applications-items';
    case 'embedded-iot':
      return '/studying/embedded-iot-items';
    case 'devops-cloud':
      return '/studying/devops-cloud-items';
    case 'cybersecurity':
      return '/studying/cybersecurity-items';
    case 'data-engineering':
      return '/studying/data-engineering-items';
    case 'product-design':
      return '/studying/product-design-items';
    case 'business-finance':
      return '/studying/business-finance-items';
    case 'photography':
      return '/studying/photography-items';
    case 'music-production':
      return '/studying/music-production-items';
    default:
      return `/skill-test?field=${encodeURIComponent(fieldId)}`;
  }
}

/** Primary button label on Learning World cards when the destination is a study hub (not the skill test). */
export function getLearningWorldTrackCtaLabel(fieldId: string): string | undefined {
  switch (fieldId) {
    case 'web-development':
      return 'Open web study';
    case 'ai':
      return 'Open AI study';
    case 'game-development':
      return 'Open game study';
    case 'blockchain':
      return 'Open blockchain study';
    case 'architecture':
      return 'Open architecture study';
    case 'art':
      return 'Open art study';
    case 'marketing':
      return 'Open marketing study';
    case 'multimedia':
      return 'Open multimedia study';
    case 'mobile-development':
      return 'Open mobile study';
    case 'desktop-applications':
      return 'Open desktop study';
    case 'embedded-iot':
      return 'Open embedded / IoT study';
    case 'devops-cloud':
      return 'Open DevOps / cloud study';
    case 'cybersecurity':
      return 'Open cybersecurity study';
    case 'data-engineering':
      return 'Open data engineering study';
    case 'product-design':
      return 'Open product design study';
    case 'business-finance':
      return 'Open business & finance study';
    case 'photography':
      return 'Open photography study';
    case 'music-production':
      return 'Open music production study';
    default:
      return undefined;
  }
}
