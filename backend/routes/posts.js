const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @route  GET /api/posts
 * @desc   Get paginated posts with optional sorting
 * @query  page, limit, sort (latest|mostLiked|mostCommented)
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'latest';

    let sortQuery = {};
    if (sort === 'mostLiked') {
      // Sort by likes array length descending
      sortQuery = { likesCount: -1 };
    } else if (sort === 'mostCommented') {
      sortQuery = { commentsCount: -1 };
    } else {
      sortQuery = { createdAt: -1 };
    }

    const matchQuery = {};
    if (req.query.author) {
      if (mongoose.Types.ObjectId.isValid(req.query.author)) {
        matchQuery.author = new mongoose.Types.ObjectId(req.query.author);
      }
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
        },
      },
      { $sort: sortQuery },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorData',
        },
      },
      { $unwind: '$authorData' },
      {
        $project: {
          text: 1,
          imageUrl: 1,
          likes: 1,
          likesCount: 1,
          comments: 1,
          commentsCount: 1,
          createdAt: 1,
          'authorData._id': 1,
          'authorData.username': 1,
          'authorData.avatar': 1,
        },
      },
    ];

    const posts = await Post.aggregate(pipeline);
    const total = await Post.countDocuments();

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route  POST /api/posts
 * @desc   Create a new post (text, image, or both)
 * @access Private
 */
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // At least one of text or image must be provided
    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'Post must have text or an image' });
    }

    const post = await Post.create({
      author: req.user._id,
      text: text || '',
      imageUrl,
    });

    // Populate author info for the response
    const populated = await Post.findById(post._id).populate('author', 'username avatar');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route  POST /api/posts/:id/like
 * @desc   Toggle like on a post
 * @access Private
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({ likes: post.likes, likesCount: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route  GET /api/posts/:id/likes
 * @desc   Get users who liked a post
 * @access Public
 */
router.get('/:id/likes', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('likes', 'username avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route  POST /api/posts/:id/comment
 * @desc   Add a comment to a post
 * @access Private
 */
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user._id,
      username: req.user.username,
      text: text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    // Return the last added comment
    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json({ comment: newComment, commentsCount: post.comments.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route  DELETE /api/posts/:id
 * @desc   Delete a post (only by its author)
 * @access Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
