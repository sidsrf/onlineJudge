require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { MONGO_URI } = process.env

mongoose
    .connect(MONGO_URI, {})
    .then(() => {
        console.log("DB Connected");
    })
    .catch((err) => {
        console.log("Not connected to DB");
    });

const Schema = mongoose.Schema, model = mongoose.model;

const counterSchema = new Schema({
    fieldName: {
        type: String,
    },
    count: {
        type: Number,
        default: 0,
    },
});

const Counter = model("Counter", counterSchema);

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "no username in document"],
    },
    password: {
        type: String,
        required: [true, "no password in document"],
    },
});

userSchema.methods = {
    verifyPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
    },
    hashPassword: function (password) {
        return bcrypt.hashSync(password, 10);
    },
};

userSchema.pre("save", function (next) {
    if (!this.password) {
        return console.log("password not provided");
    }
    this.password = this.hashPassword(this.password);
    next();
});

const User = model("User", userSchema);

const problemSchema = new Schema({
    pno: {
        type: Number,
    },
    pname: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    sampleinput: {
        type: String,
    },
    sampleoutput: {
        type: String,
    },
});

problemSchema.pre("save", function (next) {
    Counter.findOneAndUpdate(
        { fieldName: "problems" },
        { $inc: { count: 1 } }
    ).then((counter) => {
        this.pno = counter.count;
        next();
    });
});

const Problem = model("Problem", problemSchema);

const subSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    pno: {
        type: Number,
        required: true,
    },
    lang: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    verdict: {
        type: String,
        required: true,
    },
    time: Date
})

const Submission = model('Submission', subSchema);



module.exports = {
    mongoose: mongoose, User: User, Problem: Problem, Counter: Counter, Submission: Submission
}
