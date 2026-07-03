import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();
const API_BASE = 'https://api.greatwildlifephotos.com';
const TOKEN_KEY = 'gwp_admin_token';

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      setCurrentAdmin({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password, turnstileToken = '') => {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, turnstileToken })
    });
    const data = await res.json();
    if (data.mfaRequired) return data;
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid email or password');
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setCurrentAdmin({ token: data.token, ...data.user });
    return data;
  };

  const completeMfaLogin = async (mfaToken, code) => {
    const res = await fetch(API_BASE + '/auth/login/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaToken, code })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid authenticator code');
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setCurrentAdmin({ token: data.token, ...data.user });
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setCurrentAdmin(null);
  };

  const value = {
    currentAdmin,
    login,
    completeMfaLogin,
    logout,
    loading
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};
