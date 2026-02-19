export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export type LoginCredentials = Pick<User, "email"> & { password: string };

export type SignupCredentials = Omit<User, "id"> & { password: string };
