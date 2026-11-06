import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postService } from '../services/postService.js';
import { commentService } from '../services/commentService.js';
import { useAuth } from '../context/AuthContext.jsx';
import CommentList from '../components/CommentList.jsx';
import CommentForm from '../components/CommentForm.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const PostDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const res = await postService.getPostById(id);
      setPost(res.data);
    } catch {
      setError('Post not found or failed to load.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await commentService.getComments(id);
      setComments(res.data);
    } catch { /* silently fail */ }
  }, [id]);

  useEffect(() => { fetchPost(); fetchComments(); }, [fetchPost, fetchComments]);

  const handleAddComment = async (content) => {
    const res = await commentService.addComment(id, { content });
    setComments((prev) => [res.data, ...prev]);
  };

  const handleDeleteComment = async (commentId) => {
    await commentService.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const handleUpdateComment = async (commentId, content) => {
    const res = await commentService.updateComment(commentId, { content });
    setComments((prev) => prev.map((c) => (c._id === commentId ? res.data : c)));
  };

  const handleDeletePost = async () => {
    setDeleting(true);
    try {
      await postService.deletePost(id);
      navigate('/my-posts');
    } catch {
      setError('Failed to delete post.');
      setDeleting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="page"><ErrorMessage message={error} /><Link to="/posts" className="btn btn-outline">← Back</Link></div>
  );

  const isAuthor = user?._id === post?.author?._id;

  return (
    <div className="page post-detail-page">
      <Link to="/posts" className="back-link">← All Posts</Link>

      <article className="post-detail">
        <header className="post-detail-header">
          <span className="post-category">{post.category}</span>
          <h1 className="post-detail-title">{post.title}</h1>
          <div className="post-detail-meta">
            <span>By <strong>{post.author?.name}</strong></span>
            <span>•</span>
            <time>{formatDate(post.createdAt)}</time>
            {post.updatedAt !== post.createdAt && <span>(edited)</span>}
          </div>
          {isAuthor && (
            <div className="post-actions">
              <Link to={`/edit/${post._id}`} className="btn btn-outline btn-sm">Edit</Link>
              {!deleteConfirm ? (
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>Delete</button>
              ) : (
                <span className="confirm-delete">
                  Are you sure?{' '}
                  <button className="btn btn-danger btn-sm" onClick={handleDeletePost} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Yes, Delete'}
                  </button>{' '}
                  <button className="btn btn-outline btn-sm" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                </span>
              )}
            </div>
          )}
        </header>

        <div className="post-detail-content">
          {post.content.split('\n').map((para, i) =>
            para ? <p key={i}>{para}</p> : <br key={i} />
          )}
        </div>
      </article>

      {/* Comments Section */}
      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        <CommentForm onSubmit={handleAddComment} />
        <CommentList
          comments={comments}
          postAuthorId={post.author?._id}
          onDelete={handleDeleteComment}
          onUpdate={handleUpdateComment}
        />
      </section>
    </div>
  );
};

export default PostDetailPage;
