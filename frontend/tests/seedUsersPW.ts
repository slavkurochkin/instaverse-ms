import { test, expect } from '@playwright/test';
import { users } from './utils/users';

users.forEach((user) => {
  test(`set user ${user.email}`, async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.getByRole('button', { name: 'Register now' }).click();
    await page.getByRole('textbox', { name: 'username' }).click();
    await page.getByRole('textbox', { name: 'username' }).fill(user.username);
    await page.getByRole('textbox', { name: 'date of birth' }).click();
    await page.getByText('16').click();
    await page.locator('#authform_gender').click();
    await page.getByTitle('male', { exact: true }).locator('div').click();
    await page.getByRole('textbox', { name: 'bio' }).click();
    await page.getByRole('textbox', { name: 'bio' }).fill(user.bio);
    await page.locator('#authform_favorite_style').click();
    await page.getByText('Animals', { exact: true }).click();
    await page.getByRole('textbox', { name: 'email address' }).click();
    await page.getByRole('textbox', { name: 'email address' }).fill(user.email);
    await page.getByRole('textbox', { name: 'password', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'password', exact: true })
      .fill(user.password);
    await page.getByRole('textbox', { name: 'confirm password' }).click();
    await page
      .getByRole('textbox', { name: 'confirm password' })
      .fill(user.password);
    await page.getByRole('button', { name: 'Join' }).click();
    await expect(
      page.getByRole('heading', { name: 'Share a story' }),
    ).toBeVisible();
  });
});
