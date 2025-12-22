declare const process: {
  env: {
    TEST_ADMIN_EMAIL?: string;
    TEST_ADMIN_PASSWORD?: string;
    TEST_USER_EMAIL?: string;
    TEST_USER_PASSWORD?: string;
    TEST_USER_USERNAME?: string;
    TEST_USER_BIRTHDATE?: string;
    TEST_USER_GENDER?: 'male' | 'female';
    TEST_USER_BIO?: string;
    TEST_USER_FAVORITE_STYLE?: string;
  };
};

const generateUniqueId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const generateRandomPassword = (): string => {
  return `Test${Math.random().toString(36).substring(2, 15)}!`;
};

const generateBirthdate = (): string => {
  const year = 2000 + Math.floor(Math.random() * 10);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRandomGender = (): 'male' | 'female' => {
  return Math.random() > 0.5 ? 'male' : 'female';
};

const getRandomStyle = (): string => {
  const styles = ['Animals', 'Nature', 'Architecture', 'Food', 'Travel'];
  return styles[Math.floor(Math.random() * styles.length)];
};

const uniqueId = generateUniqueId();

export const testCredentials = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@instaverse.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  },
  user: {
    username: process.env.TEST_USER_USERNAME || `tester_${uniqueId}`,
    email: process.env.TEST_USER_EMAIL || `tester_${uniqueId}@instaverse.com`,
    password: process.env.TEST_USER_PASSWORD || generateRandomPassword(),
    birthdate: process.env.TEST_USER_BIRTHDATE || generateBirthdate(),
    gender:
      (process.env.TEST_USER_GENDER as 'male' | 'female') || getRandomGender(),
    bio: process.env.TEST_USER_BIO || `Test user bio ${uniqueId}`,
    favoriteStyle: process.env.TEST_USER_FAVORITE_STYLE || getRandomStyle(),
  },
};
