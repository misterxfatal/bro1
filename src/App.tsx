import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ModulesList from './pages/ModulesList';
import ModuleDetail from './pages/ModuleDetail';
import ModuleEditor from './pages/ModuleEditor';
import Leaderboard from './pages/Leaderboard';
import Badges from './pages/Badges';
import Settings from './pages/Settings';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login\" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="modules" element={<ModulesList />} />
                <Route path="modules/:id" element={<ModuleDetail />} />
                <Route path="editor" element={<ModuleEditor />} />
                <Route path="editor/:id" element={<ModuleEditor />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="badges" element={<Badges />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/\" replace />} />
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;