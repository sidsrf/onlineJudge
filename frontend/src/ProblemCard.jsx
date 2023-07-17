import { Link } from "react-router-dom";

const ProblemCard = ({ pname, index }) => {
  return (
    <>
      <Link to={"/problem/" + index}>
        <div className="border m-5 p-5">{pname}</div>
      </Link>
    </>
  );
};
export default ProblemCard;
