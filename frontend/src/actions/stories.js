import * as api from '../api';
import {
  FETCH_ALL_STORIES,
  FETCH_ALL_TAGS,
  FETCH_STORIES_BY_TAG,
  CREATE_STORY,
  UPDATE_STORY,
  DELETE_STORY,
  DELETE_USER_STORIES,
  DELETE_USER_COMMENTS,
} from '../constants/actionTypes';

export const getStories = () => async (dispatch) => {
  try {
    const { data } = await api.fetchStories();
    // Extract stories array from response object
    const stories = data.stories || data;
    // Normalize story data for frontend compatibility
    const normalizedStories = stories.map((story) => ({
      ...story,
      _id: story._id || story.id,
      postDate: story.postDate || story.post_date, // Normalize date field
      userId: story.userId || story.user_id, // Normalize user_id field
    }));
    dispatch({ type: FETCH_ALL_STORIES, payload: normalizedStories });
    return normalizedStories;
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchStoriesByTag = (tag) => async (dispatch) => {
  try {
    const { data } = await api.fetchStoriesByTag(tag);
    // Extract stories array from response object
    const stories = data.stories || data;
    // Normalize story data for frontend compatibility
    const normalizedStories = stories.map((story) => ({
      ...story,
      _id: story._id || story.id,
      postDate: story.postDate || story.post_date, // Normalize date field
      userId: story.userId || story.user_id, // Normalize user_id field
    }));
    dispatch({ type: FETCH_STORIES_BY_TAG, payload: normalizedStories });
  } catch (error) {
    console.log(error.message);
  }
};

export const fetchAllTags = () => async (dispatch) => {
  try {
    const { data } = await api.fetchAllTags();
    // Extract stories array from response object (tags are in stories)
    const stories = data.stories || data;
    // Normalize story data for frontend compatibility
    const normalizedStories = stories.map((story) => ({
      ...story,
      _id: story._id || story.id,
      postDate: story.postDate || story.post_date, // Normalize date field
      userId: story.userId || story.user_id, // Normalize user_id field
    }));
    dispatch({ type: FETCH_ALL_TAGS, payload: normalizedStories });
  } catch (error) {
    console.log(error.message);
  }
};

export const createStory = (story) => async (dispatch) => {
  try {
    const { data } = await api.createStory(story);
    // Extract story from response and normalize field names
    const storyData = data.story || data;
    const normalizedStory = {
      ...storyData,
      _id: storyData._id || storyData.id,
      postDate: storyData.postDate || storyData.post_date,
      userId: storyData.userId || storyData.user_id,
    };
    dispatch({ type: CREATE_STORY, payload: normalizedStory });
  } catch (error) {
    console.log(error.message);
  }
};

export const updateStory = (id, story) => async (dispatch) => {
  try {
    const { data } = await api.updateStory(id, story);
    // Extract story from response and normalize field names
    const storyData = data.story || data;
    const normalizedStory = {
      ...storyData,
      _id: storyData._id || storyData.id,
      postDate: storyData.postDate || storyData.post_date,
      userId: storyData.userId || storyData.user_id,
    };
    dispatch({ type: UPDATE_STORY, payload: normalizedStory });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteStory = (id) => async (dispatch) => {
  try {
    await api.deleteStory(id);

    dispatch({ type: DELETE_STORY, payload: id });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteUserStories = (userId) => async (dispatch) => {
  try {
    await api.deleteUserStories(userId);
    dispatch({ type: DELETE_USER_STORIES, payload: userId });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteUserComments = (userId) => async (dispatch) => {
  try {
    await api.deleteUserComments(userId);
    dispatch({ type: DELETE_USER_COMMENTS, payload: userId });
  } catch (error) {
    console.log(error.message);
  }
};

export const likeStory = (id) => async (dispatch) => {
  try {
    await api.likeStory(id);
    // Refetch all stories to update UI with new like counts
    dispatch(getStories());
  } catch (error) {
    console.log(error.message);
  }
};

export const commentOnStory = (id, comment) => async (dispatch) => {
  try {
    await api.commentOnStory(id, comment);
    // Refetch all stories to get updated comments
    await dispatch(getStories());
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const updateStoryOrder = (newOrder) => ({
  type: 'UPDATE_STORY_ORDER',
  payload: newOrder,
});

// Action to delete a comment
export const deleteComment = (storyId, commentId) => async (dispatch) => {
  try {
    const { data } = await api.deleteComment(storyId, commentId);
    // Normalize story ID (map id to _id for frontend compatibility)
    const normalizedStory = {
      ...data,
      _id: data._id || data.id,
    };
    dispatch({ type: UPDATE_STORY, payload: normalizedStory });
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};
