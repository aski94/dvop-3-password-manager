const pg = require("../../../db/my-pg");

module.exports = async function (req, res) {
    const { description, group_id, username, password } = req.body;
    const result = await pg.query(
        `INSERT INTO "password" ("description", "group_id", "username", "password")
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [description, group_id, username, password]
    );
    res.json(result.rows[0]);
};