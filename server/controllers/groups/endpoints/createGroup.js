const pg = require("../../../db/my-pg");

module.exports = async function (req, res) {
    const { name } = req.body;
    if (!name || name.trim() === "") return res.status(400).json({ error: "Group name required" });

    try {
        await pg.query("BEGIN");
        const groupResult = await pg.query(
            `INSERT INTO "group" ("name") VALUES ($1) RETURNING group_id, name`,
            [name.trim()]
        );
        const group = groupResult.rows[0];

        await pg.query(
            `INSERT INTO "group_user" ("group_id", "user_id") VALUES ($1, $2)`,
            [group.group_id, req.userId]
        );
        await pg.query("COMMIT");
        res.status(201).json(group);
    } catch (err) {
        await pg.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};