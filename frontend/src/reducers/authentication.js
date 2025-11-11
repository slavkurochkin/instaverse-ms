import {
  AUTHENTICATION,
  LOGOUT,
  UPDATE_USER,
  DELETE_USER,
} from '../constants/actionTypes';

const authenticationReducer = (state = { authData: null }, action) => {
  switch (action.type) {
    case AUTHENTICATION:
      localStorage.setItem('profile', JSON.stringify({ ...action?.data }));

      return {
        ...state,
        authData: action?.data,
      };
    case LOGOUT:
      localStorage.clear();

      return {
        ...state,
        authData: null,
      };

    case UPDATE_USER: // Update user profile
      return {
        ...state,
        authData: action.payload,
      };

    case DELETE_USER: // Delete user profile
      return {
        ...state,
        authData: action.payload,
      };
    default:
      return state;
  }
};

export default authenticationReducer;
