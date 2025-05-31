const express = require("express");
const getAllPasswords = require("./endpoints/getAllPasswords");
const getPasswordById = require("./endpoints/getPasswordById");
const createPassword = require("./endpoints/createPassword");

const router = express.Router();

router.get("/", getAllPasswords);
router.get("/:id", getPasswordById);
router.post("/", createPassword);

module.exports = router;