import axios from 'axios';

const API = axios.create({ 
  // Update this line to use your Ngrok backend URL
baseURL: 'https://socialgenai-backend.onrender.com/api'});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const generatePost = (data) => API.post('/generate', data);
export const generateFromImage = (formData) => API.post('/generate/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getPosts = () => API.get('/posts');
export const getSavedPosts = () => API.get('/posts/saved');
export const savePost = (id, data) => API.put(`/posts/save/${id}`, data);
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const generateImage = (data) => API.post('/imagegenerate', data);
export const saveGeneratedImage = (data) => API.post('/imagegenerate/save', data);
