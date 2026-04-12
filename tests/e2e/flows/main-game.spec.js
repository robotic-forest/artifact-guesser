/**
 * E2E: Main game (personal game at /)
 *
 * Tests the core game loop for unauthenticated users.
 */

import { test, expect } from '@playwright/test';

test.describe('Main Game', () => {
  test('loads the homepage with the game', async ({ page }) => {
    await page.goto('/');

    // Should show the Artifact Guesser header
    await expect(page.locator('text=Artifact Guesser')).toBeVisible({ timeout: 15000 });
  });

  test('shows game controls when artifact loads', async ({ page }) => {
    await page.goto('/');

    // Wait for the guess button
    await page.waitForSelector('text=Guess', { timeout: 45000 });

    // Should show round 1/5 and score 0
    await expect(page.locator('text=1 / 5')).toBeVisible();
  });

  test('header has Today\'s Run link', async ({ page }) => {
    await page.goto('/');

    // Wait for the header to load
    await page.waitForSelector('text=Artifact Guesser', { timeout: 15000 });

    // The calendar icon button should link to /daily
    const dailyLink = page.locator('a[href="/daily"]');
    await expect(dailyLink).toBeVisible({ timeout: 5000 });
  });

  test('shows error toast when guessing without country', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('text=Guess', { timeout: 45000 });

    await page.click('text=Guess');
    await expect(page.locator('text=Select a country')).toBeVisible({ timeout: 3000 });
  });
});
