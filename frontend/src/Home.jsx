import { Link } from "react-router-dom";
const Home = () => {
  return (
    <>
      <div className="flex flex-col flex-grow justify-center">
        <div className="flex justify-center">
          <div className="flex flex-col gap-24">
            <div className="text-5xl">minimalistic online judge</div>
            <div className="flex justify-around">
              <Link to="/problems">PROBLEMS</Link>
              <Link to="/login">LOGIN/SIGNUP</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
