// import dotenv from "dotenv";

// dotenv.config();

import { Router } from "express";
import { Problem, Submission } from "./Modals.js";
import { runF, judgeF } from "./handleCode.js";
import passport from "./passport.js";
// const { OC_URL } = process.env;

const router = Router();

const recordSubmission = async (username, pno, lang, code, verdict, time) => {
  return await new Submission({
    username: username,
    pno: pno,
    lang: lang,
    code: code,
    verdict: verdict,
    time: time,
  })
    .save()
    .then(
      (doc) => {
        console.log(doc);
        return { verdict: doc.verdict };
      },
      (r) => {
        return { verdict: "IE" };
      }
    )
    .catch((err) => {
      return { verdict: "IE" };
    });
};

router.route("/all").get((req, res) => {
  console.log("fetching problems");
  Problem.find({}, "_id pname pno")
    .then((problems) => {
      // console.log("problems", problems);
      res.send(problems);
    })
    .catch((err) => {
      res.json({ error: "Some error occured" });
    });
});

router.route("/:pno").get((req, res) => {
  console.log("fetching problem", req.params["pno"]);
  Problem.findOne({ pno: parseInt(req.params["pno"]) }).then(
    (doc) => {
      if (!doc) {
        return res.send({ error: "The problem does not exist" });
      }
      return res.send(doc);
    },
    () => {
      return res.send({ error: "Error while fetching problem details" });
    }
  );
});

router.route("/run").post(async (req, res) => {
  const { lang, code, cinput } = req.body;
  console.log(req.body);
  runF({ code: code, ext: lang, inpStr: cinput })
    .then(
      (obj) => {
        console.log("runF obj");
        console.log(obj);
        res.send(obj);
      },
      (reason) => {
        console.log("run reason");
        console.log(reason);
        res.send({ error: "Compiler down, please try again later" });
      }
    )
    .catch((err) => {
      console.log("run catch", err);
      res.send({ error: "Compiler down, please try again later" });
    });
});

router.route("/submit").post(
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return res.send({ error: "Some error occured" });
      }
      if (!user) {
        return res.send({ error: "Need to be logged in to submit the code" });
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const { lang, code, pno } = req.body;
    console.log(req.body);
    let verdict = "None";
    const time = new Date();
    judgeF({
      lang: lang,
      code: code,
      pno: pno,
    })
      .then(
        async (o) => {
          console.log("o", o);
          verdict = o.errorType ? o.errorType : o.verdict;
          verdict = await recordSubmission(
            req.user.username,
            pno,
            lang,
            code,
            verdict,
            time
          );
          res.send(verdict);
        },
        async (r) => {
          verdict = await recordSubmission(
            req.user.username,
            pno,
            lang,
            code,
            "IE",
            time
          );
          res.send(verdict);
        }
      )
      .catch(async (err) => {
        verdict = await recordSubmission(
          req.user.username,
          pno,
          lang,
          code,
          "IE",
          time
        );
        res.send(verdict);
      });
  }
);

export default router;
