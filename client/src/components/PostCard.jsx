import { Link } from 'react-router-dom';

// Format a date string into a human-readable format
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const PostCard = ({ post }) => {
  // Show a 150-char excerpt of the content
  const excerpt =
    post.content.length > 150
      ? post.content.substring(0, 150) + '…'
      : post.content;

  return (
    <article className="post-card">
      <div className="post-card-header">
        <span className="post-category">{post.category || 'General'}</span>
        <time className="post-date">{formatDate(post.createdAt)}</time>
      </div>
      <h2 className="post-title">
        <Link to={`/posts/${post._id}`}>{post.title}</Link>
      </h2>
      <p className="post-excerpt">{excerpt}</p>
      <div className="post-card-footer">
        <span className="post-author">By {post.author?.name || 'Unknown'}</span>
        <div className="post-meta">
          <span className="comment-count">💬 {post.commentCount ?? 0} comments</span>
          <Link to={`/posts/${post._id}`} className="btn btn-secondary btn-sm">
            Read More →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
