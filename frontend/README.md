# Instaverse Frontend

![Instaverse](/src/images/instavers.gif?raw=true)

A modern photography social media platform built with React and Redux. Instaverse allows users to share their photography stories, engage with other photographers, and explore content through an intuitive and feature-rich interface.

## 🚀 Features

### User Features
- **Authentication & Authorization**
  - User registration and login with JWT tokens
  - Role-based access control (user/admin)
  - Secure session management

- **Profile Management**
  - Customizable user profiles with avatar upload
  - Gender-based avatar placeholders (using DiceBear API)
  - Editable username and bio
  - View your own and other users' profiles

- **Story Posting & Management**
  - Create posts with images, captions, and tags
  - Edit and delete your own posts
  - Categorize posts (Nature, Portrait, Animals, Sport, etc.)
  - Tag photos with relevant keywords
  - Share social media handles

- **Social Interactions**
  - Like posts from other users
  - Comment on stories
  - Delete your own comments or comments on your posts
  - Real-time notifications via WebSocket
  - View user profiles from posts

- **Content Discovery**
  - Browse all stories in a responsive grid layout
  - Search functionality
  - Filter by tags and categories
  - Sort by date and popularity

### Admin Features
- **Analytics Dashboard**
  - User statistics (total users, total posts)
  - Pie chart: Favorite photography styles distribution
  - Line chart: Posts by month timeline
  - Bar charts: User age groups and gender distribution
  
- **User Management**
  - View all registered users in a data table
  - Search users by username
  - Filter by age groups and gender
  - Edit user profiles (email, username, age, bio, favorite style)
  - Delete users (with cascading deletion of posts and comments)
  - Admin accounts are protected from deletion

### Error Handling
- Error boundaries for graceful error handling
- Sentry integration for error tracking and monitoring
- User-friendly error messages

## 🛠️ Tech Stack

### Core
- **React** `^18.3.1` - UI library
- **React Router DOM** `^6.15.0` - Client-side routing
- **Redux** `^5.0.1` + **Redux Thunk** `^3.1.0` - State management
- **Redux Toolkit** `^2.0.1` - Simplified Redux development

### UI Framework
- **Ant Design** `^5.20.6` - Comprehensive UI component library
- **Ant Design Icons** `^5.2.6` - Icon set
- **React Icons** `^5.4.0` - Additional icon library

### Data Visualization
- **Chart.js** `^4.4.6` - Charting library
- **React ChartJS 2** `^5.2.0` - React wrapper for Chart.js

### Utilities
- **Axios** `^1.8.4` - HTTP client
- **Moment.js** `2.30.1` - Date manipulation
- **jwt-decode** `4.0.0` - JWT token decoding
- **React File Base64** `1.0.3` - Image encoding
- **React Highlight Words** `^0.20.0` - Search highlighting
- **React Beautiful DnD** `^13.1.1` - Drag and drop functionality

### Monitoring & Analytics
- **Sentry React** `^8.51.0` - Error tracking and performance monitoring

### Testing
- **Jest** `^27.5.1` - Unit testing framework
- **React Testing Library** `^16.2.0` - Component testing utilities
- **Playwright** `^1.50.1` - End-to-end testing
- **Pact** `^13.2.0` - Contract testing
- **Redux Mock Store** `^1.5.5` - Redux state mocking

### Build & Development
- **React Scripts** `^5.0.1` - Create React App tooling
- **Webpack** `^5.74.0` - Module bundler
- **Babel** `^7.26.0` - JavaScript transpiler
- **TypeScript** `^4.9.5` - Type checking

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
frontend/
├── src/
│   ├── actions/           # Redux action creators
│   │   ├── authentication.js
│   │   ├── profile.js
│   │   └── stories.js
│   ├── api/              # API service layer
│   │   └── index.js
│   ├── components/       # React components
│   │   ├── AppBar/       # Navigation bar
│   │   ├── AuthForm/     # Login/Register forms
│   │   ├── Charts/       # Data visualization components
│   │   ├── Dashboard/    # Admin dashboard
│   │   ├── Home/         # Main feed
│   │   ├── Profile/      # User profile page
│   │   ├── Story/        # Individual story card
│   │   ├── StoryForm/    # Create/Edit story form
│   │   ├── StoryList/    # Story grid display
│   │   ├── StorySearch/  # Search functionality
│   │   ├── Tags/         # Tag management
│   │   ├── Notifications/ # Real-time notifications
│   │   └── ErrorBoundary.js
│   ├── reducers/         # Redux reducers
│   │   ├── authentication.js
│   │   ├── profile.js
│   │   ├── stories.js
│   │   ├── tags.js
│   │   └── index.js
│   ├── constants/        # Action types
│   │   └── actionTypes.js
│   ├── images/          # Static images
│   ├── styles.js        # Global styles
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
├── __tests__/           # Test files
│   ├── unit/           # Unit tests
│   └── contract/       # Contract tests (Pact)
├── public/             # Static assets
├── build/              # Production build
└── package.json        # Dependencies

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see `/backend` directory)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Environment Setup:**

