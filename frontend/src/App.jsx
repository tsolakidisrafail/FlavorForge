// frontend/src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import RecipeDetail from './components/RecipeDetail';
import './App.css';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';

function App() {
  const authContextValue = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContextValue) {
    console.error("AuthContext value is undefined. Ensure AuthProvider is used correctly.");
    return <div>Σφάλμα: Το AuthContext δεν είναι διαθέσιμο.</div>;
  }

  const { user, logout } = authContextValue;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1><Link to="/">FlavorForge</Link></h1>
        <nav>
          <Link to="/add-recipe">Προσθήκη Συνταγής</Link> |
          {user ? (
            <>
              <span>Καλώς ήρθες, {user.name}!</span> |
              <button onClick={handleLogout}>Αποσύνδεση</button>
            </>
          ) : (
            <>
            <Link to="/register">Εγγραφή</Link> |
            <Link to="/login">Σύνδεση</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/add-recipe" element={<RecipeForm />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;