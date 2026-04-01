import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { backendUrl } from '../api/axios';
import CommentSection from './CommentSection';
import './PostCard.css';

// Format date e.g. "Tue, 01 Apr 2026, 09:07 PM"
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesUsers, setLikesUsers] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showLikesModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLikesModal]);

  const fetchLikes = async () => {
    setShowLikesModal(true);
    if (likesUsers.length > 0) return;
    setLoadingLikes(true);
    try {
      const { data } = await api.get(`/posts/${post._id}/likes`);
      setLikesUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLikes(false);
    }
  };

  const isLiked = user && post.likes?.some((id) => {
    const likeId = typeof id === 'object' ? id._id || id.toString() : id;
    return likeId.toString() === user._id.toString();
  });

  const authorData = post.authorData || post.author;
  const authorUsername = authorData?.username || 'Unknown';
  const initials = authorUsername.slice(0, 2).toUpperCase();
  const isOwner = user && authorData?._id?.toString() === user._id.toString();

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      onUpdate(post._id, { likes: data.likes, likesCount: data.likesCount });
    } catch (err) {
      console.error(err);
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete(post._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentAdded = (comment, commentsCount) => {
    onUpdate(post._id, {
      comments: [...(post.comments || []), comment],
      commentsCount,
    });
  };

  const likesCount = post.likesCount ?? post.likes?.length ?? 0;
  const commentsCount = post.commentsCount ?? post.comments?.length ?? 0;

  return (
    <article className="post-card card">
      {/* Header */}
      <div className="post-card-header">
        <div className="post-card-author">
          <div className="avatar">{initials}</div>
          <div className="post-card-author-info">
            <span className="post-card-username">{authorUsername}</span>
            <span className="post-card-handle">@{authorUsername.toLowerCase()}</span>
            <span className="post-card-date">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        {isOwner && (
          <button className="post-card-delete" onClick={handleDelete} title="Delete post">
            🗑️
          </button>
        )}
      </div>

      {/* Content */}
      {post.text && <p className="post-card-text">{post.text}</p>}
      {post.imageUrl && (
        <div className="post-card-image-wrap">
          <img
            src={(post.imageUrl.startsWith('/') && backendUrl !== '') ? `${backendUrl}${post.imageUrl}` : post.imageUrl}
            alt="Post image"
            className="post-card-image"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="post-card-actions">
        <div className="post-card-like-group">
          <button
            className={`post-card-action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={!user || liking}
            title={user ? (isLiked ? 'Unlike' : 'Like') : 'Sign in to like'}
          >
            <span className="post-card-action-icon">{isLiked ? '❤️' : '🤍'}</span>
          </button>
          <button
            className="post-card-likes-count"
            onClick={fetchLikes}
            disabled={likesCount === 0}
            title="View likes"
          >
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </button>
        </div>

        <button
          className={`post-card-action-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments((s) => !s)}
          title="Comments"
        >
          <span className="post-card-action-icon">💬</span>
          <span>{commentsCount}</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          comments={post.comments || []}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Likes Modal */}
      {showLikesModal && (
        <div className="modal-overlay" onClick={() => setShowLikesModal(false)}>
          <div className="modal-content likes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Liked by</h3>
              <button className="modal-close" onClick={() => setShowLikesModal(false)}>✕</button>
            </div>
            <div className="modal-body likes-list">
              {loadingLikes ? (
                <div className="spinner modal-spinner" />
              ) : likesUsers.length === 0 ? (
                <p className="likes-empty">No likes found.</p>
              ) : (
                likesUsers.map((u) => (
                  <div key={u._id} className="likes-user-item">
                    <div className="avatar avatar-sm likes-avatar">
                      {(u.username || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <span>{u.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
