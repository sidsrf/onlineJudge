import { Route } from "react-router-dom";
import Home from "./Home";
import Navbar from "./Navbar";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import Problems from "./Problems";
import { Routes } from "react-router-dom";
import { useState } from "react";
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

  const login = ({ username, password }) => {
    if (username == 1 && password == 2) {
      updateState("isLoggedIn", true);
      return "success";
    }
    return "failed";
  };

  const logout = () => {
    updateState("isLoggedIn", false);
    updateState("username", null);
    updateState("password", null);
    return "success";
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <BrowserRouter>
          <Navbar isLoggedIn={state.isLoggedIn} onLogout={logout}></Navbar>
          <Routes>
            <Route path="/" element={<Home></Home>}></Route>
            <Route
              path="/login"
              element={
                <LoginPage
                  isLoggedIn={state.isLoggedIn}
                  username={state.username}
                  password={state.password}
                  updateState={updateState}
                  onLogin={login}
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
