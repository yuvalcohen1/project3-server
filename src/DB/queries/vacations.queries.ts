import { RowDataPacket } from "mysql2";
import { VacationModel } from "../../routers/vacations/Vacation.model";
import { db } from "../db";

type DbQueryResult<TableRecord> = (TableRecord & RowDataPacket)[];


export async function getAllVacations(): Promise<VacationModel[]> {
    const [vacations] = await db.query<DbQueryResult<VacationModel>>(
      "SELECT * FROM vacation_management_system.vacations;"
    );
    return vacations as VacationModel[];
  }
  
  export async function addVacation({
    description,
    destination,
    image,
    startDate,
    endDate,
    price,
  }: Partial<VacationModel>) {
    const [{ insertId }]: any = await db.query(
      "INSERT INTO vacations (description, destination, image, startDate, endDate, price) VALUES (?, ?, ?, ?, ?, ?);",
      [description, destination, image, startDate, endDate, price]
    );
    return insertId as number;
  }
  
  export async function updateVacation({
    id,
    description,
    destination,
    image,
    startDate,
    endDate,
    price,
  }: Partial<VacationModel>) {
    const [{ affectedRows }]: any = await db.query(
      "UPDATE vacations SET description = ?, destination = ?, image = ?, startDate = ?, endDate = ?, price = ? WHERE id = ?",
      [description, destination, image, startDate, endDate, price, id]
    );
    return affectedRows as number;
  }
  
  export async function deleteVacationById(id: number) {
    const [{ affectedRows }]: any = await db.query(
      "DELETE FROM vacations WHERE id = ?",
      [id]
    );
    return affectedRows as number;
  }