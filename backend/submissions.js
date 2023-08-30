import { Router } from "express";
import { Submission } from "./Modals.js";
const router = Router();

router.route("/all").get((req, res) => {
  Submission.find({}, "_id username pno lang code verdict time")
    .then((submissions) => {
      res.send(submissions);
    })
    .catch((err) => {
      res.json({ error: "Some error occured" });
    });
});

router.route("/:username").get((req, res) => {
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

export default router;
