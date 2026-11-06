import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  postValidation,
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/my', protect, getMyPosts);
router.get('/:id', getPostById);
router.post('/', protect, postValidation, validate, createPost);
router.patch('/:id', protect, postValidation, validate, updatePost);
router.delete('/:id', protect, deletePost);

export default router;
