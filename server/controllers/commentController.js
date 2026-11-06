import { body } from 'express-validator';
import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const commentValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
];

/**
 * GET /api/posts/:postId/comments
 * Get all comments for a post (latest first).
 */
export const getComments = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/posts/:postId/comments
 * Add a comment to a post (authenticated).
 */
export const addComment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user._id,
      content: req.body.content,
    });
    await comment.populate('author', 'name');
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/comments/:id
 * Edit a comment (only by its author).
 */
export const updateComment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }
    comment.content = req.body.content;
    await comment.save();
    await comment.populate('author', 'name');
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/comments/:id
 * Delete a comment. Allowed for: comment author OR post author (moderation).
 */
export const deleteComment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    const comment = await Comment.findById(req.params.id).populate('post', 'author');
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = comment.post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
