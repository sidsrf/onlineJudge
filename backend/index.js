require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const { User, Problem, Counter } = require('./db')
const authRoutes = require('./auth')
const passport = require('./passport')
const { PORT, MONGO_URI, SECRET } = process.env;
const app = express();

app.use(
  cors({
    origin: /localhost.*/, // for development only
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

const genFile = async (folder, ext, content) => {
  const fullname = `${uuid()}.${ext}`;
  const filePath = path.join(folder, fullname);
  await fs.writeFileSync(filePath, content);
  return filePath;
};

const compileFile = async (folder, file) => {
  const [fname, ext] = path.basename(file).split(".");
  const outputPath = path.join(folder, fname);

  const commands = {
    cpp: `g++ ${file} -o ${outputPath}`,
  };

  return new Promise((resolve, reject) => {
    exec(commands[ext], (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(outputPath);
    });
  });
};

const runFile = async (file, inFile) => {
  const [fname, ext] = path.basename(file).split('.')

  const commands = {
    py: `python ${file} < ${inFile}`
  }
  const command = () => {
    if (!ext) {
      return `${file} < ${inFile}`
    }
    return commands[ext]
  }

  return new Promise((resolve, reject) => {
    exec(command(), (error, stdout, stderr) => {
      if (error || stderr) {
        reject({ error, stderr });
      }
      resolve(stdout);
    });
  });
};

app.use('/auth', authRoutes)

app.route("/problems").get((req, res) => {
  console.log("fetching problems");
  Problem.find({}, "_id pname pno")
    .then((problems) => {
      res.send(problems);
    })
    .catch((err) => {
      res.json({ error: "Some error occured" });
    });
});

app.route("/problem/:pno").get((req, res) => {
  console.log("fetching problem", req.params["pno"]);
  Problem.findOne({ pno: parseInt(req.params["pno"]) }).then((doc) => {
    if (!doc) {
      return res.send({ error: "The problem does not exist" });
    }
    return res.send(doc);
  });
});

app.route("/problem/submit").post(
  (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.json({ error: "Need to be logged in to submit the code" });
  },
  async (req, res) => {
    const { lang, code, pno } = req.body;
    if (!code) {
      return res.json({ error: "Empty code" });
    }
    const base = path.join(__dirname, "submissions");
    const tcbase = path.join(__dirname, 'testcases', `${pno}`)
    if (!fs.existsSync(base)) {
      fs.mkdirSync(base, { recursive: true });
    }
    // create the file on fs first
    const f = await genFile(base, lang, code);
    console.log("f", f);
    // compile the file
    let compiledFile = null;
    if (lang == 'py') {
      compiledFile = f;
    } else {
      compiledFile = await compileFile(base, f);
    }
    // run the file against test cases
    for (let file of fs.readdirSync(path.join(tcbase, "in"))) {
      let val = await runFile(compiledFile, path.join(tcbase, 'in', file)).catch((err) => {
        console.log('error while running file', err)
      });
      let exp = fs.readFileSync(path.join(tcbase, "out", path.basename(file)))
      // console.log(`TC${file} -> ${val} ${exp}`)
      if (val.trim() == exp) {
        console.log(`test case ${file} passed`)
      } else {
        console.log(`WRONG ANSWER on testcase ${file}`)
        return res.send({
          error: `WRONG ANSWER on testcase ${file}`
        })
      }
    }
    return res.send("ACCEPTED")
  }
);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
