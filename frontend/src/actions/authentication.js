import * as api from '../api';
import {
  AUTHENTICATION,
  UPDATE_USER,
  DELETE_USER,
} from '../constants/actionTypes';

const signup = (formValues, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signup(formValues);
    dispatch({
      type: AUTHENTICATION,
      data: data,
    });
    navigate('/');
  } catch (error) {
    console.log(error);
  }
};

const updateUser = (formValues) => async (dispatch) => {
  try {
    const { data } = await api.updateUser(formValues._id, formValues);

    dispatch({ type: UPDATE_USER, payload: data });
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = (userId) => async (dispatch) => {
  try {
    await api.deleteUser(userId);

    dispatch({ type: DELETE_USER, payload: userId });
  } catch (error) {
    console.log(error.message);
  }
};

const login = (formValues, navigate) => async (dispatch) => {
  try {
    const { data } = await api.login(formValues);
    dispatch({
      type: AUTHENTICATION,
      data: data,
    });
    navigate('/');
  } catch (error) {
    console.log(error);
  }
};

export { signup, login, updateUser, deleteUser };
