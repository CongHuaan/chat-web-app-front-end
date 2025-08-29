import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import Rooms from './pages/Rooms.tsx';
import RoomChat from './pages/RoomChat.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';

function PrivateRoute({ children }: { children: ReactElement }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function NavBar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => { setUsername(localStorage.getItem('username')); }, []);
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    navigate('/login');
  };
  return (
    <nav style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #e5e7eb' }}>
      <Link to="/">Trang chủ</Link>
      <Link to="/rooms">Phòng</Link>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
        {username ? (
          <>
            <span style={{ color: '#6b7280' }}>{username}</span>
            <button onClick={logout}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/signup">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%' }}>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/rooms" element={<PrivateRoute><Rooms /></PrivateRoute>} />
          <Route path="/rooms/:roomId" element={<PrivateRoute><RoomChat /></PrivateRoute>} />
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

