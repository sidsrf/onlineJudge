import { useEffect, useState, useContext } from "react";
import AuthContext from "./AuthContext";
import { authApi } from "./App";
const Login = () => {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [formAction, setFormAction] = useState("login");
  let [message, setMessage] = useState("");
  const { isAuthenticated, setIsAuthenticated, setUser, token, setToken } =
    useContext(AuthContext);

  const handleLogin = () => {
    authApi
      .post(
        import.meta.env.VITE_LOGIN_PATH,
        {
          username: username,
          password: password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(
        (res) => {
          setMessage(res.data.message || res.data.error);
          if (res.data.success) {
            setIsAuthenticated(true);
            setUser(res.data.username);
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            setMessage("Login Successful");
          }
          setTimeout(() => {
            setMessage("");
          }, 5000);
        },
        (err) => {
          // console.log("Login call Rejected");
          setMessage("Internal error");
          setTimeout(() => {
            setMessage("");
          }, 5000);
        }
      );
  };
  const handleSignup = () => {
    authApi
      .post(
        import.meta.env.VITE_SIGNUP_PATH,
        {
          username: username,
          password: password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(
        (res) => {
          // console.log(res.data);
          setMessage(res.data.message || res.data.error);
          if (res.data.success) {
            setIsAuthenticated(true);
            setUser(res.data.username);
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            setMessage("Signed up successfully and logged in automatically");
          }
          setTimeout(() => {
            setMessage("");
          }, 5000);
        },
        (err) => {
          // console.log("SIGNUP rejected");
          setMessage("Internal error");
          setTimeout(() => {
            setMessage("");
          }, 5000);
        }
      );
  };
  const handleLogout = () => {
    if (isAuthenticated) {
      authApi
        .post(
          import.meta.env.VITE_LOGOUT_PATH,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(
          (res) => {
            // console.log(res.data);
            setMessage(res.data.message || res.data.error);
            if (res.data.success) {
              setIsAuthenticated(false);
              setUser(null);
              setMessage("Logout Successful");
              setToken(null);
              localStorage.removeItem("token");
            }
            setTimeout(() => {
              setMessage("");
            }, 5000);
          },
          (err) => {
            // console.log("LOGOUT Rejected");
            setMessage("Internal error");
            setTimeout(() => {
              setMessage("");
            }, 5000);
          }
        );
    } else {
      // console.log("No user to logout");
    }
  };

  useEffect(() => {
    document.title = `MOJ | ${isAuthenticated ? "Logout" : formAction}`;
  }, [formAction]);

  return (
    <>
      <div className="flex flex-col flex-grow justify-center">
        <div className="flex justify-center">
          {!isAuthenticated ? (
            <form
              className="flex flex-col gap-10 border border-black p-10"
              onSubmit={(e) => {
                e.preventDefault();
                if (formAction == "login") {
                  handleLogin();
                } else {
                  handleSignup();
                }
              }}
            >
              <select
                name="formAction"
                id="formAction"
                onChange={(e) => {
                  setFormAction(e.target.value);
                }}
              >
                <option value="login">LOGIN</option>
                <option value="signup">SIGNUP</option>
              </select>
              <label htmlFor="username" className="gap-2">
                <span>Username: </span>
                <input
                  type="text"
                  placeholder={
                    formAction == "login" ? "username" : "atleast 6 chars"
                  }
                  name="username"
                  id="username"
                  className="p-2"
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  required
                  minLength="6"
                />
              </label>
              <label htmlFor="password" className="gap-2">
                <span>Password: </span>
                <input
                  type="password"
                  placeholder={
                    formAction == "login" ? "password" : "atleast 6 chars"
                  }
                  name="password"
                  id="password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className="p-2"
                  required
                  minLength="6"
                />
              </label>
              <input
                type="submit"
                value="SUBMIT"
                className="hover:bg-black hover:text-white"
              />
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <input type="submit" value="LOGOUT" />
            </form>
          )}
        </div>
        <div className="flex justify-center">{message}</div>
      </div>
    </>
  );
};

export default Login;
