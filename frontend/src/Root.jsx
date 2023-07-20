import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Root = ({ isLoggedIn, username }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={isLoggedIn} username={username}></Navbar>
      <Outlet></Outlet>
    </div>
  );
};
export default Root;
