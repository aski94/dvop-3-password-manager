const express = require("express");
const cors = require("cors");
const authentication = require("./middleware/authentication");

const authRoutes = require("./controllers/auth/auth");
const groupRoutes = require("./controllers/groups/groups");
const passwordRoutes = require("./controllers/passwords/passwords");
const userRoutes = require("./controllers/users/users");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/", express.static("./client"));

app.use(authentication);
app.use("/groups", groupRoutes);
app.use("/passwords", passwordRoutes);

app.listen(3000);