Create a `.env` file in the frontend directory (if needed for local configuration):
```bash
REACT_APP_API_URL=http://localhost:5000
```

3. **Start Development Server:**
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

4. **Start with Local Environment:**
```bash
npm run start:local
```

## 📜 Available Scripts

### Development
- `npm start` - Run development server (port 3000)
- `npm run start:local` - Run with local environment variables

### Building
- `npm run build` - Create production build with source maps upload to Sentry

### Testing
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:contract` - Run contract tests (Pact)
- `npm run test:coverage` - Generate test coverage report

### Code Quality
- `npm run lint` - Lint source code
- `npm run format` - Format code with Prettier

### Contract Testing
- `npm run publish:pact` - Publish Pact contracts to Pact Broker

### Advanced
- `npm run eject` - Eject from Create React App (⚠️ irreversible)

## 🎨 Key Components

### Home
The main feed where users can view all stories in a responsive grid. Includes a sidebar with a story creation form.

### Dashboard
Admin-only analytics page with:
- User and post statistics
- Interactive charts (Pie, Line, Bar)
- User management table with CRUD operations
- Advanced filtering and search

### Profile
User profile page with:
- Avatar display/upload
- Editable username and bio
- User's story collection
- View other users' profiles via query params

### Story
Individual story card component with:
- Image preview
- Like and comment functionality
- Tag display
- Edit/Delete options (for post owner)
- User profile navigation

### StoryForm
Create and edit story form with:
- Image upload (Base64 encoding)
- Caption and tags input
- Category and device selection
- Social media links

### Notifications
Real-time notification system using WebSocket connection to backend.

## 🔐 Authentication

The app uses JWT-based authentication:
- Tokens are stored in `localStorage` under the `profile` key
- Protected routes redirect to `/authform` if not authenticated
- Admin routes check for `role: 'admin'` in user object

## 📊 State Management

Redux store structure:
```javascript
{
  authentication: {
    user: { result: {...}, token: "..." },
    loading: boolean
  },
  stories: {
    stories: [...],
    loading: boolean
  },
  tags: {
    tags: [...]
  },
  profile: {
    profile: {...},
    userStories: [...]
  }
}
```

## 🧪 Testing

### Unit Tests
Located in `__tests__/unit/`, tests individual components:
```bash
npm run test:unit
```

### Contract Tests (Pact)
Located in `__tests__/contract/`, ensures API contract compliance:
```bash
npm run test:contract
```

### E2E Tests (Playwright)
Located in `tests/`, full user flow testing:
```bash
npx playwright test
```

## 📈 Error Monitoring

The app uses **Sentry** for error tracking:
- Automatic error capture
- Performance monitoring
- Session replay
- Source map upload on production builds

## 🌐 Browser Support

Supports modern browsers:
- Chrome (last version)
- Firefox (last version)
- Safari (last version)
- Edge (last version)

Production builds support:
- >0.2% market share
- Not dead browsers
- Not Opera Mini

## 🤝 API Integration

The frontend communicates with the backend API through Axios. All API calls are centralized in `/src/api/index.js` with:
- JWT token attachment
- Base URL configuration
- Request/Response interceptors

### Main Endpoints:
- `POST /users/signin` - User login
- `POST /users/signup` - User registration
- `GET /stories` - Fetch all stories
- `POST /stories` - Create new story
- `PATCH /stories/:id` - Update story
- `DELETE /stories/:id` - Delete story
- `PATCH /stories/:id/like` - Like story
- `POST /stories/:id/comment` - Add comment
- `GET /profile/:id` - Get user profile

## 🔧 Configuration

### ESLint
Extends:
- `react-app`
- `react-app/jest`

### Browserslist
Configuration in `package.json` for build optimization.

## 📝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Run `npm run lint` and `npm run format` before committing
4. Ensure all tests pass: `npm test`

## 🐛 Troubleshooting

### Build fails to minify
See: [CRA troubleshooting](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

### WebSocket connection issues
Ensure the backend WebSocket server is running on the configured port.

### Sentry source maps not uploading
Check your `.env` file has valid Sentry credentials.

## 📚 Learn More

- [React Documentation](https://reactjs.org/)
- [Redux Documentation](https://redux.js.org/)
- [Ant Design Documentation](https://ant.design/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)

## 📄 License

ISC

---

Built with ❤️ by Slav Kurochkin
