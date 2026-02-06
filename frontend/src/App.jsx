// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';

// // --- Page Imports ---
// // import Home from "./pages/Home"
import Splash from "./pages/Splash"
import Editor from "./pages/Editer"
import Auth from "./pages/Auth"
import Recent from './pages/Recent';

// // Simple placeholder for the Rec
// // ent page (prevents 404 crash)
// const RecentPlaceholder = () => (
//   <div className="h-screen bg-[#09090b] text-white flex items-center justify-center font-mono text-xl">
//     DATABASE CONNECTION PENDING...
//   </div>
// );

// const App = () => {
//   // 1. Manage User State
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true); // Prevents flickering on reload

//   // 2. Check for existing login on load
//   useEffect(() => {
//     const savedUser = localStorage.getItem("savetrax_user");
//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//     setLoading(false);
//   }, []);

//   // 3. Create the Login Handler
//   const handleLogin = (userData) => {
//     localStorage.setItem("savetrax_user", JSON.stringify(userData));
//     setUser(userData);
//   };

//   // 4. Create the Logout Handler (Passed to Home)
//   const handleLogout = () => {
//     localStorage.removeItem("savetrax_user");
//     setUser(null);
//   };

//   if (loading) return null; // or a simple spinner

//   return (
//     <Router>
//       <Routes>
//         {/* --- Public Routes --- */}
//         <Route path="/" element={<Splash />} />
        
//         {/* Auth: If logged in -> go to Home, else -> show Login form */}
//         <Route 
//           path="/register" 
//           element={user ? <Navigate to="/home" /> : <Auth onLogin={handleLogin} />} 
//         />

//         {/* --- Protected Routes --- */}
        
//         {/* Home: Needs user prop for name display & logout handler */}
//         <Route 
//           path="/home" 
//           element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/register" />} 
//         />
        
//         {/* Editor: Protected Annotation Tool */}
//         <Route 
//           path="/editor" 
//           element={user ? <Editor /> : <Navigate to="/register" />} 
//         />

//         {/* Recent: Placeholder for future database history */}

//         <Route 
//           path="/recent" 
//           element={Recent ? <Editor /> : <Navigate to="/register" />} 
//         />

//       </Routes>
//     </Router>
//   );
// };

// export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Page Imports ---
// import Splash from "./pages/Splash";
// import Auth from "./pages/Auth";
// import Home from './pages/Home';
// import Editor from "./pages/Editor"; // Ensure file is named Editor.js (not Editer.js)
// import Recent from './pages/Recent';

const App = () => {
  // 1. Manage User State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Check for existing login on load
  useEffect(() => {
    const savedUser = localStorage.getItem("savetrax_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // 3. Login Handler
  const handleLogin = (userData) => {
    localStorage.setItem("savetrax_user", JSON.stringify(userData));
    setUser(userData);
  };

  // 4. Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("savetrax_user");
    setUser(null);
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        
        {/* --- Public Routes --- */}
        <Route path="/" element={<Splash />} />
        
        <Route 
          path="/register" 
          element={user ? <Navigate to="/home" /> : <Auth onLogin={handleLogin} />} 
        />

        {/* --- Protected Routes --- */}
        
        {/* 1. HOME DASHBOARD */}
        <Route 
          path="/home" 
          element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/register" />} 
        />
        
        {/* 2. EDITOR TOOL */}
        <Route 
          path="/editor" 
          element={user ? <Editor /> : <Navigate to="/register" />} 
        />

        {/* 3. RECENT / LOAD DATA (Fixed) */}
        <Route 
          path="/recent" 
          // Check if 'user' exists, then render the 'Recent' component
          element={user ? <Recent /> : <Navigate to="/register" />} 
        />

      </Routes>
    </Router>
  );
};

export default App;