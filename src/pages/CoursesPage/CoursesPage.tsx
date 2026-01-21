import React, { useEffect, useLayoutEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import CourseCard from "../../components/CourseCard";
import Header from "../../components/Header/Header";
import SearchBar from "../../components/SearchBar/SearchBar";
import { useHistory } from "react-router-dom";
import { User } from "../../definitions/user";
import { CourseDataManager } from "../../store/courses/datamanager";
import { notification, Spin } from "antd";
import { GeneralObject } from "../../definitions/general";
import { useAuthenticatedApi } from "../../hooks/useApi";
import { handleNotification } from "../../utils/notification";
import { IndexedDBService } from "../../store/courses/indexedDBService";
declare const window: any;

interface CoursesPageProps {}

const CoursesPage: React.FC<CoursesPageProps> = () => {
  const dm = new CourseDataManager();
  const idb = new IndexedDBService();
  const history = useHistory();
  const authApi = useAuthenticatedApi();
  const [orgid, setOrgid] = useState<string>("");
  const [user, setUser] = useState<User>();
  const [search, setSearch] = useState<string>("");
  const [courses, setCourses] = useState<any>();
  const [isDataCalled, setisDataCalled] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<any>();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    } else {
      history.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && user.username !== "dummy") {
      if (authApi && navigator.onLine) {
        authApi
          .get("/user/usermeta")
          .then((res: any) => {
            if (res.status === 200) {
              setOrgid(res.data.user.org_data[0].organization_id);
              localStorage.setItem(
                "orgid",
                res.data.user.org_data[0].organization_id
              );
            }
          })
          .catch((e) => {
            if (e.response.status === 400) {
              handleNotification(
                "error",
                "Could not fetch user details. Please try again later"
              );
            } else {
              handleNotification(
                "error",
                "Some error occured, Please try again later"
              );
            }
          });
      }
    }
  }, [user]);

  useLayoutEffect(() => {
    const dm = new CourseDataManager();
    if (navigator.onLine && user && user.username !== "dummy") {
      callApi(dm);
    }
  }, [orgid]);

  const callApi = async (dm: CourseDataManager) => {
    let courses = await dm.getAllCoursesFromApi();
    if (courses) {
      setisDataCalled(true);
    }
  };

  useEffect(() => {
    setTimeout(
      () => {
        const dm = new CourseDataManager();
        dm.getAllCoursesFromDb().then((courses) => {
          setCourses(courses);
        });
      },
      navigator.onLine ? 2000 : 0
    );
  }, [isDataCalled]);

  const handleOnClick = (data: any) => {
    const dm = new CourseDataManager();
    data.type === 0
      ? history.push(
          `/theory/${data.bundle_id}/${data.curriculum[0].lesson_id}/${data.curriculum[0].chapters[0].material_id}`
        )
      : history.push(
          `/practical/${data.bundle_id}/${data.curriculum[0].lesson_id}/${data.curriculum[0].chapters[0].material_id}`
        );
  };

  useEffect(() => {
    if (search !== "") {
      const filterCourses = courses.filter((course: GeneralObject) =>
        course.bundle_name
          .split("_")[0]
          .toLowerCase()
          .startsWith(search.trim().toLowerCase())
      );
      setFilteredCourses(filterCourses);
    }
  }, [search, courses]);

  const handleInstallFromPendrive = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    window.api.message((msg: string) => {
      if (msg) {
        handleNotification(
          "info",
          `${msg}`,
          "topRight",
          0,
          "install-course",
          <></>
        );
      }
    });
    window.api.error((msg: string) => {
      if (msg) {
        handleNotification("error", `${msg}`);
      }
    });
    window.api.copyZip("dummy", "dummy", true);
    window.api.extracting((arg: string) => {
      if (arg) {
        notification.destroy();
        handleNotification("info", `${arg}`, "topRight", 0, "extract", <></>);
      }
    });
    window.api.receiveCurriculum((isError: boolean, arg: string) => {
      if (isError) {
        handleNotification("error", `${arg}`, "topRight", 2, "install-course");
      } else if (arg) {
        setisDataCalled((prev) => !prev);
        const curriculum = JSON.parse(arg);
        delete curriculum.id;
        curriculum.is_installed = true;
        idb.addCoursesInDB(curriculum);
        setTimeout(() => {
          notification.destroy();
          handleNotification(
            "success",
            "Course installed successfully",
            "topRight",
            3,
            "install-course"
          );
        }, 2100);
      }
    });
  };

  return (
    <div className="h-screen flex w-full relative">
      <Sidebar />
      <div className="w-full ml-[25%] overflow-y-auto relative">
        <Header title={`Welcome ${user?.name || ""} !`} />
        <div className="flex justify-between m-5 2xl:m-7">
          <p className="text-xl ml-2 font-bold 2xl:text-2xl">Active Courses</p>
          <div className="flex">
            <SearchBar
              searchQuery={search}
              setSearch={setSearch}
              disabled={!courses}
            />
            {user?.username === "dummy" && (
              <button
                className="px-3 border border-solid border-light-gray rounded-lg justify-end ml-2"
                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                  handleInstallFromPendrive(e)
                }
              >
                Install from pendrive
              </button>
            )}
          </div>
        </div>
        {search !== "" ? (
          filteredCourses?.length > 0 ? (
            <div className="flex flex-wrap ml-6 2xl:ml-9">
              {filteredCourses.map((course: GeneralObject) => (
                <div className="mx-3.5 my-2 2xl:mb-8" key={course.id}>
                  <CourseCard
                    key={course.id}
                    data={{
                      id: course.id,
                      bundle_name: course.bundle_name,
                      // name: course.bundle_name.split("_")[0],
                      // type: course.bundle_name.split("_")[1],
                      is_downloaded: course.is_downloaded,
                      is_installed: course.is_installed,
                      img: course.img_url,
                      curriculum: course.curriculum,
                      bundle_id: course.bundle_id,
                      course_type: course.type,
                    }}
                    onClick={() => handleOnClick(course)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col mt-20 justify-between items-center">
              <p className="font-bold text-xl">No courses found</p>
            </div>
          )
        ) : courses && courses.length > 0 ? (
          <div className="flex flex-wrap ml-6 2xl:ml-9">
            {courses.map((course: GeneralObject) => (
              <div className="mx-3.5 my-2 2xl:mb-8" key={course.id}>
                <CourseCard
                  key={course.id}
                  data={{
                    id: course.id,
                    bundle_name: course.bundle_name,
                    is_downloaded: course.is_downloaded,
                    is_installed: course.is_installed,
                    img: course.img_url,
                    curriculum: course.curriculum,
                    bundle_id: course.bundle_id,
                    course_type: course.type,
                  }}
                  onClick={() => handleOnClick(course)}
                />
              </div>
            ))}
          </div>
        ) : !courses ? (
          <div className="flex flex-col mt-20 justify-between items-center">
            <Spin />
            <p className="font-bold text-xl">
              Fetching courses, Please wait...
            </p>
          </div>
        ) : (
          <div className="flex flex-col mt-20 justify-between items-center">
            <p className="font-bold text-xl">No courses</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
