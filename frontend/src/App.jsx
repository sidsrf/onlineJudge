import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useContext, useEffect } from "react";
import AuthContext from "./AuthContext";
import Root from "./Root";
import Home from "./Home";
import Login from "./Login";
import Problems from "./Problems";
import Problem from "./Problem";
import Submissions from "./Submissions";
import axios from "axios";

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  // withCredentials: true,
});

export const problemApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/problem",
  // withCredentials: true,
});

const App = () => {
  const { setIsAuthenticated, setUser, setToken } = useContext(AuthContext);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(() => {
      return t;
    });
    if (!t) {
      setIsAuthenticated(false);
      setUser(null);
    } else {
      authApi
        .post(
          "/auth",
          {},
          {
            headers: {
              Authorization: `Bearer ${t}`,
            },
          }
        )
        .then(
          (res) => {
            // console.log(res);
            if (res.data.username) {
              setIsAuthenticated(() => {
                return true;
              });
              setUser(() => {
                return res.data.username;
              });
            }
          },
          (err) => {
            // console.log("fetch user rejected");
          }
        );
    }
  }, []);

  const routes = createBrowserRouter([
    {
      path: "",
      element: <Root></Root>,
      errorElement: <>Page not found</>,
      children: [
        {
          path: "",
          element: <Home></Home>,
        },
        {
          path: "login",
          element: <Login></Login>,
        },
        {
          path: "problem/all",
          element: <Problems></Problems>,
        },
        {
          path: "problem/:pno",
          element: <Problem></Problem>,
        },
        {
          path: "submissions",
          element: <Submissions></Submissions>,
        },
      ],
    },
  ]);
  return <RouterProvider router={routes}></RouterProvider>;
};

export default App;
