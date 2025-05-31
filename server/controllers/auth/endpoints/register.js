const pg = require("../../../db/my-pg");

module.exports = async function (req, res) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and passwords required" });
    if (username.length < 6) return res.status(400).json({ error: "Username must be at least 6 characters long" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters long" });

    try {
        const userExists = await pg.query(`SELECT 1 FROM "user" WHERE "username" = $1`, [username]);
        if (userExists.rows.length > 0) return res.status(409).json({ error: "Username already exists" });

        await pg.query("BEGIN");

        const userResult = await pg.query(
            `INSERT INTO "user" ("username", "password") VALUES ($1, $2) RETURNING user_id`,
            [username, password]
        );
        const userId = userResult.rows[0].user_id;

        const groupResult = await pg.query(
            `INSERT INTO "group" ("name") VALUES ($1) RETURNING group_id`,
            [`${username}'s Vault`]
        );
        const groupId = groupResult.rows[0].group_id;

        await pg.query(
            `INSERT INTO "group_user" ("group_id", "user_id") VALUES ($1, $2)`,
            [groupId, userId]
        );

        await pg.query("COMMIT");
        res.status(201).json({ message: "User registered", userId });
    } catch (err) {
        await pg.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};