import React from 'react';
import './App.css';
import GPT2Demo from './GPT2Demo';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Interactive GPT-2 Demo</h1>
      </header>
      <main>
        <GPT2Demo />
      </main>
      <footer>
        <p>Created for LLM presentation</p>
      </footer>
    </div>
  );
}

export default App;