export interface FullUserModel {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    encryptedPassword: string;
    isAdmin: number;
  }