import { Button, Modal, notification } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar";
import { User } from "../../definitions/user";
import { IndexedDBService } from "../../store/courses/indexedDBService";
import { handleNotification } from "../../utils/notification";
declare const window: any;

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const [user, setUser] = useState<User>();
  const [isVisible, setisVisible] = useState(false);
  const history = useHistory();
  const idb = new IndexedDBService();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    } else {
      history.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mobileNumberEncryptor = (number: number | string | undefined) => {
    number = `${number}`;
    const firstTwo = number.slice(0, 2);
    const lastThree = number.slice(-3);
    const stars = [...Array(number.length - 5)].map(() => "*").join("");
    const encryptedString = `${firstTwo}${stars}${lastThree}`;
    return encryptedString;
  };
  const emailEncryptor = (email: string | undefined) => {
    if (email) {
      const emailArr = email.split("@");
      const mailEmail = emailArr[0];
      const mailDomain = emailArr[1];
      const firstTwo = mailEmail.slice(0, 2);
      const stars = [...Array(mailEmail.length - 2)].map(() => "*").join("");
      const encryptedEmail = `${firstTwo}${stars}@${mailDomain}`;
      return encryptedEmail;
    }
  };

  const handleLogout = () => {
    window.localStorage.clear();
    idb.clearData();
    setisVisible(false);
    history.push("/");
    notification.destroy();
    handleNotification(
      "success",
      "Logged out successfully",
      "topRight",
      3,
      "auth"
    );
  };

  const handleLogoutModalClose = () => {
    setisVisible(false);
  };

  return (
    <div className="flex w-full relative">
      <Sidebar />
      <div className="ml-[25%] min-h-screen w-3/4">
        <div className="fixed top-0 w-full">
          <Header title={`Welcome ${user?.name || ""} !`} />
        </div>
        <div className="flex justify-center items-center h-screen">
          <div className="rounded-lg shadow-xl p-5 pb-6">
            <p className="border-solid border-b-2 2xl:border-b-4 border-orange w-max m-3 text-xl font-bold 2xl:text-2xl">
              User Profile
            </p>
            <div className="flex flex-col mx-12 mt-7 text-base 2xl:text-lg [&>div:rgba(63,54,244,0.07)]">
              <div className="flex items-center border-solid border-b py-3">
                <p className="w-32 ml-6 mr-4">Name: </p>
                <p>{user?.name}</p>
              </div>
              {user?.username !== "dummy" && (
                <>
                  <div className="flex items-center border-solid border-b py-3">
                    <p className="w-32 ml-6 mr-4">User Name: </p>
                    <p>{user?.username}</p>
                  </div>
                  <div className="flex items-center border-solid border-b py-3">
                    <p className="w-32 ml-6 mr-4">Mobile No: </p>
                    <p>{mobileNumberEncryptor(user?.contact_number)}</p>
                  </div>
                  <div className="flex items-center border-solid border-b py-3">
                    <p className="w-32 ml-6 mr-4">Email id: </p>
                    <p>{emailEncryptor(user?.email)}</p>
                  </div>
                </>
              )}
              <button
                className="justify-center mt-5 border border-solid bg-primary text-white font-bold text-lg py-3 rounded-lg"
                onClick={() => setisVisible(true)}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={isVisible}
        centered={true}
        footer={null}
        onCancel={handleLogoutModalClose}
        closable={false}
      >
        <p className="text-center px-5 py-8 text-lg">
          Are you sure you want to logout ?
          <br />
          All the offline course data will be removed
        </p>
        <div className="flex justify-end w-full pr-6 py-3">
          <Button
            className="bg-white border border-solid border-black mr-4"
            onClick={handleLogoutModalClose}
          >
            No
          </Button>
          <Button className="bg-[#137AD2] text-white" onClick={handleLogout}>
            Yes
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
