import { useState, useEffect } from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Home from "./Home";
import Navbar from "./Navbar";
import LoginPage from "./LoginPage";
import Problems from "./Problems";
import axios from "axios";
const App = () => {
  let [state, setState] = useState({
    isLoggedIn: false,
    username: null,
    password: null,
  });

  const updateState = (key, value) => {
    setState((pre) => {
      return {
        ...pre,
        [key]: value,
      };
    });
  };

  useEffect(() => {
    if (!state.isLoggedIn) {
      axios
        .post("http://localhost:3000/auth", {}, { withCredentials: true })
        .then((res) => {
          if (res.data.username != null) {
            updateState("username", res.data.username);
            updateState("isLoggedIn", true);
          }
        });
    }
  });

  const api = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 1000,
    withCredentials: true,
  });

  const logout = () => {
    return api
      .post("/auth/logout")
      .then((res) => {
        if (res.data.message == "Logout successful") {
          updateState("isLoggedIn", false);
          updateState("username", null);
          updateState("password", null);
          return "Logout successful";
        } else {
          return res.data.message || res.data.error;
        }
      })
      .catch((err) => {
        return "internal error";
      });
  };

  const handleAuthForm = async ({ username, password, action }) => {
    return api
      .post(`/auth/${action}`, { username, password })
      .then(({ data }) => {
        if (data.username) {
          updateState("username", data.username);
          updateState("isLoggedIn", true);
          return `${action} successful`;
        }
        return data.message || data.error;
      })
      .catch((err) => {
        return "interal error";
      });
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <BrowserRouter>
          <Navbar
            isLoggedIn={state.isLoggedIn}
            onLogout={logout}
            username={state.username}
          ></Navbar>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  username={state.username}
                  isLoggedIn={state.isLoggedIn}
                ></Home>
              }
            ></Route>
            <Route
              path="/login"
              element={
                <LoginPage
                  isLoggedIn={state.isLoggedIn}
                  username={state.username}
                  password={state.password}
                  updateState={updateState}
                  onFormSubmit={handleAuthForm}
                  onLogout={logout}
                ></LoginPage>
              }
            ></Route>
            <Route path="/problems" element={<Problems></Problems>}></Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
};

export default App;
