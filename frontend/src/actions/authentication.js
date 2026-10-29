import * as api from '../api';
import {
  ROOT_CONTEXT,
  SpanStatusCode,
  context,
  trace,
} from '@opentelemetry/api';
import {
  AUTHENTICATION,
  UPDATE_USER,
  DELETE_USER,
} from '../constants/actionTypes';
import { getSessionTraceAttributes } from '../tracingSession';

const authTracer = trace.getTracer('instaverse-auth');

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
  const span = authTracer.startSpan(
    'auth.login',
    {
      attributes: {
        'app.auth.action': 'login',
        ...getSessionTraceAttributes({
          email: formValues.email,
        }),
      },
    },
    ROOT_CONTEXT,
  );

  await context.with(trace.setSpan(ROOT_CONTEXT, span), async () => {
    try {
      const { data } = await api.login(formValues);

      span.setAttributes({
        'app.auth.result': 'success',
        ...getSessionTraceAttributes({
          authenticated: true,
          email: data?.result?.email || formValues.email,
          role: data?.result?.role,
          user: data?.result,
          userId: data?.result?._id,
        }),
      });

      dispatch({
        type: AUTHENTICATION,
        data: data,
      });
      navigate('/');
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.recordException(error);
      span.setAttributes({
        'app.auth.result': 'error',
      });
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      console.log(error);
    } finally {
      span.end();
    }
  });
};

export { signup, login, updateUser, deleteUser };
