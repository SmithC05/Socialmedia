import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import './Feed.css';

const TABS = [
  { key: 'latest', label: 'All Posts' },
  { key: 'mostLiked', label: 'Most Liked' },
  { key: 'mostCommented', label: 'Most Commented' },
];

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (sort, pageNum) => {
    try {
      let url = `/posts?sort=${sort}&page=${pageNum}&limit=10`;
      if (sort === 'myPosts' && user) {
        url = `/posts?sort=latest&author=${user._id}&page=${pageNum}&limit=10`;
      }
      const { data } = await api.get(url);
      return data;
    } catch (err) {
      throw err;
    }
  }, [user]);

  // Load initial posts when tab changes
  useEffect(() => {
    setLoading(true);
    setError('');
    setPage(1);
    fetchPosts(tab, 1)
      .then((data) => {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      })
      .catch(() => setError('Failed to load posts. Please refresh.'))
      .finally(() => setLoading(false));
  }, [tab, fetchPosts]);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await fetchPosts(tab, next);
      setPosts((prev) => [...prev, ...data.posts]);
      setPage(next);
      setTotalPages(data.totalPages);
    } catch {
      /* noop */
    } finally {
      setLoadingMore(false);
    }
  };

  // New post added to top
  const handlePostCreated = (newPost) => {
    const normalized = {
      ...newPost,
      authorData: { _id: newPost.author._id, username: newPost.author.username },
      likesCount: 0,
      commentsCount: 0,
      likes: [],
      comments: [],
    };
    setPosts((prev) => [normalized, ...prev]);
  };

  // Like or comment count updated
  const handlePostUpdate = (id, updates) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
              ...p,
              ...updates,
              likesCount: updates.likes ? updates.likes.length : (updates.likesCount ?? p.likesCount),
              commentsCount: updates.comments ? updates.comments.length : (updates.commentsCount ?? p.commentsCount),
            }
          : p
      )
    );
  };

  // Post deleted
  const handlePostDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <main className="feed-page">
      <div className="container">
        {/* Create Post */}
        {user ? (
          <CreatePost onPostCreated={handlePostCreated} />
        ) : (
          <div className="feed-guest-banner card">
            <p>👋 <strong>Join SocialWave</strong> to create posts and interact!</p>
            <div className="feed-guest-actions">
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
              <Link to="/login" className="btn btn-outline">Sign In</Link>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="feed-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`feed-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
          {user && (
            <button
              className={`feed-tab ${tab === 'myPosts' ? 'active' : ''}`}
              onClick={() => setTab('myPosts')}
            >
              My Posts
            </button>
          )}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="spinner" />
        ) : error ? (
          <div className="feed-error">{error}</div>
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <div className="feed-empty-icon">🌊</div>
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            ))}

            {/* Load more */}
            {page < totalPages && (
              <div className="feed-load-more">
                <button
                  className="btn btn-outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading…' : 'Load More Posts'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
