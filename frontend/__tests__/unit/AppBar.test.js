/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'; // need to import for test to run
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import AppBar from '../../src/components/AppBar/AppBar';

const mockStore = configureStore([]);

describe('AppBar Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
  });

  test('renders AppBar with login button when no user is logged in', () => {
    localStorage.removeItem('profile');
    const { getByText } = render(
      <Provider store={store}>
        <Router>
          <AppBar />
        </Router>
      </Provider>,
    );

    expect(getByText(/Log In/i)).toBeInTheDocument();
  });
});
