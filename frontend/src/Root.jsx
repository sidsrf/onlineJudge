import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
const Root = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar></Navbar>
      <Outlet></Outlet>
    </div>
  );
};

export default Root;
