import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'food_users';
const CURRENT_USER_KEY = 'current_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const getUsers = () => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  };

  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const getUserData = (userId, key) => {
    const userData = localStorage.getItem(`user_${userId}_${key}`);
    return userData ? JSON.parse(userData) : null;
  };

  const saveUserData = (userId, key, data) => {
    localStorage.setItem(`user_${userId}_${key}`, JSON.stringify(data));
  };

  const signUp = (name, password) => {
    const users = getUsers();
    
    if (users[name]) {
      return { success: false, error: 'Username already taken' };
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: userId,
      name,
      password,
      createdAt: new Date().toISOString(),
    };

    users[name] = newUser;
    saveUsers(users);

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    setCurrentUser(newUser);

    return { success: true, user: newUser };
  };

  const login = (name, password) => {
    const users = getUsers();
    const user = users[name];

    if (!user) {
      return { success: false, error: 'Username not found' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setCurrentUser(user);

    return { success: true, user };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  const updateProfile = (name) => {
    const users = getUsers();
    if (users[currentUser.name]) {
      const oldName = currentUser.name;
      const userData = users[oldName];
      delete users[oldName];
      userData.name = name;
      users[name] = userData;
      saveUsers(users);
      
      const updatedUser = { ...currentUser, name };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return { success: true };
    }
    return { success: false };
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      signUp,
      login,
      logout,
      updateProfile,
      getUserData,
      saveUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
