import { useState, useEffect } from "react";

export function useAuth() {
  const [isMainAppAuthenticated, setIsMainAppAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check session storage for authentication status
    const mainAuth = sessionStorage.getItem('main-app-auth');
    const adminAuth = sessionStorage.getItem('admin-auth');
    
    if (mainAuth === 'true') {
      setIsMainAppAuthenticated(true);
    }
    
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const authenticateMainApp = () => {
    setIsMainAppAuthenticated(true);
    sessionStorage.setItem('main-app-auth', 'true');
  };

  const authenticateAdmin = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('admin-auth', 'true');
  };

  const logout = () => {
    setIsMainAppAuthenticated(false);
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('main-app-auth');
    sessionStorage.removeItem('admin-auth');
  };

  return {
    isMainAppAuthenticated,
    isAdminAuthenticated,
    authenticateMainApp,
    authenticateAdmin,
    logout
  };
}