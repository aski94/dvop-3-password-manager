const pg = require("../../../db/my-pg");

module.exports = async function (req, res) {
    const { groupId } = req.params;
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    try {
        const check = await pg.query(
            `SELECT 1 FROM "group_user" WHERE "group_id" = $1 AND "user_id" = $2`,
            [groupId, req.userId]
        );
        if (check.rows.length === 0) return res.status(403).json({ error: "You are not a member of this group" });

        const userRes = await pg.query(
            `SELECT user_id FROM "user" WHERE username = $1`,
            [username]
        );
        if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

        const userIdToAdd = userRes.rows[0].user_id;

        const alreadyMember = await pg.query(
            `SELECT 1 FROM "group_user" WHERE "group_id" = $1 AND "user_id" = $2`,
            [groupId, userIdToAdd]
        );
        if (alreadyMember.rows.length > 0) return res.status(409).json({ error: "User already in group" });

        await pg.query(`INSERT INTO "group_user" ("group_id", "user_id") VALUES ($1, $2)`, [groupId, userIdToAdd]);

        const groupRes = await pg.query(`SELECT name FROM "group" WHERE group_id = $1`, [groupId]);

        res.json({ message: "User added to group", groupName: groupRes.rows[0].name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};