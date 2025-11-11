import axios from 'axios';

// Use API Gateway for microservices or fallback to localhost:5001 for monolith
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:8000',
});

api.interceptors.request.use((req) => {
  if (localStorage.getItem('profile')) {
    const profile = JSON.parse(localStorage.getItem('profile'));

    req.headers.Authorization = `Bearer ${profile.token}`;
  }

  return req;
});

// Story/Post APIs - now route through API Gateway to Story Service
export const fetchStories = async () => api.get('/api/stories');
export const fetchUserStories = async (id) =>
  api.get(`/api/stories/user/${id}`);
export const fetchStoriesByTag = async (tag) =>
  api.get(`/api/stories?tag=${tag}`);
export const fetchAllTags = async () => api.get(`/api/stories`);
export const createStory = async (story) => api.post('/api/stories', story);
export const updateStory = async (id, story) =>
  api.put(`/api/stories/${id}`, story);
export const deleteStory = async (id) => api.delete(`/api/stories/${id}`);
export const deleteUserStories = async (id) =>
  api.delete(`/api/stories/user/${id}`);
export const deleteUserComments = async (id) =>
  api.delete(`/api/social/comments/user/${id}`);

// Social APIs - route through API Gateway to Social Service
export const likeStory = async (id) => api.post(`/api/social/likes/${id}`, {});

// New function to add a comment to a story
export const commentOnStory = async (id, comment) =>
  api.post(`/api/social/comments/${id}`, comment);

// Function to delete a comment from a story
export const deleteComment = async (storyId, commentId) =>
  api.delete(`/api/social/comments/${commentId}`);

// Auth APIs - route through API Gateway to Auth Service
export const login = async (formValues) =>
  api.post('/api/auth/login', formValues);
export const signup = async (formValues) =>
  api.post('/api/auth/register', formValues);
export const updateUser = async (userId, formValues) =>
  api.put(`/api/auth/profile/${userId}`, formValues);
export const deleteUser = async (userId) =>
  api.delete(`/api/auth/profile/${userId}`);

export const getProfile = async (userId) =>
  api.get(`/api/auth/profile/${userId}`);
export const getUserProfiles = async () => api.get(`/api/auth/users`); // Get all users (admin only)
export const getUserProfile = async (userId) =>
  api.get(`/api/auth/profile/${userId}`);
export const uploadProfileImage = async (imageData) =>
  api.post('/api/auth/profile/upload-image', { image: imageData });

// Image APIs - route through API Gateway to Image Service
export const uploadImage = async (imageData) =>
  api.post('/api/images/upload', { image: imageData });
export const deleteImage = async (filename) =>
  api.delete(`/api/images/${filename}`);

// export const fetchProfile = async () => api.get("/user/profile");
// export const updateProfile = async (formValues) => api.post("/user/profile", formValues);
