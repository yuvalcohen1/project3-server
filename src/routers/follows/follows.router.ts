import { Request, Response, Router } from "express";
import {
  addFollow,
  incrementFollowersAmount,
} from "../../DB/queries/follows.queries";

export const followsRouter = Router();

followsRouter.post(
  "/add-follow",
  async (
    req: Request<{ userId: number; vacationId: number }>,
    res: Response
  ) => {
    const { userId, vacationId } = req.query;
    const userIdAsNumber = Number(userId);
    const vacationsIdAsNumber = Number(vacationId);

    if (!userId || !vacationId) {
      res.status(400).send("you have to specify the userId and the vacationId");
      return;
    }

    const isfollowersAmountUpdated = await incrementFollowersAmount(
      vacationsIdAsNumber
    );
    if (!isfollowersAmountUpdated) {
      res.status(400).send("followersAmount has not been updated, try again");
      return;
    }

    await addFollow(userIdAsNumber, vacationsIdAsNumber);

    res.end();
  }
);
