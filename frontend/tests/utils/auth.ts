import { APIRequestContext, Page } from '@playwright/test';

declare const process: {
  env: {
    API_BASE_URL?: string;
  };
};

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export interface LoginResponse {
  token: string;
  result: {
    _id: string;
    email: string;
    username?: string;
    role?: string;
    [key: string]: unknown;
  };
  message: string;
}

/**
 * Login via API and set authentication token in localStorage
 * @param request - Playwright APIRequestContext
 * @param page - Playwright Page (optional, only needed if setting localStorage)
 * @param email - User email
 * @param password - User password
 * @returns Login response with token and user data
 */
export async function loginViaAPI(
  request: APIRequestContext,
  page: Page | null,
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
    data: {
      email,
      password,
    },
  });

  if (!response.ok()) {
    throw new Error(
      `Login failed: ${response.status()} ${response.statusText()}`,
    );
  }

  const responseBody = await response.json();

  // Set authentication token in localStorage if page is provided
  if (page) {
    await page.addInitScript(
      (profile) => {
        localStorage.setItem('profile', JSON.stringify(profile));
      },
      { token: responseBody.token, result: responseBody.result },
    );
  }

  return responseBody;
}

/**
 * Login via API without setting localStorage (for API-only tests)
 * @param request - Playwright APIRequestContext
 * @param email - User email
 * @param password - User password
 * @returns Login response with token and user data
 */
export async function loginViaAPIOnly(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<LoginResponse> {
  return loginViaAPI(request, null, email, password);
}
