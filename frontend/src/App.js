import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './components/Home';
import styles from './styles';
// import 'antd/dist/antd.min.css'
import AppBar from './components/AppBar/AppBar';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://e66121e765b2cf7e7ba436eb8597ec0a@o4508696392826880.ingest.us.sentry.io/4508696395055104',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const { Footer } = Layout;
const App = () => {
  return (
    <BrowserRouter>
      <Layout style={styles.layout}>
        <AppBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/authform" element={<AuthForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer style={styles.footer}>
          <button
            onClick={() => {
              throw new Error('This is your first error!');
            }}
          >
            Break the world
          </button>
          ; 2025 instaverse, built by Slav Kurochkin
        </Footer>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
