import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [team, setTeam] = useState(() => {
    const stored = sessionStorage.getItem("team");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem("teamToken"));

  const login = (data) => {
    setTeam(data.team);
    setToken(data.token);
    sessionStorage.setItem("team", JSON.stringify(data.team));
    sessionStorage.setItem("teamToken", data.token);
  };

  const logout = () => {
    setTeam(null);
    setToken(null);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ team, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => useContext(AuthContext);

