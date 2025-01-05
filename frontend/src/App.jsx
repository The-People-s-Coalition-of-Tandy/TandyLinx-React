import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { routes } from './routes/routes.jsx';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} {...route} />
            ))}
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;