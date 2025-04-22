// frontend/src/App.jsx
import React from 'react';
import RecipeList from './components/RecipeList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>FlavorForge</h1>
      </header>
      <main>
        <RecipeList />
      </main>
    </div>
  );
}

export default App;