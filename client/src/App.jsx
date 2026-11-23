/**
 * App router — public + protected routes.
 *
 * Protected routes are wrapped in <ProtectedRoute> and rendered inside
 * <Layout> (sidebar + topbar shell) via nested <Route element={<Layout/>}>.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CasesList from './pages/cases/CasesList';
import CaseDetail from './pages/cases/CaseDetail';
import CaseForm from './pages/cases/CaseForm';
import HearingsList from './pages/hearings/HearingsList';
import HearingDetail from './pages/hearings/HearingDetail';
import HearingForm from './pages/hearings/HearingForm';
import JudgmentsArchive from './pages/judgments/JudgmentsArchive';
import JudgmentDetail from './pages/judgments/JudgmentDetail';
import JudgmentForm from './pages/judgments/JudgmentForm';
import UsersList from './pages/users/UsersList';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

/** Small helper to gate create/edit pages by role. */
function RoleRoute({ roles, children }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Protected — wrapped by Layout shell */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />

        {/* Cases */}
        <Route path="/cases" element={<CasesList />} />
        <Route path="/cases/new" element={<CaseForm />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/cases/:id/edit" element={<CaseForm />} />

        {/* Hearings */}
        <Route path="/hearings" element={<HearingsList />} />
        <Route path="/hearings/new" element={<HearingForm />} />
        <Route path="/hearings/:id" element={<HearingDetail />} />
        <Route path="/hearings/:id/edit" element={<HearingForm />} />

        {/* Judgments */}
        <Route path="/judgments" element={<JudgmentsArchive />} />
        <Route path="/judgments/new" element={<JudgmentForm />} />
        <Route path="/judgments/:id" element={<JudgmentDetail />} />

        {/* Users — admin only */}
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UsersList />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
