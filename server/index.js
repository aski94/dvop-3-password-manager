const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pg = require("./my-pg.js");

const app = express();
const JWT_SECRET = "verySecurePassword123";

app.use(express.json());
app.use(cors({origin: "*"}));

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) return res.status(400).json({error: "Username and password required"});
    if (username.length < 6) return res.status(400).json({error: "Username must be at least 6 characters long"});
    if (password.length < 8) return res.status(400).json({error: "Password must be at least 8 characters long"});

    try {
        const userExists = await pg.query(`SELECT 1
                                           FROM "user"
                                           WHERE "username" = $1`, [username]);
        if (userExists.rows.length > 0) return res.status(409).json({error: "Username already exists"});

        await pg.query("BEGIN");

        const userResult = await pg.query(
            `INSERT INTO "user" ("username", "password")
             VALUES ($1, $2) RETURNING user_id`,
            [username, password]
        );
        const userId = userResult.rows[0].user_id;

        const groupName = `${username}'s Vault`;
        const groupResult = await pg.query(
            `INSERT INTO "group" ("name")
             VALUES ($1) RETURNING group_id`,
            [groupName]
        );
        const groupId = groupResult.rows[0].group_id;

        await pg.query(
            `INSERT INTO "group_user" ("group_id", "user_id")
             VALUES ($1, $2)`,
            [groupId, userId]
        );

        await pg.query("COMMIT");

        res.status(201).json({message: "User registered", userId});
    } catch (error) {
        await pg.query("ROLLBACK");
        console.error(error);
        res.status(500).json({error: "Internal server error"});
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
        const token = jwt.sign({userId: user.user_id, username: user.username}, JWT_SECRET, {expiresIn: "30m"});
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

app.post("/groups/:groupId/addUserByName", async (req, res) => {
    const {groupId} = req.params;
    const {username} = req.body;
    if (!username) return res.status(400).json({error: "Username required"});

    try {
        const check = await pg.query(
            `SELECT 1
             FROM "group_user"
             WHERE "group_id" = $1
               AND "user_id" = $2`,
            [groupId, req.userId]
        );
        if (check.rows.length === 0) return res.status(403).json({error: "You are not a member of this group"});

        const userRes = await pg.query(`SELECT user_id
                                        FROM "user"
                                        WHERE username = $1`, [username]);
        if (userRes.rows.length === 0) return res.status(404).json({error: "User not found"});
        const userIdToAdd = userRes.rows[0].user_id;

        const alreadyMember = await pg.query(
            `SELECT 1
             FROM "group_user"
             WHERE "group_id" = $1
               AND "user_id" = $2`,
            [groupId, userIdToAdd]
        );
        if (alreadyMember.rows.length > 0) return res.status(409).json({error: "User already in group"});

        await pg.query(`INSERT INTO "group_user" ("group_id", "user_id")
                        VALUES ($1, $2)`, [groupId, userIdToAdd]);

        const groupRes = await pg.query(`SELECT name
                                         FROM "group"
                                         WHERE group_id = $1`, [groupId]);

        res.json({message: "User added to group", groupName: groupRes.rows[0].name});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
});

app.get("/users/search", async (req, res) => {
    const {username} = req.query;
    if (!username) return res.json([]);
    const result = await pg.query(
        `SELECT user_id, username
         FROM "user"
         WHERE username ILIKE $1 LIMIT 10`,
        [`%${username}%`]
    );
    res.json(result.rows);
});

app.post("/groups", async (req, res) => {
    const {name} = req.body;
    if (!name || name.trim() === "") return res.status(400).json({error: "Group name required"});

    try {
        await pg.query("BEGIN");
        const groupResult = await pg.query(
            `INSERT INTO "group" ("name")
             VALUES ($1) RETURNING group_id, name`,
            [name.trim()]
        );
        const group = groupResult.rows[0];
        await pg.query(
            `INSERT INTO "group_user" ("group_id", "user_id")
             VALUES ($1, $2)`,
            [group.group_id, req.userId]
        );
        await pg.query("COMMIT");
        res.status(201).json(group);
    } catch (err) {
        await pg.query("ROLLBACK");
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
});

app.get("/passwords", async (req, res) => {
    const result = await pg.query(
        `SELECT p.password_id, p.description, p.username, g.name AS group_name
         FROM "password" p
                  JOIN "group_user" gu ON p.group_id = gu.group_id
                  JOIN "group" g ON p.group_id = g.group_id
         WHERE gu.user_id = $1`,
        [req.userId]
    );
    res.json(result.rows);
});

app.get("/passwords/:id", async (req, res) => {
    const result = await pg.query(
        `SELECT p.password_id, p.description, p.username, p.password, g.name AS group_name
         FROM "password" p
                  JOIN "group_user" gu ON p.group_id = gu.group_id
                  JOIN "group" g ON p.group_id = g.group_id
         WHERE p.password_id = $1
           AND gu.user_id = $2`,
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

app.listen(3000);