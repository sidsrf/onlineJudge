import { useEffect } from "react";
import ProblemCard from "./ProblemCard";
import { useLoaderData } from "react-router-dom";

const Problems = () => {
  let problems = useLoaderData();
  return (
    <>
      <div className="flex-grow py-24">
        <div className="mx-auto text-center w-1/2">
          {problems != [] &&
            problems.map((problem, i) => (
              <ProblemCard
                key={problem._id}
                pname={problem.pname}
                index={problem.pno}
              ></ProblemCard>
            ))}
        </div>
      </div>
    </>
  );
};

export default Problems;
