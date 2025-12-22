import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookingPage } from './features/booking/BookingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>MindSettler</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/booking">Book Appointment</a>
            <a href="/chat">Chat Support</a>
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<div>Welcome to MindSettler</div>} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/chat" element={<div>Chat coming soon</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;