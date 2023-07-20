import { useState, useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import axios from "axios";
import Root from "./Root";
import Home from "./Home";
import LoginPage from "./LoginPage";
import Problems from "./Problems";
import Submissons from "./Submissions";
import Problem from "./Problem";
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

  const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
  });

  const getUser = () => {
    api
      .post("/auth")
      .then(
        (res) => {
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
        },
        (reason) => {
          console.log("get user rejected", reason);
        }
      )
      .catch((err) => {
        console.log("getuser catch", err);
      });
  };

  const logout = async () => {
    return await api
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
        return "internal error";
      });
  };

  useEffect(() => {
    getUser();
  }, []);

  const routes = createBrowserRouter([
    {
      path: "",
      element: (
        <Root
          isLoggedIn={state.isLoggedIn}
          onLogout={logout}
          username={state.username}
        />
      ),
      errorElement: <>Page not found</>,
      children: [
        {
          path: "",
          element: (
            <Home username={state.username} isLoggedIn={state.isLoggedIn} />
          ),
        },
        {
          path: "login",
          element: (
            <LoginPage
              isLoggedIn={state.isLoggedIn}
              username={state.username}
              password={state.password}
              updateState={updateState}
              onFormSubmit={handleAuthForm}
              onLogout={logout}
            />
          ),
        },
        {
          path: "problem/all",
          element: <Problems />,
        },
        {
          path: "problem/:pno",
          element: <Problem isLoggedIn={state.isLoggedIn} />,
        },
        {
          path: "submissions",
          element: <Submissons />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
};

export default App;
