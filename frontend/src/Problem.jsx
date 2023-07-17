import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import axios from "axios";

const Problem = () => {
  let problem = useLoaderData();

  let [code, setCode] = useState("");
  let [lang, setLang] = useState("cpp");
  let [output, setOutput] = useState("");

  const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
  });

  const handleSubmit = async () => {
    console.log(lang, code);
    if (!code) {
      return setOutput("Code empty");
    }
    api.post("/problem/submit", { lang: lang, code: code }).then((res) => {
      console.log("api res", res);
      if (res.data.error) {
        setOutput(res.data.error);
      } else {
      }
    });
  };

  return (
    <>
      {problem.error ? (
        "no such problem"
      ) : (
        <div className="flex-grow p-5">
          <div className="grid grid-cols-2">
            <div className="p-10 flex flex-col gap-5">
              <div className="flex justify-center font-bold">
                {problem.pname}
              </div>
              <div className="flex flex-col gap-5">
                <span className="font-bold">Description</span>
                <div>{problem.description}</div>
                <span className="font-bold">Sample input</span>
                <pre>
                  <kbd className="bg-slate-300">{problem.sampleinput}</kbd>
                </pre>
                <span className="font-bold">Sample output</span>
                <pre>
                  <kbd className="bg-slate-300">{problem.sampleoutput}</kbd>
                </pre>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <form
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <label htmlFor="language" className="flex gap-2">
                  Language:
                  <select
                    name="language"
                    id="language"
                    className="flex"
                    onChange={(e) => {
                      setLang((pre) => {
                        return e.target.value;
                      });
                    }}
                  >
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="py">Python</option>
                  </select>
                </label>
                <textarea
                  name="code"
                  id="cod3"
                  rows="10"
                  className="border border-black bg-slate-300 p-1"
                  placeholder="Code here"
                  onChange={(e) => {
                    setCode(e.target.value);
                  }}
                ></textarea>
                <span className="flex justify-center gap-2">
                  {/* <button disabled>RUN</button> */}
                  <input type="submit" value="SUBMIT" />
                </span>
              </form>
              <div className="border flex-grow border-black">{output}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Problem;
