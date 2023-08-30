import { Router } from "express";
import passport from "./passport.js";
import { User } from "./Modals.js";
import jwt from "jsonwebtoken";

const router = Router();

const login = (req, res) => {
  passport.authenticate("local", (err, user, info) => {
    if (!user) {
      return res.send(info);
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.send({ error: "Login error" });
      }
      return res.send({
        _id: req.user._id,
        username: req.user.username,
        success: true,
      });
    });
  })(req, res);
};

const loginjwt = (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return res.send({ error: "Some error occured" });
    }
    if (!user) {
      return res.send(info);
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        return res.send({ error: "Login error" });
      }
      return res.send({
        _id: req.user._id,
        username: req.user.username,
        success: true,
        token: jwt.sign(
          { _id: req.user._id, username: req.user.username },
          process.env.JWT_SECRET
        ),
      });
    });
  })(req, res);
};

router.route("/").post((req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.send({ error: "Some error occured" });
    }
    if (!user) {
      return res.send({ username: null });
    }
    res.send({ _id: user._id, username: user.username });
  })(req, res);
});

router.route("/login").post((req, res, next) => {
  if (req.isAuthenticated()) {
    return res.send({ message: "an account is already logged in" });
  }
  if (!req.body.username || !req.body.password) {
    return res.send({ message: "both username and password are required" });
  }
  next();
}, login);

router.post(
  "/loginjwt",
  (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send({ message: "both username and password are required" });
    }

    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return res.send({ error: "Some error occured" });
      }
      if (user) {
        return res.send({ message: "already logged in" });
      }
      next();
    })(req, res);
  },
  loginjwt
);

router.route("/signup").post(
  (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.send({ error: "cannot signup while logged in" });
    }
    next();
  },
  (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send({ message: "both username and password are required" });
    }
    if (username.length < 6 || password.length < 6) {
      return res.send({
        message: "both the entries should have 6 chars atleast",
      });
    }
    User.findOne({ username: username })
      .then((user) => {
        if (user) {
          return res.send({ message: "username already registered" });
        }
        next();
      })
      .catch((err) => {
        res.send({ error: "Error while checking username availability" });
      });
  },
  (req, res, next) => {
    const { username, password } = req.body;
    console.log(username, password);
    new User({ username, password }).save().then(
      (user) => {
        console.log(`Registration successful for username: ${user.username}`);
        next();
      },
      (error) => {
        console.log("error", error);
        res.send({ error: "Error while registering" });
      }
    );
  },
  login
);

router.post(
  "/signupjwt",
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return res.send({ error: "Some error occured" });
      }
      if (user) {
        return res.send({ message: "Cannot signup while logged in" });
      }
      next();
    })(req, res, next);
  },
  (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send({ message: "both username and password are required" });
    }
    if (username.length < 6 || password.length < 6) {
      return res.send({
        message: "both the entries should have 6 chars atleast",
      });
    }
    User.findOne({ username: username })
      .then((user) => {
        if (user) {
          return res.send({ message: "username already registered" });
        }
        next();
      })
      .catch((err) => {
        res.send({ error: "Error while checking username availability" });
      });
  },
  (req, res, next) => {
    const { username, password } = req.body;
    new User({ username, password }).save().then(
      (user) => {
        console.log(`Registration successful for username: ${user.username}`);
        next();
      },
      (error) => {
        console.log("error", error);
        res.send({ error: "Error while registering" });
      }
    );
  },
  loginjwt
);

router.route("/logout").post((req, res) => {
  if (req.isAuthenticated()) {
    req.logout((err) => {
      if (err) {
        return res.send({ error: "Logout error" });
      }
      return res.send({ message: "Logout successful", success: true });
    });
  } else {
    res.send({ message: "no user to log out" });
  }
});

router.post(
  "/logoutjwt",
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return res.send({ error: "Logout error" });
      }
      if (!user) {
        return res.send({ message: "no user to log out" });
      }
      next();
    })(req, res, next);
  },
  (req, res) => {
    return res.send({ message: "Logout successful", success: true });
  }
);

export default router;
