import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/postService.js';
import PostCard from '../components/PostCard.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    postService
      .getPosts({ page: 1, limit: 6, search })
      .then((res) => setPosts(res.data.posts))
      .catch(() => setError('Failed to load posts. Please try again.'))
      .finally(() => setLoading(false));
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <h1>Welcome to BlogSpace</h1>
        <p>Share your thoughts. Explore ideas. Join the conversation.</p>
        <Link to="/create" className="btn btn-primary btn-lg">
          Write a Post
        </Link>
      </section>

      {/* Search */}
      <section className="section">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search posts by title…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {search && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setSearch(''); setSearchInput(''); }}
            >
              Clear
            </button>
          )}
        </form>
        {search && <p className="search-info">Showing results for: <strong>"{search}"</strong></p>}
      </section>

      {/* Posts Grid */}
      <section className="section">
        <div className="section-header">
          <h2>Latest Posts</h2>
          <Link to="/posts" className="btn btn-outline btn-sm">View All →</Link>
        </div>

        {loading && <Loader />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && posts.length === 0 && (
          <div className="empty-state">
            <p>No posts found{search ? ` for "${search}"` : ''}.</p>
            <Link to="/create" className="btn btn-primary">Be the first to write one!</Link>
          </div>
        )}
        {!loading && !error && posts.length > 0 && (
          <div className="posts-grid">
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
