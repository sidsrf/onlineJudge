// import dotenv from "dotenv";
// dotenv.config();

import fs from "fs";
import { v4 as uuid } from "uuid";
import path from "path";
import cp from "child_process";
import { Testcase } from "./Modals.js";
import connectDB from "./db.js";

let testcases = [];

connectDB().then(() => {
  Testcase.find({})
    .sort({ pno: "asc" })
    .then(
      (doc) => {
        testcases = doc;
      },
      (reason) => {
        console.log("Unable to load testcases");
        console.log(reason);
      }
    );
});

const base = path.join(process.cwd(), "submissions");
const cbase = path.join(process.cwd(), "compiled");

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
    // console.log("runspawn result", result);
    if (result.status === null) {
      console.log("TLE");
      return { error: "Time limit exceeded", errorType: "TLE" };
    } else {
      if (result.status != 0) {
        console.log("runtime error", result.stderr.toString());
        return { error: "Runtime error", errorType: "RTE" };
      } else {
        console.log("run successful", result.stdout.toString());
        return { output: result.stdout.toString().trim() };
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

export const runF = async ({ code, ext, inpStr }) => {
  return new Promise((resolve, reject) => {
    const c = compile(ext, code);
    console.log("c", c);
    if (c.error) {
      console.log("Some error occured in compile function");
      resolve(c);
    } else {
      const result = runCode(c.cFilePath, ext, inpStr);
      resolve(result);
    }
  });
};

export const judgeF = async ({ lang, code, pno }) => {
  return new Promise((resolve, reject) => {
    const tcs = testcases[pno];
    // console.log(testcases[pno])
    const c = compile(lang, code);
    if (c.error) {
      console.log("Some error occured in compile function");
      resolve(c);
    } else {
      for (var i = 0; i < tcs["inputs"].length; i++) {
        const o = runCode(c.cFilePath, lang, tcs["inputs"][i]);
        if (o.error) {
          console.log("o.error", o.error);
          resolve(o);
          break;
        } else {
          console.log("o.output", o.output);
          if (o.output != tcs["outputs"][i]) {
            console.log(`Wrong answer in testcase ${i}`);
            resolve({
              verdict: `Wrong Answer in testcase ${i}`,
              errorType: `WA-TC${i}`,
            });
            break;
          }
        }
      }
      resolve({ verdict: "ACCEPTED" });
    }
  });
};
