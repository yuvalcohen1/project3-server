import { compare, genSalt, hash } from "bcrypt";
import { Request, Response, Router } from "express";
import { Secret, sign } from "jsonwebtoken";
import { promisify } from "util";
import { addUser, getUserByUsername } from "../../DB/queries/users.queries";
import { JwtPayloadModel } from "./models/JwtPayload.model";
import { NecessaryDetailsUserModel } from "./models/NecessaryDetailsUser.model";

export const usersRouter = Router();

const { JWT_SECRET } = process.env;

const promisifiedSign = promisify(sign);

async function createJwt(payload: JwtPayloadModel): Promise<any> {
  return promisifiedSign(payload, JWT_SECRET as Secret);
}

usersRouter.post(
  "/register",
  async (
    req: Request<NecessaryDetailsUserModel>,
    res: Response<{ jwt: string } | string>
  ) => {
    const { firstName, lastName, username, password } = req.body;

    const user = await getUserByUsername(username);

    if (user) {
      res.status(400).send("user already exists");
      return;
    }

    const saltRounds = 2;
    const salt = await genSalt(saltRounds);

    const encryptedPassword = await hash(password, salt);

    const newUser = {
      firstName,
      lastName,
      username,
      encryptedPassword,
    };

    const newUserId = await addUser(newUser);

    const jwtPayload: JwtPayloadModel = {
      id: newUserId,
      firstName,
      lastName,
      username,
      isAdmin: 0,
    };

    const jwt = await createJwt(jwtPayload);
    res.send({ jwt });
  }
);

usersRouter.post(
  "/login",
  async (
    req: Request<{ username: string; password: string }>,
    res: Response<{ jwt: string } | string>
  ) => {
    const { username, password } = req.body;

    const user = await getUserByUsername(username);
    if (!user) {
      res.status(401).send("username and password don't match");
      return;
    }

    const { id, firstName, lastName, encryptedPassword, isAdmin } = user;
    const isPasswordCorrect = await compare(password, encryptedPassword);
    if (!isPasswordCorrect) {
      res.status(401).send("username and password don't match");
      return;
    }

    const jwtPayload: JwtPayloadModel = {
      id,
      firstName,
      lastName,
      username,
      isAdmin,
    };

    const jwt = await createJwt(jwtPayload);
    res.send({ jwt });
  }
);