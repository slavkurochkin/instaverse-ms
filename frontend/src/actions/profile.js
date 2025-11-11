import * as api from '../api';
import {
  FETCH_PROFILE,
  FETCH_USER_STORIES,
  UPLOAD_PROFILE_IMAGE,
} from '../constants/actionTypes';

export const getProfile = () => async (dispatch) => {
  try {
    const { data } = await api.getProfile();
    dispatch({ type: FETCH_PROFILE, payload: data });
  } catch (error) {
    console.log(error.message);
  }
};

export const getUserProfile = (id) => async (dispatch) => {
  try {
    const { data } = await api.getUserProfile(id); // Fetch user profile data
    dispatch({ type: 'FETCH_USER_PROFILE_SUCCESS', payload: data });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserProfiles = () => async (dispatch) => {
  try {
    const { data } = await api.getUserProfiles(); // Fetch user profile data
    // Extract users array from response
    const users = data.users || data;
    // Normalize field names (snake_case to camelCase)
    const normalizedUsers = users.map((user) => ({
      ...user,
      totalPosts: user.totalPosts || user.total_posts || 0,
      favoriteStyle: user.favoriteStyle || user.favorite_style,
      createdAt: user.createdAt || user.created_at,
    }));
    dispatch({ type: 'FETCH_USER_PROFILES_SUCCESS', payload: normalizedUsers });
    return normalizedUsers;
  } catch (error) {
    console.log(error);
    return [];
  }
};
export const getUserStories = (userId) => async (dispatch) => {
  try {
    const { data } = await api.fetchUserStories(userId);
    // Extract stories array from response object
    const stories = data.stories || data;
    // Normalize story IDs (map id to _id for frontend compatibility)
    const normalizedStories = stories.map((story) => ({
      ...story,
      _id: story._id || story.id,
    }));
    dispatch({ type: FETCH_USER_STORIES, payload: normalizedStories });
  } catch (error) {
    console.log(error.message);
  }
};

export const uploadProfileImage = (imageData) => async (dispatch) => {
  try {
    const { data } = await api.uploadProfileImage(imageData);
    dispatch({ type: UPLOAD_PROFILE_IMAGE, payload: data });
    return data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};
