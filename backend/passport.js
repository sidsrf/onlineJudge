const { User } = require('./db')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;

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

module.exports = passport

