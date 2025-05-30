const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pg = require("./my-pg.js");

const app = express();
const JWT_SECRET = "verySecurePassword123";

app.use(express.json());
app.use(cors({origin: "*"}));

// Login endpoint - returns JWT token
app.post("/login", async (req, res) => {
    const {username, password} = req.body;

    const userQuery = await pg.query(`SELECT *
                                      FROM "user"
                                      WHERE "username" = $1
                                        AND "password" = $2`, [username, password]);
    const user = userQuery.rows[0];

    if (user) {
        const token = jwt.sign({userId: user.user_id}, JWT_SECRET, {expiresIn: "30m"});
        res.json({token});
    } else {
        res.status(401).json({error: "Invalid credentials"});
    }
});

// JWT authentication middleware
async function authentication(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({error: "Missing or invalid token"});
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({error: "Invalid or expired token"});
    }
}

app.use("/", express.static("./client"));
app.use(authentication);

// All your other routes stay the same
app.get("/users", async (req, res) => {
    const result = await pg.query(`SELECT *
                                   FROM "user"`);
    res.json(result.rows);
});

app.get("/passwords", async (req, res) => {
    const result = await pg.query(`SELECT "password"."password_id",
                                          "password"."description",
                                          "password"."group_id",
                                          "password"."username"
                                   FROM "password"
                                            JOIN "group_user" on "password"."group_id" = "group_user"."group_id"
                                   WHERE "group_user"."user_id" = $1`, [req.userId]);
    res.json(result.rows);
});

app.get("/passwords/:id", async (req, res) => {
    const result = await pg.query(`SELECT *
                                   FROM "password"
                                            JOIN "group_user" ON "password"."group_id" = "group_user"."group_id"
                                   WHERE "password_id" = $1
                                     AND "group_user"."user_id" = $2`, [req.params.id, req.userId]);
    res.json(result.rows[0]);
});

app.post("/passwords", async (req, res) => {
    const {description, group_id, username, password} = req.body;
    const result = await pg.query(
        'INSERT INTO "password" ("description", "group_id", "username", "password") VALUES ($1, $2, $3, $4) RETURNING *',
        [description, group_id, username, password]
    );
    res.json(result.rows[0]);
});

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