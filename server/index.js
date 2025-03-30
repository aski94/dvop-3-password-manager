const express = require("express");
const cors = require("cors");
const pg = require("./pg.js");

const app = express();

app.use(express.json());

app.use(cors({
    "origin": "*"
}));

// Data
let groups = [];
groups.push({id: 1, name: "pristupy spolecne", userIdList: [1, 2]});
groups.push({id: 2, name: "pristupy ales", userIdList: [1]});
let groupCount = groups.length + 1;

let users = [];
users.push({id: 1, username: "ales", password: "Heslo123"});
users.push({id: 2, username: "pepa", password: "heslicko"});
let userCount = users.length + 1;

let passwords = [];
passwords.push({id: 1, description: "pristup na seznam.cz", groupId: 2, username: "alesau", password: "Heslo123"});
passwords.push({id: 2, description: "pristup skola", groupId: 1, username: "user", password: "Pass"});
passwords.push({id: 3, description: "pristup skola2", groupId: 1, username: "user2", password: "Pass2"});
passwords.push({id: 4, description: "pristup skola3", groupId: 1, username: "user3", password: "Pass3"});
let passwordsCount = passwords.length + 1;

let logs = [];
logs.push({date: '2025-03-01 10:00:00', userId: 1, description: "Added password Id 1"});
logs.push({date: '2025-03-01 10:00:01', userId: 1, description: "Added password Id 2"});

function authentication(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader("WWW-Authenticate", "Basic");
        return res.status(401).send("You are not authenticated!");
    }

    const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");

    const user = users.find(l => l.username == username && l.password == password);
    if (user) {
        req.userId = user.id;
        next();
    } else {
        res.setHeader("WWW-Authenticate", "Basic");
        return res.status(401).send("You are not authenticated!");
    }
}

app.use(authentication)
app.use("/", express.static("./client"))


// Endpoint GET /users
app.get("/users", async (req, res) => {
    const result = await pg.query(`SELECT *
                                   FROM "user"`);
    res.json(result.rows);
});

// Endpoint GET /passwords (without showing actual passwords)
app.get("/passwords", async (req, res) => {
    console.log("Authenticated user ID:", req.userId);
    const result = await pg.query(`SELECT "password"."password_id",
                                          "password"."description",
                                          "password"."group_id",
                                          "password"."username"
                                   FROM "password"
                                            JOIN "group_user" on "password"."group_id" = "group_user"."group_id"
                                   WHERE "group_user"."user_id" = $1`, [req.userId]);
    res.json(result.rows);
});

// Endpoint GET /passwords/:id (showing only password)
app.get("/passwords/:id", async (req, res) => {
    const result = await pg.query(`SELECT *
                                   FROM "password"
                                            JOIN "group_user" ON "password"."group_id" = "group_user"."group_id"
                                   WHERE "password_id" = $1
                                     AND "group_user"."user_id" = $2`, [req.params.id, req.userId]);
    res.json(result.rows[0]);
});

// Endpoint POST /passwords (create a new password)
app.post("/passwords", async (req, res) => {
    const {description, group_id, username, password} = req.body;
    const result = await pg.query(
        'INSERT INTO "password" ("description", "group_id", "username", "password") VALUES ($1, $2, $3, $4) RETURNING *',
        [description, group_id, username, password]
    );
    res.json(result.rows[0]);
});

// Endpoint GET /groups
app.get("/groups", async (req, res) => {
    const result = await pg.query(
        `SELECT *
         FROM "group"
                  JOIN "group_user" ON "group"."group_id" = "group_user"."group_id"
         WHERE "group_user"."user_id" = $1`,
        [req.userId]
    );
    res.json(result.rows);
});

// Endpoint GET /logs
app.get("/logs", async (req, res) => {
    const result = await pg.query(
        `SELECT *
         FROM "log"
                  JOIN "group_user" ON "log"."group_id" = "group_user"."group_id"
         WHERE "group_user"."user_id" = $1`,
        [req.userId]
    );
    res.json(result.rows);
});

app.listen(3000);