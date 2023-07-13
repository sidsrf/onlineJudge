import { useLoaderData } from "react-router-dom";

const Problem = () => {
  let problem = useLoaderData();
  console.log(problem);

  return (
    <>
      {problem.error ? (
        "no such problem"
      ) : (
        <>Problem {problem && problem.pname}</>
      )}
    </>
  );
};
export default Problem;
