const express = require("express");
const search = require("./endpoints/search");

const router = express.Router();

router.get("/search", search);

module.exports = router;