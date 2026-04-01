import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './CommentSection.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function CommentSection({ postId, comments, onCommentAdded }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, { text });
      onCommentAdded(data.comment, data.commentsCount);
      setText('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section">
      {/* Comment list */}
      <div className="comment-list">
        {comments.length === 0 && (
          <p className="comment-empty">No comments yet. Be the first! 💬</p>
        )}
        {comments.map((c) => (
          <div key={c._id} className="comment-item">
            <div className="avatar avatar-sm comment-avatar">
              {(c.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="comment-body">
              <div className="comment-header">
                <span className="comment-username">{c.username}</span>
                {c.createdAt && (
                  <span className="comment-date">{formatDate(c.createdAt)}</span>
                )}
              </div>
              <p className="comment-text">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment input */}
      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="avatar avatar-sm">{user.username.slice(0, 2).toUpperCase()}</div>
          <input
            className="comment-input"
            placeholder="Write a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
          />
          <button
            type="submit"
            className="btn btn-primary comment-submit"
            disabled={submitting || !text.trim()}
          >
            {submitting ? '…' : '→'}
          </button>
        </form>
      ) : (
        <p className="comment-login-hint">
          <a href="/login">Sign in</a> to comment
        </p>
      )}
      {error && <p className="comment-error">{error}</p>}
    </div>
  );
}
