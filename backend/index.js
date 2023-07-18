require("dotenv").config();

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const cors = require("cors");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const { PORT, MONGO_URI, SECRET } = process.env;
const p = require("./defaultProblems");
const app = express();

const Schema = mongoose.Schema,
  model = mongoose.model;

mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("Not connected to DB");
  });

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

Counter.findOne({ fieldName: "problems" }).then((counter) => {
  if (!counter) {
    new Counter({ fieldName: "problems" }).save();
  }
});

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

/* p.forEach(async (problem) => {
  const prob = await Problem.findOne(problem);
  if (!prob) {
    new Problem(problem).save();
  }
}); */

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

app.route("/auth").post((req, res) => {
  if (req.isAuthenticated()) {
    return res.send({
      _id: req.user._id,
      username: req.user.username,
    });
  }
  res.json({ username: null });
});

app.route("/auth/login").post((req, res, next) => {
  if (req.isAuthenticated()) {
    return res.send({ message: "an account is already logged in" });
  }
  if (!req.body.username || !req.body.password) {
    return res.send({ message: "both username and password are required" });
  }
  next();
}, login);

app.route("/auth/signup").post(
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

app.route("/auth/logout").post((req, res) => {
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
    const tcbase = path.join(__dirname, 'testcases',`${pno}`)
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
