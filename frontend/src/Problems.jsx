import { useEffect, useState } from "react";
import ProblemCard from "./ProblemCard";
import axios from "axios";

const Problems = () => {
  let [problems, setProblems] = useState([]);
  const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
  });

  const getProblems = async () => {
    return await api
      .get("/problem/all")
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
