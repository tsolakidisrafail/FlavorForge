// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import RecipeDetail from './components/RecipeDetail';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1><Link to="/">FlavorForge</Link></h1>
        <nav>
          <Link to="/add-recipe">Προσθήκη Συνταγής</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/add-recipe" element={<RecipeForm />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;