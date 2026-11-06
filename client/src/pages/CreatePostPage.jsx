import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService.js';

const CATEGORIES = ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Other'];

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (form.content.trim().length < 10) { setError('Content must be at least 10 characters'); return; }
    setLoading(true);
    try {
      const res = await postService.createPost(form);
      navigate(`/posts/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-page">
        <h1>Create New Post</h1>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input id="title" name="title" type="text" className="form-input"
              value={form.title} onChange={handleChange} placeholder="An interesting title…" maxLength={200} disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" className="form-input"
              value={form.category} onChange={handleChange} disabled={loading}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea id="content" name="content" className="form-textarea"
              value={form.content} onChange={handleChange}
              placeholder="Write your post here… (minimum 10 characters)"
              rows={12} disabled={loading} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publishing…' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
