import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Tag, Heart, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import css from './BlogPost.module.css';

const BlogPost = () => {
  const { id: slug } = useParams();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/blogs/${slug}`);
      const fetchedPost = res?.data?.data || res?.data || res;
      setPost(fetchedPost);
      if (fetchedPost && fetchedPost.id) {
        fetchComments(fetchedPost.id);
      }
    } catch (err) {
      console.error('Failed to fetch blog post', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (blogId) => {
    if (!blogId) return;
    try {
      const res = await api.get(`/blog-comments/blog/${blogId}?page=1&per_page=100`);
      setComments(res.data?.items || res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setPostingComment(true);
    try {
      await api.post(`/blog-comments/blog/${post.id}`, { content: newComment });
      setNewComment('');
      fetchComments(post.id);
      fetchPost(); // Update comment count
    } catch (err) {
      alert('Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      alert("Please login to like blogs");
      return;
    }
    
    // optimistic
    const newLiked = !post.isLiked;
    setPost({ ...post, isLiked: newLiked, likes: Math.max(0, post.likes + (newLiked ? 1 : -1)) });

    try {
      await api.post(`/blogs/${post.id}/like`);
      fetchPost(); // Fetch real data
    } catch {
      // revert on failure
      setPost({ ...post, isLiked: !newLiked, likes: post.likes });
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="loader-spinner"></span></div>;
  }

  if (!post) {
    return (
      <div className="section container text-center">
        <h2>Blog post not found</h2>
        <Link to="/blog" className="btn btn-primary" style={{ marginTop: '1rem' }}>Return to Blogs</Link>
      </div>
    );
  }

  return (
    <div className={`section container animate-fade-in ${css.pageContainer}`} style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '6rem' }}>
      <Link to="/blog" className={css.backBtn}>
        <ArrowLeft size={18} /> Back to Blogs
      </Link>

      <article>
        {post.coverImage && (
          <div className={css.heroWrapper}>
            <img loading="lazy" 
              src={post.coverImage.startsWith('http') ? post.coverImage : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${post.coverImage}`} 
              alt={post.title} 
              className={css.heroImage}
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        )}
        
        <div className={css.mainLayout}>
          <div className={css.leftColumn}>
            <div className={css.metaData}>
               <span className={css.metaItem}><User size={16}/> {post.authorName || 'Unknown User'}</span>
               <span className={css.metaItem}><Calendar size={16}/> {format(new Date(post.publishedAt || post.createdAt || new Date()), 'MMMM dd, yyyy')}</span>
            </div>

            <h1 className={css.title}>
              {post.title}
            </h1>

            <div className={css.articleBody} dangerouslySetInnerHTML={{ __html: post.content }} />

            <div className={css.interactionBox}>
               <button onClick={handleToggleLike} className={css.likeBtn}>
                  <Heart size={20} fill={post.isLiked ? 'var(--accent-color)' : 'none'} color={post.isLiked ? 'var(--accent-color)' : 'currentColor'} /> 
                  {post.likes || 0} {post.likes === 1 ? 'Like' : 'Likes'}
               </button>
               <div className={css.actionStats}>
                  <MessageSquare size={20} /> {post.comments || comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
               </div>
            </div>
          </div>

          <aside className={css.rightColumn}>
            <div className={css.commentsSection}>
              <h3 className={css.commentsHeader}>
                <MessageSquare strokeWidth={2.5} size={24} color="var(--accent-color)" />
                Join the Conversation
              </h3>
              
              {user ? (
                <form onSubmit={handlePostComment} className={css.commentForm}>
                  <textarea 
                    placeholder="Share your thoughts on this story..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className={css.commentInput}
                    required
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={postingComment} style={{ padding: '0.75rem 2rem', borderRadius: '50px', letterSpacing: '0.5px' }}>
                      {postingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '16px', marginBottom: '3rem', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    Please <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 'bold', textDecoration: 'none' }}>log in</Link> to join the conversation.
                  </p>
                </div>
              )}

              <div className={css.commentList}>
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className={css.commentItem}>
                      {comment.userPhoto ? (
                         <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${comment.userPhoto}`} alt="avatar" className={css.commentAvatar} style={{ padding: 0, objectFit: 'cover' }} />
                      ) : (
                         <div className={css.commentAvatar}>
                           {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                         </div>
                      )}
                      <div className={css.commentBubble}>
                        <div className={css.commentAuthor}>
                          <span className={css.commentAuthorName}>{comment.userName || 'Unknown User'}</span>
                          <span className={css.commentDate}>{format(new Date(comment.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1.05rem' }}>{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                     <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;

