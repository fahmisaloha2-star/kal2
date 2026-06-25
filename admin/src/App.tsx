import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { auth } from './auth';
import Login from './pages/Login';
import Layout from './pages/dashboard/Layout';
import Overview from './pages/dashboard/Overview';
import Projects from './pages/dashboard/Projects';
import Services from './pages/dashboard/Services';
import Testimonials from './pages/dashboard/Testimonials';
import Faqs from './pages/dashboard/Faqs';
import Content from './pages/dashboard/Content';
import Settings from './pages/dashboard/Settings';
import VisualEditor from './pages/dashboard/VisualEditor';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return auth.isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute><Layout /></PrivateRoute>}
        >
          <Route index element={<Navigate to="/dashboard/editor" replace />} />
          <Route path="editor" element={<VisualEditor />} />
          <Route path="overview" element={<Overview />} />
          <Route path="projects" element={<Projects />} />
          <Route path="services" element={<Services />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="content" element={<Content />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to={auth.isLoggedIn() ? '/dashboard' : '/login'} replace />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
