const pg = require("../../../db/my-pg");

module.exports = async function (req, res) {
    const result = await pg.query(
        `SELECT p.password_id, p.description, p.username, p.password, g.name AS group_name
         FROM "password" p
                  JOIN "group_user" gu ON p.group_id = gu.group_id
                  JOIN "group" g ON p.group_id = g.group_id
         WHERE p.password_id = $1 AND gu.user_id = $2`,
        [req.params.id, req.userId]
    );
    res.json(result.rows[0]);
};