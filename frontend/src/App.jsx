import { useState, useEffect } from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Home from "./Home";
import Navbar from "./Navbar";
import LoginPage from "./LoginPage";
import Problems from "./Problems";
import axios from "axios";
import Submissons from "./Submissions";
import Problem from "./Problem";
const App = () => {
  let [state, setState] = useState({
    isLoggedIn: false,
    username: null,
    password: null,
  });

  let [problems, setProblems] = useState([]);

  useEffect(() => {
    console.log("app useeffect");
    getUser();
  }, []);

  const updateState = (key, value) => {
    setState((pre) => {
      return {
        ...pre,
        [key]: value,
      };
    });
  };

  const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
  });

  const fetchProblems = async () => {
    api.get("/problems").then((res) => {
      if (res.data.error) {
        setProblems((pre) => {
          return [];
        });
      } else {
        setProblems((pre) => {
          return res.data;
        });
      }
    });
  };
  const getUser = () => {
    api.post("/auth").then((res) => {
      if (res.data.username != null) {
        setState({
          isLoggedIn: true,
          username: res.data.username,
        });
      } else {
        setState({
          isLoggedIn: false,
          username: null,
        });
      }
    });
  };

  const logout = () => {
    return api
      .post("/auth/logout")
      .then((res) => {
        if (res.data.message == "Logout successful") {
          setState({
            isLoggedIn: false,
            username: null,
            password: null,
          });
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
          setState({
            isLoggedIn: true,
            username: data.username,
          });
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
            <Route
              path="/problems"
              element={
                <Problems
                  onFetch={fetchProblems}
                  problems={problems}
                ></Problems>
              }
            ></Route>
            {/* <Route
              path="/problem/:pno"
              element={
                <Problem problems={problems} onFetch={fetchProblems}></Problem>
              }
            ></Route> */}
            <Route
              path="/submissions"
              element={<Submissons></Submissons>}
            ></Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
};

export default App;
