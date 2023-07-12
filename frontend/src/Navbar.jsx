import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn, username, onLogout }) => {
  return (
    <>
      <div className="flex w-full bg-red-400 justify-between px-5 py-2">
        <span>minimalistic OJ</span>
        <ul className="flex justify-center gap-10">
          <li>
            <Link to="/">HOME</Link>
          </li>
          <li>
            <Link to="/problems">PROBLEMS</Link>
          </li>
        </ul>
        {isLoggedIn ? (
          <button onClick={onLogout}>LOGOUT  {username}</button>
        ) : (
          <Link to="/login">LOGIN</Link>
        )}
      </div>
    </>
  );
};

export default Navbar;
