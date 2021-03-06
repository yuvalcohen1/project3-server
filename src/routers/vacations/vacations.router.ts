import { config } from "dotenv";
import { Request, Response, Router } from "express";
import expressJwt from "express-jwt";
import {
  addVacation,
  deleteVacationById,
  getAllVacations,
  updateVacation,
} from "../../DB/queries/vacations.queries";
import { JwtPayloadModel } from "../users/models/JwtPayload.model";
import { VacationModel } from "./Vacation.model";

config();

const { JWT_SECRET }: any = process.env;

export const vacationsRouter = Router();

const verifyJwtMiddleware = expressJwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
});

vacationsRouter.use(verifyJwtMiddleware);

vacationsRouter.use(function (err: any, req: any, res: any, next: any) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token...");
  }
});

vacationsRouter.get(
  "/",
  async (
    req: Request<JwtPayloadModel>,
    res: Response<{ id: number; isAdmin: number; vacations: VacationModel[] }>
  ) => {
    const { id, isAdmin }: any = req.user;

    try {
      const vacations = await getAllVacations();
      res.send({ id, isAdmin, vacations });
    } catch (err) {
      return res.sendStatus(500);
    }
  }
);

vacationsRouter.post(
  "/add-vacation",
  async (
    req: Request<Partial<VacationModel>>,
    res: Response<VacationModel | string>
  ) => {
    const { isAdmin }: any = req.user;

    if (!isAdmin) {
      return res.status(401).send("you are not allowed to add a vacation");
    }

    const { description, destination, image, startDate, endDate, price } =
      req.body;

    const partialNewVacation: Partial<VacationModel> = {
      description,
      destination,
      image,
      startDate,
      endDate,
      price,
    };

    try {
      const id = await addVacation(partialNewVacation);

      const fullNewVacation: VacationModel = {
        id,
        description,
        destination,
        startDate,
        endDate,
        image,
        price,
        followersAmount: 0,
      };

      res.send(fullNewVacation);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
);

vacationsRouter.put(
  "/update-vacation/:id",
  async (
    req: Request<Partial<VacationModel>>,
    res: Response<VacationModel | string>
  ) => {
    const { isAdmin }: any = req.user;

    if (!isAdmin) {
      res.status(401).send("you are not allowed to update a vacation");
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).send("you have to specify the vacation id");
      return;
    }

    const { description, destination, image, startDate, endDate, price } =
      req.body;

    const updatingVacationDetails: Partial<VacationModel> = {
      id,
      description,
      destination,
      image,
      startDate,
      endDate,
      price,
    };

    try {
      const isVacationUpdated = await updateVacation(updatingVacationDetails);

      if (!isVacationUpdated) {
        res.status(400).send("Vacation has not been updated, please try again");
        return;
      }

      res.send("Vacation has been updated successfully!");
    } catch (err) {
      res.sendStatus(500);
    }
  }
);

vacationsRouter.delete(
  "/delete-vacation/:id",
  async (req: Request<{ id: number }>, res: Response<string>) => {
    const { isAdmin }: any = req.user;

    if (!isAdmin) {
      res.status(401).send("you are not allowed to delete a vacation");
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).send("you have to specify the vacation id");
      return;
    }

    try {
      const isVacationDeleted = await deleteVacationById(id);
      if (!isVacationDeleted) {
        res.status(400).send("Vacation has not been deleted, please try again");
        return;
      }

      res.send("Vacation has been deleted successfully!");
    } catch (err) {
      res.sendStatus(500);
    }
  }
);
