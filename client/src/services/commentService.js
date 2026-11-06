import api from './api.js';

export const commentService = {
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  updateComment: (id, data) => api.patch(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};
