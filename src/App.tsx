import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Information from './pages/Information';
import NotFound from './pages/NotFound';
import AppKiosk from './pages/kiosk/AppTailwind';
import AppDashboard from './pages/Dashboard/AppDash';
import Appevents from "./pages/Events/Appevents"
import CrowdManagement from './pages/Heatmap/CrowdManagement';
import Dashboard from './pages/Maps/Dashboard';

import AuthPage from './pages/signup/AuthPage';
import UserProfile from './pages/signup/UserProfile';
import LogoutPage from './pages/signup/LogoutPage';
import NotificationsPage from './pages/NotificationsPage';
import MemoriesPage from './pages/MemoriesPage';



function AppContent() {
  const location = useLocation();
  const isKiosk = location.pathname.startsWith('/kiosk');
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuth = location.pathname === '/auth';
  const isProfile = location.pathname === '/profile';
  const isLogout = location.pathname === '/logout';

  return (
    <div className="App">
      {!isDashboard && !isKiosk && !isAuth && !isProfile && !isLogout && <Navbar />}
      <main style={{ minHeight: 'calc(100vh - 140px)', paddingTop: !isDashboard && !isKiosk && !isAuth && !isProfile && !isLogout ? '70px' : '0' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/crowd-management" element={<CrowdManagement />} />
          <Route path="/information" element={<Information />} />
          <Route path="/kiosk" element={<AppKiosk />} />
          <Route path="/dashboard/*" element={<AppDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/events/*" element={<Appevents />} />
          <Route path="/map" element={<Dashboard kiosk_mode={false}/>} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/memories" element={<MemoriesPage />} />
        </Routes>
      </main>
      {!isDashboard && !isKiosk && !isAuth && !isProfile && !isLogout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;