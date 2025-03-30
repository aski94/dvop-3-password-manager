const pg = require("pg");
const { Pool } = pg;

const pool = new Pool({
    user: "",
    database: "",
    password: "",
    host: "",
    port: 0,
})

const query = (text, params, callback) => {
    return pool.query(text, params, callback)
}

module.exports = { query };

