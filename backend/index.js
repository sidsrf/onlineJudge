require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
// const cookieParser = require("cookie-parser");

const { Submission } = require("./db");
const passport = require("./passport");
const authRoutes = require("./auth");
const { PORT, MONGO_URI, SECRET } = process.env;
const problemRoutes = require("./problem");
const app = express();
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(",") || "";
app.use(
  cors({
    origin: (origin, cb) => {
      ALLOWED_ORIGINS.includes(origin) ? cb(null, true) : cb(null, false);
    },
    credentials: true,
  })
);
// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
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
