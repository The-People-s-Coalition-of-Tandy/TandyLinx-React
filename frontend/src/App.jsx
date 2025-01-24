import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { routes } from './routes/routes.jsx';
import { Aurora } from './components/Aurora/Aurora';
import { AnimatePresence } from 'framer-motion';
import './App.css';

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
    <HelmetProvider>
      <Router>
        <Aurora />
        <Suspense fallback={null}>
          <AppRoutes />
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;