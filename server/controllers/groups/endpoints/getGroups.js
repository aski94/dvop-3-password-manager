const pg = require("../../../db/my-pg");

module.exports = async function (req, res) {
    const result = await pg.query(
        `SELECT * FROM "group"
         JOIN "group_user" ON "group"."group_id" = "group_user"."group_id"
         WHERE "group_user"."user_id" = $1`,
        [req.userId]
    );
    res.json(result.rows);
};