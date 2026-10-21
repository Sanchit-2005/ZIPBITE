import { createContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status-codes";

export const Authcontext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8000/users",
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserdata] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const router = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );

  const handleRegister = async (name, email, password) => {
    const request = await client.post("/register", {
      name,
      email,
      password,
    });

    return request.data.message;
  };

  const handleLogin = async (email, password) => {
    const request = await client.post("/login", {
      email,
      password,
    });

    if (request.status === httpStatus.ACCEPTED) {
      localStorage.setItem("token", request.data.token);

      setUserdata(request.data.user);

      localStorage.setItem("userData", JSON.stringify(request.data.user));

      setIsAuthenticated(true);
      router("/home");
    }

    return request.data.message;
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    setUserdata(null);
    setIsAuthenticated(false);

    router("/home");
  };

  return (
    <Authcontext.Provider
      value={{
        userData,
        setUserdata,
        handleLogin,
        handleRegister,
        isAuthenticated,
        setIsAuthenticated,
        handleLogout,
      }}
    >
      {children}
    </Authcontext.Provider>
  );
};
