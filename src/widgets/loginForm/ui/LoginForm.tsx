import type { AxiosResponse } from "axios";
import { type MouseEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/entities/user";
import { loginRequest, registrationRequest } from "@/entities/user/api/userApi";

export const LoginForm = () => {
  const [loginFormState, setLoginFormState] = useState({
    login: "",
    password: "",
  });
  const [error, setError] = useState<{ message: string; cause: string }>();

  const navigate = useNavigate();

  const addUserData = useUserStore((state) => state.addUserData);
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  const inputHandler = (value: string, valueKey: "login" | "password") => {
    setError(undefined);
    setLoginFormState((prevState) => ({ ...prevState, [valueKey]: value }));
  };

  const successLogin = (res: AxiosResponse<string>) => {
    setAccessToken(res.data);
    addUserData({
      userName: loginFormState.login,
    });
    navigate("/");
  };

  const registrationButtonHandler = async (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    event.preventDefault();
    await registrationRequest(loginFormState.login, loginFormState.password)
      .then((res) => successLogin(res))
      .catch((reason) => setError(JSON.parse(reason.request.response)));
  };

  const loginButtonHandler = async (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    event.preventDefault();
    await loginRequest(loginFormState.login, loginFormState.password)
      .then((res) => {
        successLogin(res);
      })
      .catch((reason) => setError(JSON.parse(reason.request.response)));
  };

  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center p-2.5">
      <form
        className="flex w-full max-w-sm flex-col items-center gap-2.5 rounded-2xl border border-border bg-card p-4 text-lg shadow-sm"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="w-full">
          <input
            className="w-full rounded-lg border border-input bg-background p-2.5 text-base font-bold transition-colors duration-300 ease-in-out"
            value={loginFormState.login}
            onChange={(e) => inputHandler(e.target.value, "login")}
            placeholder={"Login"}
          />
          <div className="text-sm text-destructive">
            {error && error.cause === "user" && error.message}
          </div>
        </div>
        <div className="w-full">
          <input
            className="w-full rounded-lg border border-input bg-background p-2.5 text-base font-bold transition-colors duration-300 ease-in-out"
            value={loginFormState.password}
            onChange={(e) => inputHandler(e.target.value, "password")}
            placeholder={"Password"}
          />
          <div className="text-sm text-destructive">
            {error && error.cause === "password" && error.message}
          </div>
        </div>
        <button
          type="button"
          className="w-full cursor-pointer rounded-lg bg-foreground p-2.5 text-base font-bold text-background transition-all duration-300 ease-in-out hover:scale-105 hover:bg-background hover:text-foreground"
          onClick={(event) => loginButtonHandler(event)}
        >
          Login
        </button>
        <button
          type="button"
          className="w-full cursor-pointer rounded-lg bg-foreground p-2.5 text-base font-bold text-background transition-all duration-300 ease-in-out hover:scale-105 hover:bg-background hover:text-foreground"
          onClick={(event) => registrationButtonHandler(event)}
        >
          Register
        </button>
      </form>
    </div>
  );
};

