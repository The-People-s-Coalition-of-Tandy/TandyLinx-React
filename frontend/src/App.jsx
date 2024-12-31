import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './Login';
// import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import Editor from './Editor';
import Profile from './Profile';
import './App.css';
function App() {
  const { logout } = useAuth();
  return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route
            path="/:pageURL/edit"
            element={
              <ProtectedRoute>
                <>
                <Editor />
                <button onClick={() => {
                  console.log("logout");
                  logout();
                  }}>logout</button>
                </>
              </ProtectedRoute>
            }
          />
          
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        </Routes>
      </Router>
  );
}

export default App;