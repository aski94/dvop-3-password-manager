const express = require("express");
const router = express.Router();
const users = require("../controllers/users/users");

router.get("/search", users.search);

module.exports = router;