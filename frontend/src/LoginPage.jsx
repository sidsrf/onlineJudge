import { useState } from "react";
const LoginPage = ({
  isLoggedIn,
  updateState,
  username,
  password,
  onLogin,
  onLogout,
}) => {
  const handleChange = (e) => {
    updateState(e.target.name, e.target.value);
  };
  let [formAction, setFormAction] = useState("login");
  let [message, setMessage] = useState("");

  return (
    <>
      <div className="flex flex-col flex-grow justify-center">
        <div className="flex justify-center">
          {!isLoggedIn ? (
            <form
              className="flex flex-col gap-10 border border-black p-10"
              onSubmit={(e) => {
                e.preventDefault();
                console.log(username, password, formAction);
                if (formAction == "login") {
                  let res = onLogin({ username: username, password: password });
                  setMessage((pre) => {
                    return res;
                  });
                  setTimeout(() => {
                    setMessage((pre) => {
                      return "";
                    });
                  }, 5000);
                }
              }}
            >
              <select
                name="formAction"
                id="formAction"
                onChange={(e) => {
                  //   console.log(e.target.value);
                  setFormAction(e.target.value);
                }}
              >
                <option value="login">LOGIN</option>
                <option value="signup">SIGNUP</option>
              </select>
              <label htmlFor="username">
                <input
                  type="text"
                  placeholder="username"
                  name="username"
                  id="username"
                  className="p-2"
                  onChange={handleChange}
                />
              </label>
              <label htmlFor="password">
                <input
                  type="password"
                  placeholder="password"
                  name="password"
                  id="password"
                  onChange={handleChange}
                  className="p-2"
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
                onLogout();
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

export default LoginPage;
