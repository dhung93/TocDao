import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Tree from './pages/Tree';
import TreePhoHe from './pages/TreePhoHe';
import Activities from './pages/Activities';
import Admin from './pages/Admin';
import Login from './pages/Login';
import PostDetail from './pages/PostDetail';
import { supabase } from './supabaseClient';
import './index.css';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar session={session} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sodo" element={<Tree />} />
          <Route path="/sodophohe" element={<TreePhoHe />} />
          <Route path="/hoatdong" element={<Activities session={session} type="Hoạt động" />} />
          <Route path="/thongbao" element={<Activities session={session} type="Thông báo" />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/login" element={session ? <Navigate to="/admin" /> : <Login />} />
          <Route path="/admin/*" element={session ? <Admin session={session} /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
