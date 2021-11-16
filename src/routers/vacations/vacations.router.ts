import { config } from "dotenv";
import { Request, Response, Router } from "express";
import expressJwt from "express-jwt";
import { addVacation, deleteVacationById, getAllVacations, updateVacation } from "../../DB/queries/vacations.queries";
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
    res: Response<{ isAdmin: number; vacations: VacationModel[] }>
  ) => {
    const { isAdmin }: any = req.user;

    const vacations = await getAllVacations();

    res.send({ isAdmin, vacations });
  }
);

vacationsRouter.post(
  "/add-vacation",
  async (
    req: Request<Partial<VacationModel>>,
    res: Response<VacationModel | string>
  ) => {
    if (!req.user) {
      res.status(401).send("unauthorized");
      return;
    }

    const { isAdmin }: any = req.user;

    if (!isAdmin) {
      res.status(401).send("you are not allowed to add a vacation");
      return;
    }

    const { description, destination, image, startDate, endDate, price } =
      req.body;

    const partialNewVacation = {
      description,
      destination,
      image,
      startDate,
      endDate,
      price,
    };

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
  }
);

vacationsRouter.put(
  "/update-vacation/:id",
  async (
    req: Request<Partial<VacationModel>>,
    res: Response<VacationModel | string>
  ) => {
    if (!req.user) {
      res.status(401).send("unauthorized");
      return;
    }

    const { isAdmin }: any = req.user;

    if (!isAdmin) {
      res.status(401).send("you are not allowed to update a vacation");
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).send("you have to specify the id of the vacation");
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

    const isVacationUpdated = await updateVacation(updatingVacationDetails);

    if (!isVacationUpdated) {
      res.status(400).send("Vacation has not been updated, please try again");
      return;
    }

    res.send("Vacation has been updated successfully!");
  }
);

vacationsRouter.delete(
  "/delete-vacation/:id",
  async (req: Request<{ id: number }>, res: Response<string>) => {
    if (!req.user) {
      res.status(401).send("unauthorized");
      return;
    }

    const { isAdmin }: any = req.user;

    if (!isAdmin) {
      res.status(401).send("you are not allowed to delete a vacation");
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).send("you have to specify the id of the vacation");
      return;
    }

    const isVacationDeleted = await deleteVacationById(id);
    if (!isVacationDeleted) {
      res.status(400).send("Vacation has not been deleted, please try again");
      return;
    }

    res.send("Vacation has been deleted successfully!");
  }
);
