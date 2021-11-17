import { compare, genSalt, hash } from "bcrypt";
import { Request, Response, Router } from "express";
import { Secret, sign } from "jsonwebtoken";
import { promisify } from "util";
import { addUser, getUserByUsername } from "../../DB/queries/users.queries";
import { JwtPayloadModel } from "./models/JwtPayload.model";

export const usersRouter = Router();

const { JWT_SECRET } = process.env;

const promisifiedSign = promisify(sign);

async function createJwt(payload: JwtPayloadModel): Promise<any> {
  return promisifiedSign(payload, JWT_SECRET as Secret);
}

usersRouter.post(
  "/register",
  async (
    req: Request<{
      firstName: string;
      lastName: string;
      username: string;
      password: string;
    }>,
    res: Response<{ jwt: string } | string>
  ) => {
    const { firstName, lastName, username, password } = req.body;
    if (!firstName) {
      return res.status(400).send("You have to specify first name");
    }
    if (!lastName) {
      return res.status(400).send("You have to specify last name");
    }
    if (!username) {
      return res.status(400).send("You have to specify username");
    }
    if (!password) {
      return res.status(400).send("You have to specify password");
    }

    try {
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
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);

usersRouter.post(
  "/login",
  async (
    req: Request<{ username: string; password: string }>,
    res: Response<{ jwt: string } | string>
  ) => {
    const { username, password } = req.body;
    if (!username) {
      res.status(400).send("you have to specify username");
    }
    if (!password) {
      res.status(400).send("you have to specify password");
    }

    try {
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
    } catch (error) {
      return res.sendStatus(500);
    }
  }
);
