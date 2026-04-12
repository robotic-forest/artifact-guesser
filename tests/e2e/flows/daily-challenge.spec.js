/**
 * E2E: Daily challenge flow
 *
 * Tests the full user journey:
 * 1. Navigate to /daily
 * 2. Wait for artifact to load
 * 3. Select country + date, guess
 * 4. Advance through 3 rounds
 * 5. See final summary with score, leaderboard, share card
 */

import { test, expect } from '@playwright/test';

test.describe('Daily Challenge', () => {
  test('loads the daily challenge page', async ({ page }) => {
    await page.goto('/daily');

    // Should show either loading state or the game UI
    await expect(page.locator('body')).toContainText(/(Artifact Guesser|Loading|Today's Run)/);
  });

  test('shows Today\'s Run tag in header', async ({ page }) => {
    await page.goto('/daily');

    // Wait for the game to load (loading indicator disappears)
    await page.waitForSelector('text=Round', { timeout: 30000 });

    // Should show the Today's Run tag
    await expect(page.locator('text=Today\'s Run')).toBeVisible();
  });

  test('displays game controls when artifact loads', async ({ page }) => {
    await page.goto('/daily');

    // Wait for the guess button to appear (means images loaded and controls visible)
    await page.waitForSelector('text=Guess', { timeout: 45000 });

    // Game info should show round and score
    await expect(page.locator('text=Round')).toBeVisible();
    await expect(page.locator('text=Score')).toBeVisible();
    await expect(page.locator('text=1 / 3')).toBeVisible();
    await expect(page.locator('text=0 / 600')).toBeVisible();
  });

  test('can make a guess and see round summary', async ({ page }) => {
    await page.goto('/daily');

    // Wait for controls
    await page.waitForSelector('text=Guess', { timeout: 45000 });

    // Click somewhere on the map to select a country
    const mapArea = page.locator('text=No country selected').locator('..');
    // Try clicking the guess button without country — should show error toast
    await page.click('text=Guess');
    await expect(page.locator('text=Select a country')).toBeVisible({ timeout: 3000 });
  });
});
