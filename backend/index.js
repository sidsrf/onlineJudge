import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import connectDB from "./db.js";
import passport from "./passport.js";
import authRouter from "./auth.js";
import problemRouter from "./problem.js";
import subRouter from "./submissions.js";

const PORT = process.env.PORT || 3000;
// const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
//   ? process.env.ALLOWED_ORIGINS.split(",")
//   : [];
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/problem", problemRouter);
app.use("/submissions", subRouter);
connectDB()
  .then((mongoose) => {
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Some error occured");
  });
