import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connected = localStorage.getItem("isConnected") === "true";
    
    setIsConnected(connected);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isConnected");
    localStorage.removeItem("token");
    
    setIsConnected(false);
  };

  return (
    <>
      <BrowserRouter>
        <nav>
          <Link to="/">Home</Link>
          <p></p>
          {!isConnected && (
            <>
              <Link to="/auth/register">Register</Link>
              <p></p>
              <Link to="/auth/login">Login</Link>
            </>
          )}
          {isConnected && (
            <>
              <p></p>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
        <Routes>
          <Route path="/" element={<Home isConnected={isConnected} onLogout={handleLogout} />} />
          <Route path="/auth/register" element={<Register onLogin={() => {
            setIsConnected(true);
          }} />} />
          <Route path="/auth/login" element={<Login onLogin={() => {
            setIsConnected(true);
          }} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;