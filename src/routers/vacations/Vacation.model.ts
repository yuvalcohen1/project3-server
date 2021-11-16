export interface VacationModel {
    id: number;
    description: string;
    destination: string;
    image: string;
    startDate: Date;
    endDate: Date;
    price: number;
    followersAmount: number;
}