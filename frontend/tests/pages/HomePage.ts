import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly shareStoryHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shareStoryHeading = page.getByRole('heading', {
      name: 'Share a story',
    });
  }

  getShareStoryHeading() {
    return this.shareStoryHeading;
  }
}
