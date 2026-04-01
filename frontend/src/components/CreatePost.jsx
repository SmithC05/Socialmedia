import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './CreatePost.css';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) {
      return setError('Please write something or add an image.');
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (image) formData.append('image', image);

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setText('');
      removeImage();
      onPostCreated(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.username) return null;

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="create-post card">
      <div className="create-post-top">
        <div className="avatar avatar-lg">{initials}</div>
        <div className="create-post-input-wrap">
          <textarea
            className="create-post-textarea"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            maxLength={2000}
          />
          {preview && (
            <div className="create-post-preview">
              <img src={preview} alt="Preview" />
              <button className="create-post-remove-img" onClick={removeImage} type="button" aria-label="Remove image">✕</button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="create-post-error">{error}</p>}

      <div className="create-post-footer">
        <div className="create-post-actions">
          <button
            type="button"
            className="create-post-icon-btn"
            onClick={() => fileRef.current?.click()}
            title="Add photo"
          >
            📷 <span>Photo</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </div>

        <button
          className="btn btn-primary create-post-submit"
          onClick={handleSubmit}
          disabled={loading || (!text.trim() && !image)}
        >
          {loading ? '…' : '▶ Post'}
        </button>
      </div>
    </div>
  );
}
