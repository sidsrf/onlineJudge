import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Root = ({ isLoggedIn, username, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        username={username}
      ></Navbar>
      <Outlet></Outlet>
    </div>
  );
};
export default Root;
