import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useUnauthenticatedApi } from "../../hooks/useApi";
import { Spin } from "antd";
import { handleNotification } from "../../utils/notification";

interface LoginProps {}

let formData = new FormData();

const Login: React.FC<LoginProps> = () => {
  const api = useUnauthenticatedApi();
  const history = useHistory();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      history.push("/courses");
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      username: username,
      password: password,
      persistent_login: true,
    };

    formData.append("JSONString", JSON.stringify(payload));

    if (api && navigator.onLine) {
      setLoading(true);
      api
        .post("/tutor/login", formData)
        .then((res: any) => {
          if (res.status === 200) {
            if (res.data.user.role === 0 || res.data.user.role === 2) {
              localStorage.setItem("apikey", res.data.user.apikey);
              localStorage.setItem("user", JSON.stringify(res.data.user));
              setLoading(false);
              handleNotification(
                "success",
                "Logged in Successfully",
                "topRight",
                3,
                "auth"
              );
              history.push("/courses");
            } else {
              handleNotification(
                "info",
                "You are not authorized to login.",
                "topRight",
                3,
                "auth"
              );
              setLoading(false);
            }
          }
        })
        .catch((e) => {
          setLoading(false);
          if (e.response.status === 400) {
            handleNotification(
              "error",
              "Invalid email id or password",
              "topRight",
              3,
              "auth"
            );
          } else {
            handleNotification(
              "error",
              "Some error occured, Please try again later",
              "topRight",
              3,
              "auth"
            );
          }
        });
    } else {
      handleNotification(
        "error",
        "Please check your internet connection",
        "topRight",
        3,
        "auth"
      );
    }
  };

  const handleContinueWithoutLogin = () => {
    const user = {
      username: "dummy",
      apikey: "dummy",
      role: 0,
      user_id: 0,
      name: "Guest user",
      contact_number: "1234567890",
      email: "guest@skill.page",
    };
    localStorage.setItem("apikey", "dummy");
    localStorage.setItem("user", JSON.stringify(user));
    handleNotification(
      "success",
      "Logged in as guest user",
      "topRight",
      3,
      "auth"
    );
    history.push("/courses");
  };

  return (
    <div className="bg-primary -skew-y-12 origin-bottom-left -mb-40 h-screen">
      <div className="origin-bottom-left skew-y-12">
        <div className="flex justify-center py-14 2xl:py-20 font-bold tall:py-8">
          <h1 className="text-white text-3xl lg:text-4xl tall:text-2xl">
            3-Dimensional Visual Teaching Content Software for ITI
          </h1>
        </div>
        <div className="h-screen w-2/3 mx-auto rounded-t-4xl bg-white">
          <div className="flex justify-center items-center pt-6 mb-12 xl:mb-12 tall:mb-6 2xl:mb-32">
            <img
              src="./assets/header_icon.svg"
              alt="logo"
              className="w-72 tall:w-56"
            />
          </div>
          <div className="flex flex-col justify-center px-10 py-10 shadow-xl rounded-md mx-28 xl:mx-48 2xl:mx-80">
            <p className="text-subtitle font-semibold text-sm 2xl:text-base">
              Welcome Back!
            </p>
            <p className="text-[1.8rem] tall:text-[1.4rem] font-semibold text-[#434343] mt-1">
              Sign in to your account
            </p>
            <form className="mt-6" onSubmit={handleSubmit}>
              <label className="text-subtitle font-semibold text-sm 2xl:text-base">
                Enter Your email / Mobile number
              </label>
              <input
                placeholder="Email / Mobile number"
                name="username"
                type="text"
                className="w-full px-3 py-2.5 mb-4 text-sm outline-none border border-solid border-light-gray rounded-lg my-2 2xl:my-4"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={250}
                required
              />
              <label className="text-subtitle font-semibold text-sm 2xl:text-base">
                Password
              </label>
              <input
                placeholder="Password"
                name="password"
                type="password"
                className="w-full px-3 py-2.5 text-sm outline-none border border-solid border-light-gray rounded-lg mt-2 2xl:mt-4"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={50}
              />
              <div className="w-full flex items-center">
                <button
                  type="submit"
                  className={`bg-gradient-to-t from-[#025385] text-base font-bold to-primary rounded-lg text-center w-[80%] mx-auto text-white py-2.5 mt-10 2xl:text-base 2xl:font-semibold ${
                    loading ? "cursor-wait" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="items-center">
                      <span className="mr-2">Please Wait...</span>
                      <Spin />
                    </div>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>
            <button
              className={`text-secondary text-base font-semibold mx-auto mt-4 2xl:text-sm ${
                loading ? "cursor-wait" : "cursor-pointer"
              }`}
              onClick={() => history.push("/forgotpassword")}
              disabled={loading}
            >
              Forgot Your Password?
            </button>
            <button
              className={`text-secondary font-semibold mx-auto mt-2 text-sm ${
                loading ? "cursor-wait" : "cursor-pointer"
              }`}
              onClick={handleContinueWithoutLogin}
              disabled={loading}
            >
              Continue as guest user
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
