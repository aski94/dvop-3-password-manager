const pg = require("../../../db/my-pg");

module.exports = async function (req, res) {
    const { username } = req.query;
    if (!username) return res.json([]);
    const result = await pg.query(
        `SELECT user_id, username FROM "user" WHERE username ILIKE $1 LIMIT 10`,
        [`%${username}%`]
    );
    res.json(result.rows);
};