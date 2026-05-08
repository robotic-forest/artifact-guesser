/**
 * Playwright global setup — reuses the same MongoMemoryServer + Next.js
 * launcher as the Vitest API tests so e2e runs against an isolated DB.
 */
import { setup } from '../helpers/global-api-setup.js';

export default async () => {
  await setup();
};
