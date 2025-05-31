const pg = require("../../../db/my-pg");

module.exports = async function (req, res) {
    const result = await pg.query(
        `SELECT p.password_id, p.description, p.username, g.name AS group_name
         FROM "password" p
         JOIN "group_user" gu ON p.group_id = gu.group_id
         JOIN "group" g ON p.group_id = g.group_id
         WHERE gu.user_id = $1`,
        [req.userId]
    );
    res.json(result.rows);
};