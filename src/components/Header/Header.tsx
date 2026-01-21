import React from "react";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div
      className="flex w-full font-bold bg-primary text-white px-6 py-4 text-base 2xl:text-xl 2xl:py-[1.38rem]"
      style={{ boxShadow: "0px 2px 7px 1px rgba(0, 0, 0, 0.15)" }}
    >
      {title}
    </div>
  );
};

export default Header;
