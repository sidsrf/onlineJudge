import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";

const Problem = ({ isLoggedIn }) => {
  let [problem, setProblem] = useState({});
  let { pno } = useParams();

  let [lang, setLang] = useState("cpp");
  let [output, setOutput] = useState("");

  const editorRef = useRef(null);

  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const getCode = () => {
    return editorRef.current?.getValue();
  };
  const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
  });

  const handleSubmit = async () => {
    if (!getCode()) {
      return setOutput("Code empty");
    }
    if (!isLoggedIn) {
      return setOutput("Need to be logged in to submit the code");
    }
    api
      .post("/problem/submit", {
        lang: lang,
        code: getCode(),
        pno: problem.pno,
      })
      .then(
        (res) => {
          console.log("api res", res);
          if (res.data.error) {
            setOutput(res.data.error);
          } else {
            setOutput(res.data.verdict);
          }
        },
        (reason) => {
          console.log("reason", reason);
          if (reason.name == "AxiosError") {
            setOutput("Code not sumitted, please try again later");
          }
        }
      )
      .catch((err) => {
        console.log("err", err);
      });
  };

  const getProblem = async (pno) => {
    return await api
      .get(`/problem/${pno}`)
      .then(
        (res) => {
          if (!res.data.error) {
            return res.data;
          }
          return { error: "Cannot fetch" };
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
    getProblem(pno).then((res) => {
      setProblem(res);
    });
    document.title = `mOJ | P-${pno}`;
  }, []);

  return (
    <>
      {problem.err ? (
        "Error while loading problem"
      ) : problem.error ? (
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
                    <option value="java" disabled>
                      Java
                    </option>
                    <option value="py">Python</option>
                  </select>
                </label>
                <Editor
                  className="border border-black"
                  onMount={editorDidMount}
                  defaultLanguage="cpp"
                  language={lang == "cpp" ? "cpp" : "python"}
                  height="50vh"
                ></Editor>
                <span className="flex justify-center gap-2">
                  {/* <button disabled>RUN</button> */}
                  <input type="submit" value="SUBMIT" />
                </span>
              </form>
              <div className="border flex-grow border-black h-11 p-2">
                {output}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Problem;
