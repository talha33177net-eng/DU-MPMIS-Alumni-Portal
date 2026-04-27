import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Heart, Share2, PenTool, TrendingUp, Users, ArrowRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import css from './Blog.module.css';

// Mock data removed in favor of live API

const Blog = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [postContent, setPostContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/blogs?per_page=100');
      let data = res.data && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setBlogs(data.filter(b => b.isPublished !== false));
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    try {
      setPublishing(true);
      const payload = {
        title: postTitle,
        content: postContent,
        excerpt: postContent.substring(0, 100) + '...',
        authorName: user?.data?.fullName || user?.user?.fullName || user?.fullName || 'Unknown User',
        category: 'General',
        isPublished: true,
        publishedAt: new Date().toISOString(),
        coverImage: coverImage
      };
      
      await api.post('/blogs', payload);
      await fetchBlogs(); 
      setPostTitle('');
      setPostContent('');
      setCoverImage(null);
      alert('Blog posted successfully!');
    } catch (err) {
      alert('Failed to post blog');
    } finally {
      setPublishing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      setUploading(true);
      const res = await api.post('/blogs/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCoverImage(res.data?.data || res.data?.path || res.data || res);
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleLike = async (blogId) => {
    if (!user) {
      alert("Please login to like blogs");
      return;
    }
    
    // optimistic
    setBlogs(blogs.map(b => {
      if (b.id === blogId) {
        const newLiked = !b.isLiked;
        return {...b, isLiked: newLiked, likes: Math.max(0, (b.likes || 0) + (newLiked ? 1 : -1))};
      }
      return b;
    }));

    try {
      await api.post(`/blogs/${blogId}/like`);
      fetchBlogs();
    } catch { }
  };

  const handleShare = (blogId) => {
    const url = `${window.location.origin}/blog/${blogId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blogs/${blogId}`);
      setBlogs(blogs.filter(b => b.id !== blogId));
    } catch (err) {
      alert("Failed to delete blog: " + (err.response?.data?.message || err.message));
    }
  };

  const currentUserId = user?.user?.id || user?.data?.id || user?.id;
  const displayedBlogs = activeTab === 'my_blogs' ? blogs.filter(b => b.authorId === currentUserId) : blogs;
  
  // Create unique writers map with their highest resolution photo
  const uniqueWritersMap = new Map();
  blogs.forEach(b => {
     if (b.authorName && !uniqueWritersMap.has(b.authorName)) {
         uniqueWritersMap.set(b.authorName, { name: b.authorName, photo: b.authorPhoto });
     }
  });
  const topWriters = Array.from(uniqueWritersMap.values()).slice(0, 4);

  return (
    <div className="section container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          Alumni Blog
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Share your stories, insights, and memories with the community.</p>
      </div>

      <div className={css.layout}>
        {/* Main Feed */}
        <div className={css.mainFeed}>
          
          {user && (
            <div className={css.createPost}>
              <h3><PenTool size={18} /> Write a Blog</h3>
              <form onSubmit={handlePostSubmit}>
                <input 
                  type="text" 
                  placeholder="Blog Title" 
                  className={css.postInput} 
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  required
                />
                <textarea 
                  placeholder="What's on your mind?" 
                  rows="3" 
                  className={css.postTextarea}
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  required
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading || publishing} style={{ fontSize: '0.9rem' }} />
                  <button type="submit" className="btn btn-primary" disabled={uploading || publishing}>
                    {uploading ? 'Uploading...' : publishing ? 'Publishing...' : 'Publish'}
                  </button>
                </div>
              </form>
              {coverImage && (
                <div style={{ marginTop: '1rem', width: '150px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${coverImage}`} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          )}

          <div className={css.tabs}>
            <button className={`${css.tab} ${activeTab === 'all' ? css.activeTab : ''}`} onClick={() => setActiveTab('all')}>All Blogs</button>
            {user && <button className={`${css.tab} ${activeTab === 'my_blogs' ? css.activeTab : ''}`} onClick={() => setActiveTab('my_blogs')}>My Blogs</button>}
          </div>

          {loading ? (
             <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><span className="loader-spinner"></span></div>
          ) : (
            <div className={css.feedList} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {displayedBlogs.length > 0 ? displayedBlogs.map(blog => (
                <Link to={`/blog/${blog.slug || blog.id}`} key={blog.id} className={`card ${css.blogCard}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, position: 'relative' }}>
                  <div style={{ width: '100%', height: '220px', backgroundColor: '#f1f5f9' }}>
                    {blog.coverImage ? (
                      <img loading="lazy" 
                        src={blog.coverImage.startsWith('http') ? blog.coverImage : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${blog.coverImage}`} 
                        alt={blog.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                       <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          No Cover Image
                       </div>
                    )}
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className={css.blogTitle} style={{ margin: 0, fontSize: '1.25rem', lineHeight: '1.4' }}>{blog.title}</h2>
                    {user && (currentUserId === blog.authorId || user.user?.role === 'Admin' || user.data?.role === 'Admin' || user.role === 'Admin') && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(blog.id); }} style={{ background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '1rem', zIndex: 10 }} title="Delete Blog">
                           <Trash2 size={16} />
                        </button>
                    )}
                  </div>
                </Link>
              )) : (
                <div style={{padding:'3rem', textAlign:'center', color:'var(--text-muted)', gridColumn: '1 / -1'}}>No blogs found.</div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={css.sidebar}>
          <div className={css.widget}>
            <h3 className={css.widgetTitle}><TrendingUp size={16}/> Blog Statistics</h3>
            <div className={css.statRow}>
              <span>Total Blogs</span>
              <strong>{blogs.length}</strong>
            </div>
            <div className={css.statRow}>
              <span>Total Writers</span>
              <strong>{uniqueWritersMap.size}</strong>
            </div>
          </div>

          <div className={css.widget}>
            <h3 className={css.widgetTitle}><Users size={16}/> Top Writers</h3>
            <ul className={css.writerList}>
              {topWriters.map((writer, idx) => (
                <li key={idx}>
                  {writer.photo ? (
                      <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${writer.photo}`} alt={writer.name} className={css.writerAvatar} style={{ padding: 0, objectFit: 'cover' }} />
                  ) : (
                      <div className={css.writerAvatar}>{writer.name.charAt(0)}</div>
                  )}
                  {writer.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;

