import React from "react";
import { Route, Switch } from "react-router-dom";
import CoursesPage from "./CoursesPage";
import ProfilePage from "./ProfilePage";
import HelpPage from "./HelpPage";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp/VerifyOtp";
import CourseModulePage from "./CourseModulePage";
import VideoLibrary from "./VideoLibrary";
import PracticalModulePage from "./PracticalModulePage";
import PracticalVideoLibrary from "./PracticalVideoLibrary";

interface RoutesProps {}

const Routes: React.FC<RoutesProps> = () => {
  return (
    <section className="bg-white overflow-y-clip auth-layout">
      <Switch>
        <Route
          path="/theoryVideos/:bundleId/:lessonId?"
          component={VideoLibrary}
        />
        <Route
          path="/practicalVideos/:bundleId/:lessonId?"
          component={PracticalVideoLibrary}
        />
        <Route path="/courses" component={CoursesPage} />
        <Route
          path="/theory/:bundleId/:lessonId?/:materialId?"
          component={CourseModulePage}
        />
        <Route
          path="/practical/:bundleId/:lessonId?/:materialId?"
          component={PracticalModulePage}
        />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/help" component={HelpPage} />
        <Route path="/forgotpassword" component={ForgotPassword} />
        <Route path="/verifyotp" component={VerifyOtp} />
        <Route path="/" component={Login} />
      </Switch>
    </section>
  );
};

export default Routes;
