import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { initializeWebSocket } from './services/websocket';

// Layout Components
import Layout from './components/Layout';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Main Components
import Dashboard from './components/dashboard/Dashboard';
import AttractionsList from './components/attractions/AttractionsList';
import AttractionDetails from './components/attractions/AttractionDetails';
import EventsList from './components/events/EventsList';
import EventDetails from './components/events/EventDetails';
import TransportationDashboard from './components/transportation/TransportationDashboard';
import PRTTracking from './components/transportation/PRTTracking';
import CourtesyCars from './components/transportation/CourtesyCars';
import MapView from './components/maps/MapView';
import POISearch from './components/maps/POISearch';
import SelfGuidedTour from './components/tours/SelfGuidedTour';
import FeedbackForm from './components/feedback/FeedbackForm';

// Admin Components
import UserManagement from './components/users/UserManagement';
import ContentManagement from './components/admin/ContentManagement';
import NotificationManager from './components/admin/NotificationManager';

function App() {
  const { isAuthenticated, token, loading, user } = useAuth();
  const [wsConnected, setWsConnected] = useState(false);
  
  useEffect(() => {
    // Initialize WebSocket connection if user is authenticated
    if (isAuthenticated && token) {
      const cleanup = initializeWebSocket(token, {
        onOpen: () => setWsConnected(true),
        onClose: () => setWsConnected(false),
        onError: (error) => console.error('WebSocket error:', error)
      });
      
      return cleanup;
    }
  }, [isAuthenticated, token]);

  // Route guard for admin-only routes
  const AdminRoute = ({ children }) => {
    if (loading) return <div className="loading">Loading...</div>;
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    if (!user?.roles?.includes('admin')) {
      return <Navigate to="/dashboard" />;
    }
    
    return children;
  };

  // Route guard for authenticated routes
  const PrivateRoute = ({ children }) => {
    if (loading) return <div className="loading">Loading...</div>;
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  // Route guard to redirect authenticated users away from login/register
  const PublicRoute = ({ children }) => {
    if (loading) return <div className="loading">Loading...</div>;
    
    if (isAuthenticated) {
      return <Navigate to="/dashboard" />;
    }
    
    return children;
  };

  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Authenticated Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard wsConnected={wsConnected} />
            </PrivateRoute>
          } />
          
          <Route path="/attractions" element={
            <PrivateRoute>
              <AttractionsList />
            </PrivateRoute>
          } />
          
          <Route path="/attractions/:id" element={
            <PrivateRoute>
              <AttractionDetails />
            </PrivateRoute>
          } />
          
          <Route path="/events" element={
            <PrivateRoute>
              <EventsList />
            </PrivateRoute>
          } />
          
          <Route path="/events/:id" element={
            <PrivateRoute>
              <EventDetails />
            </PrivateRoute>
          } />
          
          <Route path="/transportation" element={
            <PrivateRoute>
              <TransportationDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/transportation/prt" element={
            <PrivateRoute>
              <PRTTracking />
            </PrivateRoute>
          } />
          
          <Route path="/transportation/courtesy" element={
            <PrivateRoute>
              <CourtesyCars />
            </PrivateRoute>
          } />
          
          <Route path="/map" element={
            <PrivateRoute>
              <MapView />
            </PrivateRoute>
          } />
          
          <Route path="/search" element={
            <PrivateRoute>
              <POISearch />
            </PrivateRoute>
          } />
          
          <Route path="/tours/:id?" element={
            <PrivateRoute>
              <SelfGuidedTour />
            </PrivateRoute>
          } />
          
          <Route path="/feedback" element={
            <PrivateRoute>
              <FeedbackForm />
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } />
          
          <Route path="/admin/content" element={
            <AdminRoute>
              <ContentManagement />
            </AdminRoute>
          } />
          
          <Route path="/admin/notifications" element={
            <AdminRoute>
              <NotificationManager />
            </AdminRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
