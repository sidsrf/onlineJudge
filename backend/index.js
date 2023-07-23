require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");

const { Submission } = require("./db");
const passport = require("./passport");
const authRoutes = require("./auth");
const { PORT, MONGO_URI, SECRET } = process.env;
const problemRoutes = require("./problem");
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

app.use("/auth", authRoutes);
app.use("/problem", problemRoutes);

app.route("/submissions/all").get((req, res) => {
  Submission.find({}, "_id username pno lang code verdict time")
    .then((submissions) => {
      res.send(submissions);
    })
    .catch((err) => {
      res.json({ error: "Some error occured" });
    });
});

app.route("/submissions/:username").get((req, res) => {
  Submission.find(
    { username: req.params.username },
    "_id username pno lang code verdict time"
  )
    .then((submissions) => {
      res.send(submissions);
    })
    .catch((err) => {
      res.send({ error: "Some error occured" });
    });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
