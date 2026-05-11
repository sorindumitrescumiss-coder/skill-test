import { redirect } from 'next/navigation';
import { STUDYING_WEB_RESOURCES_HREF } from '@/config/studyRoutes';

/** Legacy route — forwards to the web-resources hub. */
export default function UltimateWebResourcesLegacyRedirect() {
  redirect(STUDYING_WEB_RESOURCES_HREF);
}
