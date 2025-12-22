import { Page, Locator } from '@playwright/test';

export interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthdate: string;
  gender: 'male' | 'female';
  bio: string;
  favoriteStyle: string;
}

export class SignupPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly registerNowButton: Locator;
  readonly usernameInput: Locator;
  readonly birthdateInput: Locator;
  readonly genderSelect: Locator;
  readonly bioInput: Locator;
  readonly favoriteStyleSelect: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly joinButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.registerNowButton = page.getByRole('button', { name: 'Register now' });
    this.usernameInput = page.getByRole('textbox', { name: 'username' });
    this.birthdateInput = page.getByRole('textbox', { name: 'date of birth' });
    this.genderSelect = page.locator('#authform_gender');
    this.bioInput = page.getByRole('textbox', { name: 'bio' });
    this.favoriteStyleSelect = page.locator('#authform_favorite_style');
    this.emailInput = page.getByRole('textbox', { name: 'email address' });
    this.passwordInput = page.getByRole('textbox', {
      name: 'password',
      exact: true,
    });
    this.confirmPasswordInput = page.getByRole('textbox', {
      name: 'confirm password',
    });
    this.joinButton = page.getByRole('button', { name: 'Join' });
  }

  async goto(url: string = 'http://localhost:3001/') {
    await this.page.goto(url);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async clickRegisterNow() {
    await this.registerNowButton.click();
  }

  async fillUsername(username: string) {
    await this.usernameInput.click();
    await this.usernameInput.fill(username);
  }

  async fillBirthdate(birthdate: string) {
    await this.birthdateInput.click();
    await this.birthdateInput.fill(birthdate);
  }

  async selectGender(gender: 'male' | 'female') {
    await this.genderSelect.click();
    await this.page.getByTitle(gender, { exact: true }).locator('div').click();
  }

  async fillBio(bio: string) {
    await this.bioInput.click();
    await this.bioInput.fill(bio);
  }

  async selectFavoriteStyle(style: string) {
    await this.favoriteStyleSelect.click();
    await this.page.getByText(style, { exact: true }).click();
  }

  async fillEmail(email: string) {
    await this.emailInput.click();
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.click();
    await this.confirmPasswordInput.fill(password);
  }

  async submit() {
    await this.joinButton.click();
  }

  async signup(data: SignupData) {
    await this.clickLogin();
    await this.clickRegisterNow();
    await this.fillUsername(data.username);
    await this.fillBirthdate(data.birthdate);
    await this.selectGender(data.gender);
    await this.fillBio(data.bio);
    await this.selectFavoriteStyle(data.favoriteStyle);
    await this.fillEmail(data.email);
    await this.fillPassword(data.password);
    await this.fillConfirmPassword(data.confirmPassword);
    await this.submit();
  }
}
