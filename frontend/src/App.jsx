import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { routes } from './routes/routes.jsx';
import { Aurora } from './components/Aurora/Aurora';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import './styles/safari-overrides.css';
import { ProfilePhotoProvider } from './context/ProfilePhotoContext';

function AppRoutes() {
  return (
      <AnimatePresence mode="wait">
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
        </Routes>
      </AnimatePresence>
  );
}

function App() {
  return (
    <ProfilePhotoProvider>
      <HelmetProvider>
        <Router>
          <Aurora />
          <Suspense fallback={null}>
            <AppRoutes />
          </Suspense>
        </Router>
      </HelmetProvider>
    </ProfilePhotoProvider>
  );
}

export default App;