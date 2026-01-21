import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar";
import { User } from "../../definitions/user";

interface HelpPageProps {}

const HelpPage: React.FC<HelpPageProps> = () => {
  const [user, setUser] = useState<User>();
  const history = useHistory();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    } else {
      history.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full relative">
      <Sidebar />
      <div className="ml-[25%] w-3/4 min-h-screen">
        <div className="fixed top-0 w-full">
          <Header title={`Welcome ${user?.name || ""} !`} />
        </div>
        <div className="flex items-center justify-center h-screen">
          <div className="rounded-lg shadow-xl p-4">
            <p className="border-solid border-b-2 2xl:border-b-4 border-orange w-max m-3 text-xl font-bold 2xl:text-2xl">
              Help
            </p>
            <div className="flex p-3 text-base 2xl:text-lg">
              <div className="flex py-2 pl-1 pr-2 border-r border-solid border-[rgba(63,54,244,0.15)]">
                <div className="flex flex-col mr-4">
                  <p className="font-bold 2xl:mb-1">Mail Us</p>
                  <div className="flex justify-between">
                    <img
                      src="./assets/mail.svg"
                      alt="mail"
                      className="mr-2 w-4 2xl:w-5"
                    ></img>
                    <p>support@skill.page</p>
                  </div>
                </div>
              </div>
              <div className="flex ml-2 p-2">
                <div className="flex flex-col pl-2 pr-4">
                  <p className="font-bold 2xl:mb-1">Call Us</p>
                  <div className="flex justify-between">
                    <img
                      src="./assets/phone.svg"
                      alt="phone"
                      className="pr-2 w-4 2xl:w-6"
                    ></img>
                    <p>022 - 41537777</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
