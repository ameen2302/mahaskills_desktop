import React from "react";
import { useHistory } from "react-router-dom";

interface CourseHeaderProps {
  title: string;
  isPractical?: boolean;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ title, isPractical }) => {
  const history = useHistory();
  return (
    <div className="flex justify-between w-full font-bold bg-primary text-white">
      <div className="flex items-center">
        <img
          src={`./assets/${isPractical ? "practical-logo2" : "icon"}.svg`}
          alt="logo"
          className={`${
            isPractical ? "w-28 4xl:w-48" : "w-14"
          } bg-white 2xl:w-24 ml-6`}
        />
        <hr className="h-full w-0" />
        <span className="ml-4 text-base 2xl:text-xl border-l-2 pl-4 border-solid border-white py-1 2xl:py-3 4xl:py-2 pr-6">
          {title}
        </span>
      </div>
      <div
        className="flex cursor-pointer py-2 2xl:py-3"
        onClick={() => history.push("/courses")}
      >
        <img
          src="./assets/close_btn.svg"
          alt="close button"
          className="mr-4 2xl:mr-9"
        />
      </div>
    </div>
  );
};

export default CourseHeader;
