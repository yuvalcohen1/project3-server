import { RowDataPacket } from "mysql2";
import { FullUserModel } from "../../routers/users/models/FullUser.model";
import { db } from "../db";

type DbQueryResult<TableRecord> = (TableRecord & RowDataPacket)[];

export async function getUserByUsername(
  username: string
): Promise<FullUserModel> {
  const [[user]] = await db.query<DbQueryResult<FullUserModel>>(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return user as FullUserModel;
}

export async function addUser(
  newUser: Partial<FullUserModel>
): Promise<number> {
  const { firstName, lastName, username, encryptedPassword } = newUser;
  const [{ insertId }]: any = await db.query(
    "INSERT INTO users (firstName, lastName, username, encryptedPassword) VALUES (?, ?, ?, ?);",
    [firstName, lastName, username, encryptedPassword]
  );
  return insertId;
}