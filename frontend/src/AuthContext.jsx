import { createContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        setIsAuthenticated,
        setUser,
        token,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
