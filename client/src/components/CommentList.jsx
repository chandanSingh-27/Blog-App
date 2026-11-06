import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import CommentForm from './CommentForm.jsx';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const CommentItem = ({ comment, postAuthorId, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isCommentAuthor = user?._id === comment.author?._id;
  const isPostAuthor = user?._id === postAuthorId;
  const canEdit = isCommentAuthor;
  const canDelete = isCommentAuthor || isPostAuthor;

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{comment.author?.name || 'Unknown'}</span>
        <time className="comment-date">{formatDate(comment.createdAt)}</time>
      </div>
      {editing ? (
        <CommentForm
          initialValue={comment.content}
          submitLabel="Save"
          onSubmit={async (text) => { await onUpdate(comment._id, text); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}
      {(canEdit || canDelete) && !editing && (
        <div className="comment-actions">
          {canEdit && <button className="btn-link" onClick={() => setEditing(true)}>Edit</button>}
          {canDelete && !confirmDelete && (
            <button className="btn-link danger" onClick={() => setConfirmDelete(true)}>Delete</button>
          )}
          {confirmDelete && (
            <span>
              Delete this comment?{' '}
              <button className="btn-link danger" onClick={() => onDelete(comment._id)}>Yes</button>{' '}
              <button className="btn-link" onClick={() => setConfirmDelete(false)}>No</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const CommentList = ({ comments, postAuthorId, onDelete, onUpdate }) => {
  if (!comments.length) {
    return <p className="no-comments">No comments yet. Be the first!</p>;
  }
  return (
    <div className="comment-list">
      {comments.map((c) => (
        <CommentItem
          key={c._id}
          comment={c}
          postAuthorId={postAuthorId}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default CommentList;
