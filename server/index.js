const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pg = require("./my-pg.js");

const app = express();
const JWT_SECRET = "verySecurePassword123";

app.use(express.json());
app.use(cors({origin: "*"}));

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    if (username.length < 6) {
        return res.status(400).json({ error: "Username must be at least 6 characters long" });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    try {
        const userExists = await pg.query(`SELECT 1 FROM "user" WHERE "username" = $1`, [username]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: "Username already exists" });
        }

        await pg.query('BEGIN');

        const userResult = await pg.query(
            `INSERT INTO "user" ("username", "password") VALUES ($1, $2) RETURNING user_id`,
            [username, password]
        );
        const userId = userResult.rows[0].user_id;

        const groupName = `${username}'s Vault`;
        const groupResult = await pg.query(
            `INSERT INTO "group" ("name") VALUES ($1) RETURNING group_id`,
            [groupName]
        );
        const groupId = groupResult.rows[0].group_id;

        await pg.query(
            `INSERT INTO "group_user" ("group_id", "user_id") VALUES ($1, $2)`,
            [groupId, userId]
        );

        await pg.query('COMMIT');

        res.status(201).json({ message: "User registered", userId });
    } catch (error) {
        await pg.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.post("/login", async (req, res) => {
    const {username, password} = req.body;

    const userQuery = await pg.query(
        `SELECT *
         FROM "user"
         WHERE "username" = $1
           AND "password" = $2`,
        [username, password]
    );
    const user = userQuery.rows[0];

    if (user) {
        const token = jwt.sign({userId: user.user_id}, JWT_SECRET, {expiresIn: "30m"});
        res.json({token});
    } else {
        res.status(401).json({error: "Invalid credentials"});
    }
});

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

app.get("/users", async (req, res) => {
    const result = await pg.query(`SELECT *
                                   FROM "user"`);
    res.json(result.rows);
});

app.get("/passwords", async (req, res) => {
    const result = await pg.query(
        `SELECT "password"."password_id", "password"."description", "password"."group_id", "password"."username"
         FROM "password"
                  JOIN "group_user" on "password"."group_id" = "group_user"."group_id"
         WHERE "group_user"."user_id" = $1`,
        [req.userId]
    );
    res.json(result.rows);
});

app.get("/passwords/:id", async (req, res) => {
    const result = await pg.query(
        `SELECT *
         FROM "password"
                  JOIN "group_user" ON "password"."group_id" = "group_user"."group_id"
         WHERE "password_id" = $1
           AND "group_user"."user_id" = $2`,
        [req.params.id, req.userId]
    );
    res.json(result.rows[0]);
});

app.post("/passwords", async (req, res) => {
    const {description, group_id, username, password} = req.body;
    const result = await pg.query(
        `INSERT INTO "password" ("description", "group_id", "username", "password")
         VALUES ($1, $2, $3, $4) RETURNING *`,
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