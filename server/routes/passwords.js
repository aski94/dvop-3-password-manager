const express = require("express");
const router = express.Router();
const passwords = require("../controllers/passwords/passwords");

router.get("/", passwords.getAll);
router.get("/:id", passwords.getOne);
router.post("/", passwords.add);

module.exports = router;