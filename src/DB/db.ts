import mysql from "mysql2/promise";
require("dotenv").config();

const { host, user, password, database } = process.env;

export const db = mysql.createPool({
  host,
  port: 3306,
  user,
  password,
  database,
});
