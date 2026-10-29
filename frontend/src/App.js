import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout } from 'antd';
import {
  ROOT_CONTEXT,
  SpanStatusCode,
  context,
  trace,
} from '@opentelemetry/api';
import Home from './components/Home';
import styles from './styles';
// import 'antd/dist/antd.min.css'
import AppBar from './components/AppBar/AppBar';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import * as Sentry from '@sentry/react';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import { getSessionTraceAttributes } from './tracingSession';

Sentry.init({
  dsn: 'https://e66121e765b2cf7e7ba436eb8597ec0a@o4508696392826880.ingest.us.sentry.io/4508696395055104',
  integrations: [Sentry.replayIntegration()],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const { Footer } = Layout;
const tracer = trace.getTracer('instaverse-ui-errors');

// Read the logged-in user from Redux, falling back to localStorage so a
// page refresh (which doesn't rehydrate Redux) still identifies the user.
const readProfile = (authData) => {
  if (authData?.result) return authData.result;
  try {
    return JSON.parse(localStorage.getItem('profile'))?.result || null;
  } catch {
    return null;
  }
};

const App = () => {
  const { showBreakWorldButton } = useFlags();
  const ldClient = useLDClient();
  const authData = useSelector((state) => state.authentication?.authData);

  // Tell LaunchDarkly who the current user is so flags can target by
  // user/role. Re-runs on login/logout; resets to anonymous when logged out.
  useEffect(() => {
    if (!ldClient) return;
    const user = readProfile(authData);
    if (user?._id) {
      ldClient.identify({
        kind: 'user',
        key: user._id,
        email: user.email,
        name: user.username || user.email,
        role: user.role,
      });
    } else {
      ldClient.identify({ kind: 'user', key: 'anonymous', anonymous: true });
    }
  }, [ldClient, authData]);

  const handleBreakWorldClick = () => {
    const error = new Error('This is your first error!');
    const span = tracer.startSpan(
      'ui.error.break_world',
      {
        attributes: {
          'app.ui.action': 'break_world',
          'app.ui.element': 'footer.button',
          'app.ui.label': 'Break the world',
          ...getSessionTraceAttributes(),
        },
      },
      ROOT_CONTEXT,
    );

    context.with(trace.setSpan(ROOT_CONTEXT, span), () => {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });

      Sentry.captureException(error, {
        tags: {
          ui_action: 'break_world',
          ui_element: 'footer.button',
        },
        extra: getSessionTraceAttributes(),
      });

      console.error(error);
      span.end();
    });

    throw error;
  };

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
          {showBreakWorldButton && (
            <button onClick={handleBreakWorldClick}>Break the world</button>
          )}
          ; 2025 instaverse, built by Slav Kurochkin
        </Footer>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
