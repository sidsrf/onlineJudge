import { useEffect } from "react";
import ProblemCard from "./ProblemCard";

const Problems = ({ onFetch, problems }) => {
  useEffect(() => {
    onFetch();
  }, []);
  return (
    <>
      <div className="flex-grow py-24">
        <div className="mx-auto text-center w-1/2">
          {problems != [] &&
            problems.map((problem, i) => (
              <ProblemCard
                key={problem._id}
                pname={problem.pname}
                index={i}
              ></ProblemCard>
            ))}
        </div>
      </div>
    </>
  );
};

export default Problems;
