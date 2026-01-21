import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Spin } from "antd";
import { useUnauthenticatedApi } from "../../hooks/useApi";
import { handleNotification } from "../../utils/notification";

interface VerifyOtpProps {}

let currentOTPIndex = 0;

let formData = new FormData();

const VerifyOtp: React.FC<VerifyOtpProps> = () => {
  const history = useHistory();
  const resetPasswordApi = useUnauthenticatedApi();
  const inputRef = useRef<any>(null);
  const [otp, setOtp] = useState<any[]>(new Array(6).fill(""));
  const [activeOTPIndex, setActiveOTPIndex] = useState<number>(0);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeOTPIndex]);

  const handleChange = (e: any) => {
    e.preventDefault();

    const value = e.target.value;
    const newOtp = [...otp];
    newOtp[currentOTPIndex] = value.substring(value.length - 1);

    if (!value) setActiveOTPIndex(currentOTPIndex - 1);
    else setActiveOTPIndex(currentOTPIndex + 1);

    setOtp(newOtp);
  };

  const handleOnKeyDown = (e: any, index: number) => {
    currentOTPIndex = index;
    if (e.key === "Backspace" && currentOTPIndex > 0) {
      e.target.value = "";
      setActiveOTPIndex(currentOTPIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      otp: otp.join(""),
      password: password,
      confirm_password: confirmPassword,
      email: localStorage.getItem("email"),
    };

    formData.append("JSONString", JSON.stringify(payload));

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (resetPasswordApi && navigator.onLine) {
      setLoading(true);
      resetPasswordApi
        .post("/resetpassword/otp", formData)
        .then((res) => {
          if (res.status === 200) {
            setLoading(false);
            handleNotification("success", "Password changed successfully");
            history.push("/");
          }
        })
        .catch((e) => {
          setLoading(false);
          if (e.response.status === 400) {
            handleNotification("error", "Invalid otp");
          } else {
            handleNotification("error", "Some error occured, Please try again");
          }
        });
    } else {
      handleNotification("error", "Please check your internet connection");
    }
  };

  return (
    <div className="bg-primary -skew-y-12 origin-bottom-left h-screen">
      <div className="origin-bottom-left skew-y-12">
        <div className="flex justify-center py-14 2xl:py-20 tall:py-8 font-bold">
          <h1 className="text-white text-3xl lg:text-4xl tall:text-2xl">
            3-Dimensional Visual Teaching Content Software for ITI
          </h1>
        </div>
        <div className="h-screen w-2/3 mx-auto rounded-t-4xl bg-white">
          <div className="flex justify-center items-center pt-6 mb-8 2xl:mb-32">
            <img
              src="./assets/header_icon.svg"
              alt="icon"
              className="w-72 tall:w-56"
            />
          </div>
          <div className="flex flex-col justify-center px-10 pt-8 pb-14 shadow-xl rounded-md mx-28 xl:mx-48 2xl:mx-80">
            <p className="text-[#434343] text-lg font-semibold 2xl:text-base tall:text-sm">
              Enter Your OTP
            </p>
            <div className="flex justify-center mt-6 tall:mt-3">
              {otp.map((_: any, index: number) => (
                <input
                  ref={index === activeOTPIndex ? inputRef : null}
                  key={index}
                  type="number"
                  name="otp"
                  maxLength={1}
                  style={{ boxShadow: "0px 0px 8px 1px rgba(0, 0, 0, 0.1)" }}
                  className="w-10 h-10 rounded text-center mr-3  transition spin-button-none"
                  onChange={handleChange}
                  onKeyDown={(e) => handleOnKeyDown(e, index)}
                />
              ))}
            </div>
            <form className="mt-10 tall:mt-5" onSubmit={handleSubmit}>
              <label className="text-subtitle text-lg font-semibold 2xl:text-base tall:text-sm">
                Enter Your New Password
              </label>
              <input
                name="password"
                type="password"
                className="w-full px-3 py-2.5 mb-5 text-sm outline-none border border-solid border-light-gray rounded-lg my-2 2xl:my-4"
                autoComplete="off"
                value={password}
                maxLength={50}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter Your New Password"
              />
              <label className="text-subtitle text-lg font-semibold 2xl:text-base tall:text-sm">
                Confirm Password
              </label>
              <input
                name="confirmpassword"
                type="password"
                className="w-full px-3 py-2.5 text-sm outline-none border border-solid border-light-gray rounded-lg my-2 2xl:mt-4"
                autoComplete="off"
                value={confirmPassword}
                maxLength={50}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm Password"
              />
              <p className="text-xs text-red-500">{error ? error : ""}</p>
              <button
                type="submit"
                className={`bg-gradient-to-t from-[#025385] to-primary rounded-lg text-base font-bold text-center w-full text-white py-2.5 mt-9 tall:mt-5 2xl:text-base 2xl:font-semibold ${
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
                  "SUBMIT"
                )}
              </button>
            </form>
            {/* <button
              className={`text-secondary text-xs font-semibold mx-auto mt-4 2xl:text-sm ${
                loading ? "cursor-wait" : "cursor-pointer"
              }`}
              onClick={() => history.push("/")}
              disabled={loading}
            >
              Go to Login
            </button> */}
            <button
              className={`text-secondary text-base font-semibold mx-auto mt-4 2xl:text-sm ${
                loading ? "cursor-wait" : "cursor-pointer"
              }`}
              onClick={() => history.push("/forgotpassword")}
              disabled={loading}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
