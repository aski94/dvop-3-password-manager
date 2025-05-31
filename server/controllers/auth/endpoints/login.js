const pg = require("../../../db/my-pg");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "verySecurePassword123";

module.exports = async function (req, res) {
    const { username, password } = req.body;
    const userQuery = await pg.query(
        `SELECT * FROM "user" WHERE "username" = $1 AND "password" = $2`,
        [username, password]
    );
    const user = userQuery.rows[0];
    if (user) {
        const token = jwt.sign({ userId: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: "30m" });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
};