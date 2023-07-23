require("dotenv").config();
const express = require("express");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const path = require("path");
const cp = require("child_process");
const cors = require("cors");
// const testcases = require("./testcases");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const base = path.join(__dirname, "submissions");
const cbase = path.join(__dirname, "compiled");

if (!fs.existsSync(base)) {
  fs.mkdirSync(base);
}
if (!fs.existsSync(cbase)) {
  fs.mkdirSync(cbase);
}

const runCode = (cFilePath, ext, inpStr) => {
  const rCommands = {
    cpp: `${cFilePath}`,
    py: `python3 ${cFilePath}`,
  };
  const rCommand = rCommands[ext].split(" ");
  try {
    console.log("running the code");
    const result = cp.spawnSync(rCommand[0], [...rCommand.slice(1)], {
      input: inpStr,
      timeout: { cpp: 2000, py: 5000 }[ext],
    });
    console.log("runspawn result", result);
    if (result.status === null) {
      console.log("TLE");
      return { error: "Time limit exceeded", errorType: "TLE" };
    } else {
      if (result.status != 0) {
        console.log("runtime error", result.stderr.toString());
        return { error: "Runtime error", errorType: "RTE" };
      } else {
        console.log("run successful", result.stdout.toString());
        return { output: result.stdout.toString() };
      }
    }
  } catch (err) {
    console.log("runerr", err);
    return { error: "Internal error", errorType: "IE" };
  }
};

const cCommands = (filePath, cFilePath, ext) => {
  // cpp: `g++ ${filePath} -o ${cFilePath}`,
  if (ext == "cpp") {
    return `g++ ${filePath} -o ${cFilePath}`;
  }
  return filePath;
};

const compile = (ext, code) => {
  const fname = uuid();
  const fullname = `${fname}.${ext}`;
  const filePath = path.join(base, fullname);
  fs.writeFileSync(filePath, code);
  let cFilePath;
  if (ext == "py") {
    cFilePath = filePath;
    return { cFilePath: cFilePath };
  } else {
    cFilePath = path.join(cbase, fname);
  }
  try {
    const ch = cp.spawnSync(cCommands(filePath, cFilePath, ext).split(" ")[0], [
      ...cCommands(filePath, cFilePath, ext).split(" ").slice(1),
    ]);
    console.log("compile function", ch);
    console.log("stderr0", ch.stderr.toString());
    if (!ch.stderr.toString()) {
      console.log("compilation successful");
      return { cFilePath: cFilePath };
    } else {
      console.log("Compilation error");
      return { errorType: "CE", error: "Compilation error" };
    }
  } catch (err) {
    console.log("compile spawn sync error");
    return { error: "Internal Error", errorType: "IE" };
  }
};

app.route("/run").post((req, res) => {
  const { code, ext, inpStr } = req.body;
  const c = compile(ext, code);
  if (c.error) {
    console.log("Some error occured in compile function");
    res.send(c);
  } else {
    const result = runCode(c.cFilePath, ext, inpStr);
    res.send(result);
  }
});

app.route("/judge").post((req, res) => {
  const { lang, code, pno, tcs } = req.body;
  const c = compile(lang, code);
  if (c.error) {
    console.log("Some error occured in compile function");
    res.send(c);
  } else {
    for (var i = 0; i < tcs["inputs"].length; i++) {
      const o = runCode(c.cFilePath, lang, tcs["inputs"][i]);
      if (o.error) {
        console.log("o.error", o.error);
        res.send(o);
        break;
      } else {
        console.log("o.output", o.output);
        if (o.output != tcs["outputs"][i]) {
          console.log(`Wrong answer in testcase ${i}`);
          res.send({
            verdict: `Wrong Answer in testcase ${i}`,
            errorType: `WA-TC${i}`,
          });
          break;
        }
      }
    }
    if (!res.headersSent) {
      res.send({ verdict: "ACCEPTED" });
    }
  }
});

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`OC running at http://localhost:${PORT}`);
});
