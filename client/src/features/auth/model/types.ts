import type { User } from "@/entities/user";

export type LoginCredentials = Pick<User, "email"> & { password: string };

export type SignupCredentials = Omit<User, "id"> & { password: string };
