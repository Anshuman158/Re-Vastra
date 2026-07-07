import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { Route, Routes } from 'react-router-dom';
import Add from './pages/Add';
import List from './pages/List';
import Orders from './pages/Orders';
import Sellers from './pages/Sellers';
import DeletedProducts from './pages/DeletedProducts';
import Login from './components/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';

export const backEndURL = import.meta.env.VITE_BACKEND_URL;
export const currency = '₹';

const AppContent = ({ token, setToken }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <ToastContainer
        theme={darkMode ? 'dark' : 'light'}
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <div className="flex flex-col min-h-screen">
          <Navbar setToken={setToken} />
          <main className="flex-1 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/" element={<Dashboard token={token} />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/sellers" element={<Sellers token={token} />} />
                <Route path="/deleted" element={<DeletedProducts token={token} />} />
              </Routes>
            </div>
          </main>

          {/* Footer */}
          <footer className={`py-4 text-center text-sm ${darkMode ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-200'} border-t`}>
            <p>© 2026 ReVastra Admin Panel. All rights reserved.</p>
          </footer>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  return (
    <ThemeProvider>
      <AppContent token={token} setToken={setToken} />
    </ThemeProvider>
  );
};

export default App;
