const express = require("express");
const cors = require("cors");
const pg = require("./pg.js");

const app = express();

app.use(express.json());

app.use(cors({
    "origin": "*"
}));

async function authentication(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader("WWW-Authenticate", "Basic");
        return res.status(401).send("You are not authenticated!");
    }

    const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");

    const userQuery = await pg.query(`SELECT *
                                      FROM "user"
                                      WHERE "username" = $1
                                        AND "password" = $2`, [username, password]);
    const user = userQuery.rows[0];
    if (user) {
        req.userId = user.user_id;
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
         FROM [group]
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