import type { AxiosResponse } from "axios";
import { type MouseEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/entities/user";
import { loginRequest, registrationRequest } from "@/entities/user/api/userApi";
import styles from "./LoginForm.module.css";

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
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div>
          <input
            value={loginFormState.login}
            onChange={(e) => inputHandler(e.target.value, "login")}
            placeholder={"Login"}
          />
          <div style={{ color: "red", fontSize: "15px" }}>
            {error && error.cause === "user" && error.message}
          </div>
        </div>
        <div>
          <input
            value={loginFormState.password}
            onChange={(e) => inputHandler(e.target.value, "password")}
            placeholder={"Password"}
          />
          <div style={{ color: "red", fontSize: "15px" }}>
            {error && error.cause === "password" && error.message}
          </div>
        </div>
        <button type="button" onClick={(event) => loginButtonHandler(event)}>
          Login
        </button>
        <button
          type="button"
          onClick={(event) => registrationButtonHandler(event)}
        >
          Register
        </button>
      </form>
    </div>
  );
};

