import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { StoreProvider, useStore } from './lib/store';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import { Login, Register, ForgotPassword } from './pages/Auth';
import Browse from './pages/Browse';
import ProjectDetail from './pages/ProjectDetail';
import Talent from './pages/Talent';
import FreelancerPublicProfile from './pages/FreelancerPublicProfile';
import FreelancerDashboard from './pages/freelancer/Dashboard';
import Applications from './pages/freelancer/Applications';
import Saved from './pages/freelancer/Saved';
import EditProfile from './pages/freelancer/EditProfile';
import ClientDashboard from './pages/client/Dashboard';
import PostProject from './pages/client/PostProject';
import Applicants from './pages/client/Applicants';
import Messages from './pages/Messages';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Guard({ role, children }: { role?: 'freelancer' | 'client'; children: React.ReactNode }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'client' ? '/client' : '/freelancer'} replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'client' ? '/client' : '/freelancer'} replace />;
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/redirect" element={<RoleRedirect />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/talent" element={<Talent />} />
            <Route path="/freelancers/:id" element={<FreelancerPublicProfile />} />
            <Route path="/messages" element={<Guard><Messages /></Guard>} />
            {/* freelancer */}
            <Route path="/freelancer" element={<Guard role="freelancer"><FreelancerDashboard /></Guard>} />
            <Route path="/freelancer/applications" element={<Guard role="freelancer"><Applications /></Guard>} />
            <Route path="/freelancer/saved" element={<Guard role="freelancer"><Saved /></Guard>} />
            <Route path="/freelancer/profile" element={<Guard role="freelancer"><EditProfile /></Guard>} />
            {/* client */}
            <Route path="/client" element={<Guard role="client"><ClientDashboard /></Guard>} />
            <Route path="/client/post" element={<Guard role="client"><PostProject /></Guard>} />
            <Route path="/client/projects/:id/edit" element={<Guard role="client"><PostProject /></Guard>} />
            <Route path="/client/projects/:id/applicants" element={<Guard role="client"><Applicants /></Guard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  );
}
