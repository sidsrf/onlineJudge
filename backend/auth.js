const express = require('express')
const passport = require('./passport')
const { User } = require('./db')
const router = express.Router()

const login = (req, res) => {
    passport.authenticate("local", (err, user, info) => {
        if (!user) {
            return res.send(info);
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                return res.send({ error: "Login error" });
            }
            return res.send({ _id: req.user._id, username: req.user.username });
        });
    })(req, res);
};

router.route("/").post((req, res) => {
    if (req.isAuthenticated()) {
        return res.send({
            _id: req.user._id,
            username: req.user.username,
        });
    }
    res.json({ username: null });
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
            return res.send({ message: "both the entries should have 6 chars atleast" })
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
        new User({ username: username, password: password })
            .save()
            .then((user) => {
                console.log(`Registration successful for username: ${user.username}`);
                next();
            })
            .catch((err) => {
                res.send({ error: "Error while registering" });
            });
    },
    login
);

router.route("/logout").post((req, res) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {
            if (err) {
                return res.send({ error: "Logout error" });
            }
            return res.send({ message: "Logout successful" });
        });
    } else {
        res.send({ message: "no user to log out" });
    }
});

module.exports = router
