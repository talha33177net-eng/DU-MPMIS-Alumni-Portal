import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

import { lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
const Home = lazy(() => import('./pages/Home'));
const History = lazy(() => import('./pages/History'));
const MissionVision = lazy(() => import('./pages/MissionVision'));
const Constitution = lazy(() => import('./pages/Constitution'));
const Committee = lazy(() => import('./pages/Committee'));
const Directory = lazy(() => import('./pages/Directory'));
const MembersList = lazy(() => import('./pages/MembersList'));
const InMemoriam = lazy(() => import('./pages/InMemoriam'));
const Publications = lazy(() => import('./pages/Publications'));
const Events = lazy(() => import('./pages/Events'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Notices = lazy(() => import('./pages/Notices'));
const Careers = lazy(() => import('./pages/Careers'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Donate = lazy(() => import('./pages/Donate'));
const Election = lazy(() => import('./pages/Election'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const ApplyMembership = lazy(() => import('./pages/ApplyMembership'));

import AdminLayout from './components/layout/AdminLayout';
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageEvents = lazy(() => import('./pages/admin/ManageEvents'));
const ManageBlogs = lazy(() => import('./pages/admin/ManageBlogs'));
const ManageNotices = lazy(() => import('./pages/admin/ManageNotices'));
const ManageMembers = lazy(() => import('./pages/admin/ManageMembers'));
const ManagePublications = lazy(() => import('./pages/admin/ManagePublications'));
const ManageGallery = lazy(() => import('./pages/admin/ManageGallery'));
const ManageSettings = lazy(() => import('./pages/admin/ManageSettings'));
const ManageAbout = lazy(() => import('./pages/admin/ManageAbout'));
const ManageMessages = lazy(() => import('./pages/admin/ManageMessages'));
const ManageCareers = lazy(() => import('./pages/admin/ManageCareers'));
const ManageElections = lazy(() => import('./pages/admin/ManageElections'));

const NotFound = () => (
  <div className="section container" style={{textAlign:'center', minHeight:'60vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
    <h1 style={{fontSize:'6rem', color:'var(--accent-color)', marginBottom:'1rem'}}>404</h1>
    <p style={{fontSize:'1.25rem', color:'var(--text-muted)'}}>The page you're looking for doesn't exist.</p>
    <a href="/" className="btn btn-primary" style={{marginTop:'2rem'}}>Go Home</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="section"><div className="loader-spinner" style={{margin:'0 auto', marginTop:'20vh'}}></div></div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="history" element={<History />} />
              <Route path="mission-vision" element={<MissionVision />} />
              <Route path="constitution" element={<Constitution />} />
              <Route path="committee" element={<Committee />} />
              <Route path="directory" element={<Directory />} />
              <Route path="members/:type" element={<MembersList />} />
              <Route path="in-memoriam" element={<InMemoriam />} />
              <Route path="publications" element={<Publications />} />
              <Route path="publications/:category" element={<Publications />} />
              <Route path="events" element={<Events />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="gallery/:type" element={<Gallery />} />
              <Route path="contact" element={<Contact />} />
              <Route path="notices" element={<Notices />} />
              <Route path="careers" element={<Careers />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:id" element={<BlogPost />} />
              <Route path="donate" element={<Donate />} />
              <Route path="elections" element={<Election />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="apply" element={<ApplyMembership />} />
              <Route path="profile/:id" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="about" element={<ManageAbout />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="events" element={<ManageEvents />} />
              <Route path="careers" element={<ManageCareers />} />
              <Route path="gallery" element={<ManageGallery />} />
              <Route path="members" element={<ManageMembers />} />
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="notices" element={<ManageNotices />} />
              <Route path="messages" element={<ManageMessages />} />
              <Route path="publications" element={<ManagePublications />} />
              <Route path="settings" element={<ManageSettings />} />
              <Route path="elections" element={<ManageElections />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
    </AuthProvider>
  );
}

export default App;
