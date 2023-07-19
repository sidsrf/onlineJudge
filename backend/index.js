require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");

const { User, Problem, Counter } = require('./db')
const authRoutes = require('./auth')
const passport = require('./passport')
const { PORT, MONGO_URI, SECRET } = process.env;
const testcases = require('./testcases')
const axios = require("axios")
const app = express();

const ocapi = axios.create({
  baseURL: 'http://localhost:3001'
})

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
    if (!req.isAuthenticated()) {
      return res.json({ error: "Need to be logged in to submit the code" });
    }
    next();
  },
  async (req, res) => {
    const { lang, code, pno } = req.body;
    const cFile = await ocapi.post('/compile', { code: code, ext: lang })
    if (cFile.data.error) {
      return res.send({ error: cFile.data.error })
    }
    const newF = cFile.data.file;

    const tcs = testcases[pno];
    for (var i = 0; i < tcs['inputs'].length; i++) {
      const output = await ocapi.post('/run', { cfilePath: newF, inpStr: tcs['inputs'][i], ext: lang })
      if (output.data.error) {
        return res.send({ error: output.data.error })
      }
      if (output.data.output != tcs['outputs'][i]) {
        return res.send({ verdict: `Wrong answer in testcase ${i}` })
      }
    }
    return res.send({ verdict: "ACCEPTED" })
  }
);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
