require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Problem, Submission } = require("./db");
const testcases = require("./testcases");

const ocapi = axios.create({
  baseURL: process.env.OC_URL,
});

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
      res.send(problems);
    })
    .catch((err) => {
      res.json({ error: "Some error occured" });
    });
});

router.route("/:pno").get((req, res) => {
  console.log("fetching problem", req.params["pno"]);
  Problem.findOne({ pno: parseInt(req.params["pno"]) }).then((doc) => {
    if (!doc) {
      return res.send({ error: "The problem does not exist" });
    }
    return res.send(doc);
  });
});

router.route("/run").post((req, res) => {
  const { lang, code, cinput } = req.body;
  console.log(req.body);
  ocapi
    .post("/run", { code: code, ext: lang, inpStr: cinput })
    .then(
      (obj) => {
        console.log(obj.data);
        res.send(obj.data);
      },
      (reason) => {
        console.log("run reason");
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
    if (!req.isAuthenticated()) {
      return res.json({ error: "Need to be logged in to submit the code" });
    }
    next();
  },
  (req, res) => {
    const { lang, code, pno } = req.body;
    let verdict = "None";
    const time = new Date();
    ocapi
      .post("/judge", {
        lang: lang,
        code: code,
        pno: pno,
        tcs: testcases[pno],
      })
      .then(
        async (o) => {
          console.log("o.data", o.data);
          verdict = o.data.errorType ? o.data.errorType : o.data.verdict;
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

module.exports = router;
