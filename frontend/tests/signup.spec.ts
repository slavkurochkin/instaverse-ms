import { test, expect } from '@playwright/test';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { testCredentials } from './utils/testCredentials';

test('user signup', async ({ page }) => {
  const signupPage = new SignupPage(page);
  const homePage = new HomePage(page);

  await signupPage.goto();
  await signupPage.signup({
    username: testCredentials.user.username,
    email: testCredentials.user.email,
    password: testCredentials.user.password,
    confirmPassword: testCredentials.user.password,
    birthdate: testCredentials.user.birthdate,
    gender: testCredentials.user.gender,
    bio: testCredentials.user.bio,
    favoriteStyle: testCredentials.user.favoriteStyle,
  });
  await expect(homePage.shareStoryHeading).toBeVisible();
});
