import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

const CommentForm = ({ onSubmit, initialValue = '', submitLabel = 'Post Comment', onCancel }) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialValue);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <p className="comment-login-prompt">
        <Link to="/login">Log in</Link> to leave a comment.
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    if (content.trim().length > 1000) {
      setError('Comment is too long (max 1000 characters)');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}
      <textarea
        className="comment-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment…"
        rows={3}
        maxLength={1000}
        disabled={submitting}
      />
      <div className="comment-form-actions">
        {onCancel && (
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? 'Posting…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
