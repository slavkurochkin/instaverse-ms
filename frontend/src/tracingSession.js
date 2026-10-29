const SESSION_STORAGE_KEY = 'instaverse.otel.session_id';

const getStorage = (storageName) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window[storageName];
  } catch (error) {
    return null;
  }
};

const safeJsonParse = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const generateSessionId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const ensureTracingSessionId = () => {
  const sessionStorage = getStorage('sessionStorage');

  if (!sessionStorage) {
    return generateSessionId();
  }

  const existingSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId = generateSessionId();
  sessionStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);

  return nextSessionId;
};

export const clearTracingSession = () => {
  const sessionStorage = getStorage('sessionStorage');

  sessionStorage?.removeItem(SESSION_STORAGE_KEY);
};

export const getStoredProfile = () => {
  const localStorage = getStorage('localStorage');

  return safeJsonParse(localStorage?.getItem('profile'));
};

const getStoredUser = () => getStoredProfile()?.result;

export const getSessionTraceAttributes = (overrides = {}) => {
  const user = overrides.user || getStoredUser();
  const email = overrides.email || user?.email;
  const role = overrides.role || user?.role;
  const userId = overrides.userId || user?._id;
  const isAuthenticated =
    overrides.authenticated !== undefined
      ? overrides.authenticated
      : Boolean(userId);

  const attributes = {
    'app.session.id': ensureTracingSessionId(),
    'app.auth.state': isAuthenticated ? 'authenticated' : 'anonymous',
  };

  if (userId) {
    attributes['enduser.id'] = String(userId);
  }

  if (email) {
    attributes['enduser.email'] = email;
  }

  if (role) {
    attributes['enduser.role'] = role;
  }

  return attributes;
};

export const getSessionPropagationHeaders = () => {
  const user = getStoredUser();
  const headers = {
    'x-session-id': ensureTracingSessionId(),
  };

  if (user?._id) {
    headers['x-user-id'] = String(user._id);
  }

  if (user?.role) {
    headers['x-user-role'] = user.role;
  }

  return headers;
};
