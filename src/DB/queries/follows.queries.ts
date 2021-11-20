import { db } from "../db";

export async function getFollowedVacationIdsByFollowingUserId(userId: number) {
  const vacationIds = await db.query(
    "SELECT vacationId FROM vacation_management_system.follows WHERE userId = ?;",
    [userId]
  );
  return vacationIds;
}

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

export async function deleteFollow(userId: number, vacationId: number) {
  const [{ affectedRows }]: any = await db.query(
    "DELETE FROM follows WHERE userId = ? AND vacationId = ?",
    [userId, vacationId]
  );
  return affectedRows as number;
}

export async function decrementFollowersAmount(vacationId: number) {
  const [{ affectedRows }]: any = await db.query(
    "UPDATE vacations SET followersAmount = followersAmount - 1 WHERE id = ?;",
    [vacationId]
  );
  return affectedRows as number;
}
