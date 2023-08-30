import { useState, useEffect } from "react";
import ProblemCard from "./ProblemCard.jsx";
import { problemApi } from "./App.jsx";

const Problems = () => {
  let [problems, setProblems] = useState([]);

  const getProblems = async () => {
    return await problemApi
      .get("/all")
      .then(
        (res) => {
          if (!res.data.error) {
            return res.data;
          }
          return { err: "Cannot fetch" };
        },
        (reason) => {
          return { err: "cannot fetch" };
        }
      )
      .catch((err) => {
        return { err: "cannot fetch" };
      });
  };

  useEffect(() => {
    document.title = "mOJ | Problems";
    getProblems().then((res) => {
      setProblems(res);
    });
  }, []);

  return (
    <>
      <div className="flex-grow py-24">
        <div className="mx-auto text-center w-1/2">
          {problems.err ? (
            <>Error while fetching problems</>
          ) : (
            problems.map((problem, i) => (
              <ProblemCard
                key={problem._id}
                pname={problem.pname}
                index={problem.pno}
              ></ProblemCard>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Problems;
