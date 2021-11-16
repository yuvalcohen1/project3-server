import express from "express";
import cors from "cors";
import { vacationsRouter } from "./routers/vacations/vacations.router";
import { usersRouter } from "./routers/users/users.router";
import { config } from "dotenv";
import { followsRouter } from "./routers/follows/follows.router";

config();

const { PORT } = process.env;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/vacations", vacationsRouter);
app.use("/api/users", usersRouter);
app.use("/api/follows", followsRouter);

app.listen(PORT, () => console.log(`server is up at ${PORT}`));
