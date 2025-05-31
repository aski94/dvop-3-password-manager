const express = require("express");
const router = express.Router();
const groups = require("../controllers/groups/groups");

router.post("/", groups.createGroup);
router.post("/:groupId/addUserByName", groups.addUserByName);
router.get("/", groups.getUserGroups);

module.exports = router;