import dotenv from "dotenv";
dotenv.config();

import { User } from "./Modals.js";

import passport from "passport";
import LC from "passport-local";

import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const LocalStrategy = LC.Strategy;

passport.serializeUser((user, done) => {
  console.log(`Serialising user with username: ${user.username}`);
  done(null, { _id: user._id });
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      console.log(`Deserialising user with username: ${user.username}`);
      done(null, user);
    })
    .catch((err) => {
      console.log("Error while deserialising");
    });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: "username not found" });
        }
        if (!user.verifyPassword(password)) {
          return done(null, false, { message: "incorrect password" });
        }
        return done(null, user);
      })
      .catch((err) => {
        done(true, false, { message: "authentication error" });
      });
  })
);

passport.use(
  new JwtStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    ({ username }, done) => {
      User.findOne({ username: username })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "username not found" });
          }
          return done(null, user);
        })
        .catch((err) => {
          done(true, false, { message: "authentication error" });
        });
    }
  )
);

export default passport;
