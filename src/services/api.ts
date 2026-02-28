import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = '/api';
const socket = io(window.location.origin);

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const userService = {
  getMe: () => api.get('/auth/me'),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateProfile: (data: any) => api.put('/users/me', data),
  searchUsers: (params: any) => api.get('/search', { params }),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  verifyUser: (id: string, verified: boolean) => api.post(`/admin/verify/${id}`, { verified }),
};

export const postService = {
  getPosts: () => api.get('/posts'),
  createPost: (data: any) => api.post('/posts', data),
  likePost: (id: string) => api.post(`/posts/${id}/like`),
};

export const messageService = {
  getConversations: () => api.get('/conversations'),
  getMessages: (otherId: string) => api.get(`/messages/${otherId}`),
  sendMessage: (data: { receiverId: string, content: string }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    socket.emit('sendMessage', { 
      senderId: user.id, 
      receiverId: data.receiverId, 
      content: data.content 
    });
  },
  onMessage: (callback: (msg: any) => void) => {
    socket.on('message', callback);
    return () => socket.off('message', callback);
  },
  join: (userId: string) => socket.emit('join', userId),
};

export const requestService = {
  createRequest: (data: any) => api.post('/requests', data),
  getMyRequests: () => api.get('/requests/me'),
  updateRequestStatus: (id: string, status: string) => api.put(`/requests/${id}`, { status }),
};

export const ratingService = {
  rate: (data: any) => api.post('/ratings', data),
};

export default api;
