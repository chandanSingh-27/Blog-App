import { body, query, param } from 'express-validator';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// Validation rules
export const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category').optional().trim().isLength({ max: 50 }),
];

/**
 * GET /api/posts
 * List posts with pagination and optional search by title.
 */
export const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 6));
    const search = req.query.search?.trim() || '';

    const filter = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Attach comment count to each post
    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    commentCounts.forEach((c) => { countMap[c._id.toString()] = c.count; });
    const enriched = posts.map((p) => ({ ...p, commentCount: countMap[p._id.toString()] || 0 }));

    res.json({
      posts: enriched,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts/:id
 * Get a single post by ID.
 */
export const getPostById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const commentCount = await Comment.countDocuments({ post: post._id });
    res.json({ ...post.toObject(), commentCount });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/posts
 * Create a new post (authenticated).
 */
export const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const post = await Post.create({
      title,
      content,
      category: category || 'General',
      author: req.user._id,
    });
    await post.populate('author', 'name');
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/posts/:id
 * Update a post (only by its author).
 */
export const updatePost = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { title, content, category } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;
    await post.save();
    await post.populate('author', 'name');
    res.json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/posts/:id
 * Delete a post and its comments (only by its author).
 */
export const deletePost = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete all comments belonging to this post
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Post and its comments deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts/my
 * Get posts created by the authenticated user.
 */
export const getMyPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 6));

    const filter = { author: req.user._id };
    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    commentCounts.forEach((c) => { countMap[c._id.toString()] = c.count; });
    const enriched = posts.map((p) => ({ ...p, commentCount: countMap[p._id.toString()] || 0 }));

    res.json({
      posts: enriched,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (error) {
    next(error);
  }
};
