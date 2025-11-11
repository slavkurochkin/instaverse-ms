const axios = require('axios');

const endpoint = 'http://localhost:5001/user/signup';

const users = [
  {
    username: 'john_doe',
    role: 'admin',
    age: '1990-05-15T00:00:00.000Z',
    gender: 'male',
    bio: 'Tech enthusiast and blogger.',
    favorite_style: 'minimalist',
    email: 'api_john.doe@example.com',
    password: 'hashed_password_1',
    confirmPassword: 'hashed_password_1',
  },
  {
    username: 'jane_smith',
    role: 'user',
    age: '1995-09-22T00:00:00.000Z',
    gender: 'female',
    bio: 'Loves photography and travel.',
    favorite_style: 'bohemian',
    email: 'api_jane.smith@example.com',
    password: 'hashed_password_2',
    confirmPassword: 'hashed_password_2',
  },
  {
    username: 'alice_wonder',
    role: 'moderator',
    age: '1988-03-10T00:00:00.000Z',
    gender: 'female',
    bio: 'Community manager and writer.',
    favorite_style: 'vintage',
    email: 'api_alice.wonder@example.com',
    password: 'hashed_password_3',
    confirmPassword: 'hashed_password_3',
  },
  {
    username: 'bob_builder',
    role: 'user',
    age: '1985-07-29T00:00:00.000Z',
    gender: 'male',
    bio: 'DIY enthusiast and woodworker.',
    favorite_style: 'industrial',
    email: 'api_bob.builder@example.com',
    password: 'hashed_password_4',
    confirmPassword: 'hashed_password_4',
  },
  {
    username: 'charlie_dev',
    role: 'admin',
    age: '1992-11-05T00:00:00.000Z',
    gender: 'male',
    bio: 'Full-stack developer and open-source contributor.',
    favorite_style: 'modern',
    email: 'api_charlie.dev@example.com',
    password: 'hashed_password_5',
    confirmPassword: 'hashed_password_5',
  },
];

// Function to seed users and measure execution time
const seedUsers = async () => {
  console.log('\n🚀 Seeding started...\n');
  const startTime = Date.now(); // Capture start time

  const results = await Promise.allSettled(
    users.map((user) =>
      axios
        .post(endpoint, user)
        .then((response) => {
          console.log(
            `✅ Created: ${user.username} - Status: ${response.status}`,
          );
        })
        .catch((error) => {
          console.error(
            `❌ Failed: ${user.username} - Error: ${error.message}`,
          );
        }),
    ),
  );

  const endTime = Date.now(); // Capture end time
  const elapsedTime = ((endTime - startTime) / 1000).toFixed(2); // Convert to seconds

  console.log(`\n📢 Seeding completed in ${elapsedTime} seconds! 🚀`);
};

// Run the function
seedUsers();
