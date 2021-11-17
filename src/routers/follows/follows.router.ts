import { Request, Response, Router } from "express";
import expressJwt from "express-jwt";
import {
  addFollow,
  decrementFollowersAmount,
  deleteFollow,
  incrementFollowersAmount,
} from "../../DB/queries/follows.queries";

const { JWT_SECRET }: any = process.env;

export const followsRouter = Router();

const verifyJwtMiddleware = expressJwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
});

followsRouter.use(verifyJwtMiddleware);

followsRouter.use(function (err: any, req: any, res: any, next: any) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token...");
  }
});

followsRouter.post(
  "/add-follow/:vacationId",
  async (req: Request, res: Response) => {
    const { id: userId }: any = req.user;
    const { vacationId } = req.params;
    const userIdAsNumber = Number(userId);
    const vacationIdAsNumber = Number(vacationId);

    try {
      const isfollowersAmountUpdated = await incrementFollowersAmount(
        vacationIdAsNumber
      );
      if (!isfollowersAmountUpdated) {
        res.status(400).send("followersAmount has not been updated, try again");
        return;
      }

      await addFollow(userIdAsNumber, vacationIdAsNumber);

      res.end();
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

followsRouter.delete(
  "/delete-follow/:vacationId",
  async (req: Request, res: Response) => {
    const { vacationId } = req.params;
    const { id: userId }: any = req.user;
    const vacationIdAsNumber = Number(vacationId);
    const userIdAsNumber = Number(userId);

    try {
      const isFollowDeleted = await deleteFollow(
        userIdAsNumber,
        vacationIdAsNumber
      );
      const isfollowersAmountUpdated = await decrementFollowersAmount(
        vacationIdAsNumber
      );
      if (!isFollowDeleted || !isfollowersAmountUpdated) {
        return res.sendStatus(500);
      }

      return res.end();
    } catch (error) {
      res.sendStatus(500);
    }
  }
);
