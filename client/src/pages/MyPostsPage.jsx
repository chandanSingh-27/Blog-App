import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/postService.js';
import PostCard from '../components/PostCard.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    postService.getMyPosts({ page, limit: 6 })
      .then((res) => { setPosts(res.data.posts); setPagination(res.data.pagination); })
      .catch(() => setError('Failed to load your posts.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Posts</h1>
        <Link to="/create" className="btn btn-primary btn-sm">+ New Post</Link>
      </div>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <p>You haven't written any posts yet.</p>
          <Link to="/create" className="btn btn-primary">Write your first post</Link>
        </div>
      )}
      {!loading && !error && posts.length > 0 && (
        <>
          <div className="posts-grid">
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Previous</button>
              <span className="pagination-info">Page {page} of {pagination.pages}</span>
              <button className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyPostsPage;
