import type { AxiosResponse } from "axios";
import { $api } from "@/shared/api";

interface IUserResponse {
  name: string;
  accessToken: string;
  refreshToken: string;
}

export const loginRequest = async (
  name: string,
  password: string,
): Promise<AxiosResponse<string>> => {
  return $api.post<string>("/login", { name, password });
};

export const registrationRequest = async (
  name: string,
  password: string,
): Promise<AxiosResponse<string>> => {
  return $api.post<string>("/registration", { name, password });
};

export const logoutRequest = async (
  name: string,
): Promise<AxiosResponse<IUserResponse>> => {
  return $api.post("/logout", { name });
};

export const refreshTokensRequest = async (): Promise<
  AxiosResponse<string>
> => {
  return $api.get("/refresh");
};

