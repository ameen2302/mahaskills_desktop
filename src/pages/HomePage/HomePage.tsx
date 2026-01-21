import React from "react";
import { useHistory } from "react-router-dom";

interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  const history = useHistory();
  return <div onClick={() => history.push("/login")}>HomePage</div>;
};

export default HomePage;
