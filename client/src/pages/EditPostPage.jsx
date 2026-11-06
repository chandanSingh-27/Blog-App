import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postService } from '../services/postService.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const CATEGORIES = ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Other'];

const EditPostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    postService.getPostById(id)
      .then((res) => {
        const { title, content, category, author } = res.data;
        // Only the author can edit
        if (user?._id !== author?._id) {
          navigate('/');
          return;
        }
        setForm({ title, content, category: category || 'General' });
      })
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (form.content.trim().length < 10) { setError('Content must be at least 10 characters'); return; }
    setSaving(true);
    try {
      await postService.updatePost(id, form);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="page"><ErrorMessage message={error} /></div>;

  return (
    <div className="page">
      <div className="form-page">
        <h1>Edit Post</h1>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input id="title" name="title" type="text" className="form-input"
              value={form.title} onChange={handleChange} maxLength={200} disabled={saving} />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" className="form-input"
              value={form.category} onChange={handleChange} disabled={saving}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea id="content" name="content" className="form-textarea"
              value={form.content} onChange={handleChange} rows={12} disabled={saving} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(`/posts/${id}`)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;
