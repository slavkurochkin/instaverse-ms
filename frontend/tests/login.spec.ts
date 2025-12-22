import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { testCredentials } from './utils/testCredentials';
import { loginViaAPI, loginViaAPIOnly } from './utils/auth';

test('login via UI', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);

  await loginPage.goto();
  await loginPage.login(
    testCredentials.admin.email,
    testCredentials.admin.password,
  );
  await expect(homePage.shareStoryHeading).toBeVisible();
});

test('login via API', async ({ request }) => {
  const responseBody = await loginViaAPIOnly(
    request,
    testCredentials.admin.email,
    testCredentials.admin.password,
  );

  expect(responseBody).toHaveProperty('token');
  expect(responseBody).toHaveProperty('result');
  expect(responseBody.result).toHaveProperty(
    'email',
    testCredentials.admin.email,
  );
  expect(responseBody.message).toBe('Login successful');
});

test('login via API and navigate page', async ({ page, request }) => {
  // Login via API and set token in localStorage
  await loginViaAPI(
    request,
    page,
    testCredentials.admin.email,
    testCredentials.admin.password,
  );

  // Navigate to the home page
  await page.goto('http://localhost:3000/');

  // Verify user is logged in by checking for authenticated content
  const homePage = new HomePage(page);
  await expect(homePage.shareStoryHeading).toBeVisible();
});
