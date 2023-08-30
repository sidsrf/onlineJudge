import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { problemApi } from "./App.jsx";
import authContext from "./AuthContext.jsx";

const Problem = () => {
  const { isAuthenticated, token } = useContext(authContext);

  let [problem, setProblem] = useState({});
  let { pno } = useParams();
  let [lang, setLang] = useState("cpp");
  let [output, setOutput] = useState("");
  let [cinput, setCinput] = useState("");

  const editorRef = useRef(null);
  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };
  const getCode = () => {
    return editorRef.current?.getValue();
  };

  const handleSubmit = () => {
    if (!getCode()) {
      return setOutput("Code empty");
    }
    if (!isAuthenticated) {
      return setOutput("Need to be logged in to submit the code");
    }
    problemApi
      .post(
        "/submit",
        {
          lang: lang,
          code: getCode(),
          pno: problem.pno,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(
        (res) => {
          // console.log(res);
          if (res.data.error) {
            setOutput(res.data.error);
          } else {
            setOutput(res.data.verdict);
          }
        },
        (reason) => {
          // console.log("reason", reason);
          // if (reason.name == "AxiosError") {
          setOutput("Code not sumitted, please try again later");
        }
      );
  };

  const getProblem = async (pno) => {
    return await problemApi
      .get(`/${pno}`)
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
              <div
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
                <textarea
                  name="cinput"
                  id="cinput"
                  cols="30"
                  placeholder="custom input"
                  className="p-1"
                  onChange={(e) => {
                    setCinput(e.target.value);
                  }}
                ></textarea>
                <span className="flex justify-center gap-5">
                  <button
                    onClick={() => {
                      //   console.log(lang, getCode(), cinput);
                      if (!getCode()) {
                        setOutput("Code empty");
                      } else {
                        problemApi
                          .post("/run", {
                            lang: lang,
                            code: getCode(),
                            cinput: cinput,
                          })
                          .then(
                            (res) => {
                              //   console.log(res.data.output);
                              if (res.data.error) {
                                setOutput(res.data.error);
                              } else {
                                setOutput(res.data.output);
                              }
                            },
                            (r) => {
                              setOutput("compiler down, try again later");
                            }
                          );
                      }
                    }}
                  >
                    RUN
                  </button>
                  <button
                    onClick={() => {
                      handleSubmit();
                    }}
                  >
                    SUBMIT
                  </button>
                </span>
              </div>
              <div className="border flex-grow border-black h-full p-2">
                <pre>{output}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Problem;
