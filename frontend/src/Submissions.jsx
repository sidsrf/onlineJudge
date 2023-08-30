import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { format } from "date-fns";
import Modal from "./Modal";
import authConext from "./AuthContext";
const Submissons = () => {
  const { isAuthenticated, user } = useContext(authConext);

  const [sub, setSub] = useState([]);
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");
  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL + "/submissions",
    // withCredentials: true,
  });
  useEffect(() => {
    document.title = "mOJ | Submissions";
    api.get("/all").then(
      (res) => {
        // console.log("res", res);
        if (res.data.error) {
          setSub({ error: "DB error" });
        } else {
          setSub(res.data);
        }
      },
      (reason) => {
        // console.log("reason", reason);
        setSub({ error: "API Error" });
      }
    );
  }, []);
  return (
    <>
      <div className="flex-grow">
        {sub.error ? (
          "Error while fetching submissions"
        ) : (
          <div className="w-2/3 mx-auto bg-slate-200">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <td>username</td>
                  <td>problem</td>
                  <td>lang</td>
                  <td>verdict</td>
                  <td>time</td>
                  <td>code</td>
                </tr>
              </thead>
              <tbody>
                {sub.map((s) => (
                  <tr key={s._id} className="">
                    <td>{s.username}</td>
                    <td>{s.pno}</td>
                    <td>{s.lang}</td>
                    <td>{s.verdict}</td>
                    <td>{format(new Date(s.time), "yy-MM-dd HH:mm:ss")}</td>
                    <td>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            alert("please log in to view submission");
                          } else {
                            if (user != s.username) {
                              alert("You can view only your submissions");
                            } else {
                              setCode(s.code);
                              setShow(true);
                            }
                          }
                        }}
                      >
                        {`>`}{" "}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Modal
          code={code}
          show={show}
          onClose={() => {
            setShow(false);
          }}
        ></Modal>
      </div>
    </>
  );
};

export default Submissons;
