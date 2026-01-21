import React from "react";
import { useHistory, useLocation } from "react-router-dom";

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const history = useHistory();
  const location = useLocation();

  return (
    <div
      className="h-screen fixed z-20 w-1/4 overflow-hidden"
      style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
    >
      <div className="flex justify-center items-center px-5 py-1 mb-20 bg-gray-200">
        <img
          src="./assets/header_icon.svg"
          alt="icon"
          className="w-48 4xl:w-64"
        ></img>
      </div>
      <div
        className={`flex items-center px-5 py-4 hover:bg-gray-300 cursor-pointer ${
          location.pathname === "/courses" ? "bg-gray-300 font-bold" : ""
        }`}
        onClick={() => history.push("/courses")}
      >
        <img
          src="./assets/courses.svg"
          alt="icon"
          className="mr-2 2xl:mr-4"
        ></img>
        <p className="text-base 2xl:text-lg">My Courses</p>
      </div>
      <div
        className={`flex items-center px-5 py-4 hover:bg-gray-300 cursor-pointer ${
          location.pathname === "/profile" ? "bg-gray-300 font-bold" : ""
        }`}
        onClick={() => history.push("/profile")}
      >
        <img
          src="./assets/profile.svg"
          alt="icon"
          className="mr-2 2xl:mr-4"
        ></img>
        <p className="text-base 2xl:text-lg">Profile</p>
      </div>
      <div
        className={`flex items-center px-5 py-4 hover:bg-gray-300 cursor-pointer ${
          location.pathname === "/help" ? "bg-gray-300 font-bold" : ""
        }`}
        onClick={() => history.push("/help")}
      >
        <img src="./assets/help.svg" alt="icon" className="mr-2 2xl:mr-4"></img>
        <p className="text-base 2xl:text-lg">Help</p>
      </div>
    </div>
  );
};

export default Sidebar;
