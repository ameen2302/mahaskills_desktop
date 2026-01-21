import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useUnauthenticatedApi } from "../../hooks/useApi";
import { Spin } from "antd";
import { handleNotification } from "../../utils/notification";

interface ForgotPasswordProps {}

const formData = new FormData();

const ForgotPassword: React.FC<ForgotPasswordProps> = () => {
  const api = useUnauthenticatedApi();
  const history = useHistory();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      email: email,
    };

    formData.append("JSONString", JSON.stringify(payload));

    if (api && navigator.onLine) {
      setLoading(true);
      api
        .post("/user/forgotpassword", formData)
        .then((res) => {
          if (res.status === 200) {
            setLoading(false);
            localStorage.setItem("email", email);
            handleNotification("success", "OTP sent on email successfully");
            history.push("/verifyotp");
          } else {
          }
        })
        .catch((e) => {
          setLoading(false);
          if (e.response.status === 400) {
            handleNotification("error", "Invalid email id");
          } else {
            handleNotification(
              "error",
              "Some error occured, Please try again later"
            );
          }
        });
    } else {
      handleNotification("error", "Please check your internet connection");
    }
  };

  return (
    <div className="bg-primary -skew-y-12 origin-bottom-left h-screen">
      <div className="origin-bottom-left skew-y-12">
        <div className="flex justify-center py-14 2xl:py-20 font-bold tall:py-8">
          <h1 className="text-white text-3xl lg:text-4xl tall:text-2xl">
            3-Dimensional Visual Teaching Content Software for ITI
          </h1>
        </div>
        <div className="h-screen w-2/3 mx-auto rounded-t-4xl bg-white">
          <div className="flex justify-center items-center pt-6 mb-20 2xl:mb-32">
            <img
              src="./assets/header_icon.svg"
              alt="icon"
              className="w-72 tall:w-56"
            />
          </div>
          <div className="flex flex-col justify-center px-10 pt-8 pb-14 shadow-xl rounded-md mx-28 xl:mx-48 2xl:mx-80">
            <p className="text-[1.8rem] font-semibold text-[#434343] text-center tall:text-[1.4rem]">
              Forgot Your Password !
            </p>
            <form className="mt-8" onSubmit={handleSubmit}>
              <label className="text-subtitle font-semibold text-lg 2xl:text-base">
                Enter Your Registered email id
              </label>
              <input
                name="email"
                type="email"
                className="w-full px-3 py-2.5 text-sm outline-none border border-solid border-light-gray rounded-lg my-2 2xl:mt-4"
                autoComplete="off"
                value={email}
                maxLength={250}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter Your Registered email id"
              />
              <button
                type="submit"
                className={`bg-gradient-to-t from-[#025385] to-primary rounded-lg text-base font-bold text-center w-full text-white py-2.5 mt-9 2xl:text-base 2xl:font-semibold ${
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
                  "Send OTP"
                )}
              </button>
            </form>
            <button
              className={`text-secondary text-base font-semibold mx-auto mt-4 2xl:text-sm ${
                loading ? "cursor-wait" : "cursor-pointer"
              }`}
              onClick={() => history.push("/")}
              disabled={loading}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
