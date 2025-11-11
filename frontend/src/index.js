import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { applyMiddleware, compose } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk';
import reducers from './reducers';

import App from './App';

// Suppress ResizeObserver loop completed with undelivered notifications error
// This is a known issue with Ant Design components and doesn't affect functionality
const resizeObserverLoopErrRe = /^ResizeObserver loop limit exceeded/;

window.addEventListener('error', (e) => {
  if (resizeObserverLoopErrRe.test(e.message)) {
    e.stopImmediatePropagation();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (resizeObserverLoopErrRe.test(e.reason?.message)) {
    e.preventDefault();
  }
});

const store = configureStore(
  { reducer: reducers },
  compose(applyMiddleware(thunk)),
);

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
