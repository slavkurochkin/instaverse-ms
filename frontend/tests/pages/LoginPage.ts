import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.emailInput = page.getByRole('textbox', { name: 'email address' });
    this.passwordInput = page.getByRole('textbox', { name: 'password' });
    this.submitButton = page
      .locator('#authform')
      .getByRole('button', { name: 'Log In' });
  }

  async goto(url: string = 'http://localhost:3000/') {
    await this.page.goto(url);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async fillEmail(email: string) {
    await this.emailInput.click();
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.clickLogin();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}
