const express = require("express");
const register = require("./endpoints/register");
const login = require("./endpoints/login");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;