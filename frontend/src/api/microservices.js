import axios from 'axios';

// API Gateway URL
const API_GATEWAY_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_GATEWAY_URL,
});

// Add authorization header to all requests
api.interceptors.request.use((req) => {
  if (localStorage.getItem('profile')) {
    const profile = JSON.parse(localStorage.getItem('profile'));
    req.headers.Authorization = `Bearer ${profile.token}`;
  }
  return req;
});

// Story/Post APIs (maps to Story Service via API Gateway)
export const fetchStories = async () => api.get('/api/stories');
export const fetchUserStories = async (id) => api.get(`/api/stories/user/${id}`);
export const createStory = async (story) => api.post('/api/stories', story);
export const updateStory = async (id, story) => api.put(`/api/stories/${id}`, story);
export const deleteStory = async (id) => api.delete(`/api/stories/${id}`);

// Social APIs (maps to Social Service via API Gateway)
export const likeStory = async (id) => api.post(`/api/social/likes/${id}`);
export const unlikeStory = async (id) => api.delete(`/api/social/likes/${id}`);
export const commentOnStory = async (id, comment) => 
  api.post(`/api/social/comments/${id}`, comment);
export const deleteComment = async (commentId) => 
  api.delete(`/api/social/comments/${commentId}`);
export const getComments = async (postId) => 
  api.get(`/api/social/comments/${postId}`);
export const getLikes = async (postId) => 
  api.get(`/api/social/likes/${postId}`);

// Auth APIs (maps to Auth Service via API Gateway)
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
export const getUserProfile = async (userId) => 
  api.get(`/api/auth/profile/${userId}`);
export const validateToken = async () => 
  api.get('/api/auth/validate-token');

// Legacy compatibility - map old endpoints to new ones
export const fetchStoriesByTag = async (tag) => 
  api.get(`/api/stories?tag=${tag}`);
export const fetchAllTags = async () => 
  api.get(`/api/stories`); // Can be enhanced in Story Service
export const deleteUserStories = async (id) => 
  api.delete(`/api/stories/user/${id}`);
export const deleteUserComments = async (id) => 
  api.delete(`/api/social/comments/user/${id}`);
export const getUserProfiles = async () => 
  api.get(`/api/auth/profile`);
export const uploadProfileImage = async (imageData) => 
  api.post('/api/auth/profile/upload-image', { image: imageData });

export default api;

