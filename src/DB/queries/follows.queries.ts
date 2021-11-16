import { RowDataPacket } from "mysql2";
import { db } from "../db";



export async function addFollow(userId: number, vacationId: number) {
  await db.query("INSERT INTO follows (userId, vacationId) VALUES (?, ?)", [
    userId,
    vacationId,
  ]);
  return;
}

export async function incrementFollowersAmount(vacationId: number) {
  const [{ affectedRows }]: any = await db.query(
    "UPDATE vacations SET followersAmount = followersAmount + 1 WHERE id = ?;",
    [vacationId]
  );
  return affectedRows as number;
}
