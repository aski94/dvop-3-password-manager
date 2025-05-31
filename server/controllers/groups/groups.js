const express = require("express");
const addUserByName = require("./endpoints/addUserByName");
const createGroup = require("./endpoints/createGroup");
const getGroups = require("./endpoints/getGroups");

const router = express.Router();

router.post("/:groupId/addUserByName", addUserByName);
router.post("/", createGroup);
router.get("/", getGroups);

module.exports = router;