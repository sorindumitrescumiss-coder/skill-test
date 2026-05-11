import { FIELD_OPTIONS } from '@/app/skill-test/fieldOptions';
import {
  getLearningWorldTrackCtaLabel,
  getLearningWorldTrackHref,
  getWebDevelopmentStudyHref,
} from '@/config/studyRoutes';

const WEB_FULL_STACK_HREF = getWebDevelopmentStudyHref();

/** @deprecated Use `getWebDevelopmentStudyHref()` or track href from {@link LEARNING_TRACKS}. */
export const WEB_FULL_STACK_STUDY_ENTRY = WEB_FULL_STACK_HREF;

export type LearningTrackItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  /** Primary button label on the learning card (default: open skill tests). */
  ctaLabel?: string;
  tags: string[];
};

/** One card per skill-test field — stays in sync with `FIELD_OPTIONS` on the skill page. */
export const LEARNING_TRACKS: LearningTrackItem[] = FIELD_OPTIONS.map((field) => ({
  id: field.id,
  title: field.id === 'web-development' ? 'Web · Full stack' : field.label,
  subtitle: `${field.topics.length} topic areas`,
  description: `Choose subtopics and languages, then run the TrueAssess AI skill test for ${field.label.toLowerCase()}.`,
  href: getLearningWorldTrackHref(field.id),
  ctaLabel: getLearningWorldTrackCtaLabel(field.id),
  tags: field.topics.slice(0, 7).map((t) => String(t)),
}));
