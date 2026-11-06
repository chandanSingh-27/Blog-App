import express from 'express';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  commentValidation,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router({ mergeParams: true });

// Routes for /api/posts/:postId/comments
router.get('/', getComments);
router.post('/', protect, commentValidation, validate, addComment);

// Routes for /api/comments/:id
const commentRouter = express.Router();
commentRouter.patch('/:id', protect, commentValidation, validate, updateComment);
commentRouter.delete('/:id', protect, deleteComment);

export { commentRouter };
export default router;
