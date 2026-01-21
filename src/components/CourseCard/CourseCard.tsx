import { notification, Progress, Spin } from "antd";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { AppStateContext } from "../../context/AppStateContext";
import { GeneralObject } from "../../definitions/general";
import { CourseDataManager } from "../../store/courses/datamanager";
import { handleNotification } from "../../utils/notification";
declare const window: any;
let source = axios.CancelToken.source();

interface CourseCardProps {
  onClick: (c: any) => void;
  data: GeneralObject;
}

const CourseCard: React.FC<CourseCardProps> = ({ onClick, data }) => {
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string>(data.img || "");
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);
  const [isDownloadComplete, setisDownloadComplete] = useState<boolean>(
    data?.is_downloaded
  );
  const [isInstalled, setisInstalled] = useState<boolean>(data?.is_installed);
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const { courseDownloadLoadingList, setcourseDownloadLoadingList } =
    useContext(AppStateContext);
  const dm = new CourseDataManager();

  useEffect(() => {
    let downloadStatus;
    dm.getCurriculumByBundleId(data.bundle_id).then((res) => {
      downloadStatus = res.is_downloaded;
      if (
        courseDownloadLoadingList?.length &&
        courseDownloadLoadingList.includes(data.bundle_id)
      ) {
        setisLoading(true);
        setisDownloadComplete(downloadStatus);
      } else {
        setisLoading(false);
        setisDownloadComplete(downloadStatus);
      }
    });
  }, [courseDownloadLoadingList?.length, data]);

  useEffect(() => {
    if (image) {
      if (!(image?.startsWith("data:image/") || image?.startsWith("https"))) {
        window.api.requestThumbContent(`${image}`, (arg: any) => {
          setImage(arg);
        });
      }
      setImage(image);
    }
  }, [image]);

  useEffect(() => {
    function checkOffline() {
      if (isLoading) {
        setisLoading(false);
        notification.destroy();
        handleNotification(
          "info",
          "Download cancelled due to no internet connection"
        );
        setcourseDownloadLoadingList((prev) =>
          prev.filter((item) => item !== data.bundle_id)
        );
        source.cancel();
      }
    }
    function configureAxios() {
      source = axios.CancelToken.source();
    }
    window.addEventListener("offline", checkOffline);
    window.addEventListener("online", configureAxios);

    return () => {
      window.removeEventListener("online", configureAxios);
      window.removeEventListener("offline", checkOffline);
    };
  });

  useEffect(() => {
    let count = 0;
    for (let index = 0; index < data.curriculum.length - 1; index++) {
      count += data.curriculum[index].chapters.length;
    }
    setTotalChapters(count);
  }, [data]);

  const updateDownloadProgress = (prog: number) => {
    let progress = (prog / totalChapters) * 100;

    notification["info"]({
      key: `progress-${data.bundle_id}`,
      message: (
        <div>
          <p>Downloading {data.bundle_name.split("_")[0]} ...</p>
          <Progress percent={Math.floor(progress)} status="active" />
        </div>
      ),
      closeIcon: <></>,
      placement: "bottomLeft",
      duration: 0,
    });
  };

  const updateEncryptProgress = (prog: number) => {
    let progress = (prog / totalChapters) * 100;

    notification["info"]({
      key: `encrypt-${data.bundle_id}`,
      message: (
        <div>
          <p>Downloading and encrypting {data.bundle_name.split("_")[0]} ...</p>
          <Progress percent={Math.floor(progress)} status="active" />
        </div>
      ),
      closeIcon: <></>,
      placement: "bottomLeft",
      duration: 0,
    });
  };

  const getAvailableSpace = async () => {
    window.api.requestFreeDiskSpace();
    let spacePromise = new Promise((resolve, reject) => {
      window.api.getFreeDiskSpace((space: number) => {
        resolve(space);
      });
    });
    const freeSpace = (await spacePromise) as number;
    return freeSpace;
  };

  const downloadCourse = async (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.onLine) {
      const freeSpace = await getAvailableSpace();
      if (freeSpace > 5000000000) {
        setcourseDownloadLoadingList((prev) => [...prev, data.bundle_id]);
        updateDownloadProgress(0);
        const result =
          data.course_type === 0
            ? await dm.downloadTheoryCourse(
                data.bundle_id,
                data.id,
                updateDownloadProgress,
                source.token
              )
            : await dm.downloadPracticalCourse(
                data.bundle_id,
                data.id,
                updateDownloadProgress,
                source.token
              );
        if (result) {
          notification.close(`progress-${data.bundle_id}`);
          setcourseDownloadLoadingList((prev) =>
            prev.filter((item) => item !== data.bundle_id)
          );
          setisDownloadComplete(true);
          handleNotification("success", "Course downloaded");
        } else {
          handleNotification(
            "error",
            "Something went wrong. Please try again."
          );
          setcourseDownloadLoadingList((prev) =>
            prev.filter((item) => item !== data.bundle_id)
          );
        }
      } else {
        handleNotification("error", "Not enough disk space to download course");
      }
    } else {
      handleNotification("warning", "Please check your internet connection");
    }
  };

  const encryptCourse = async (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.onLine) {
      const freeSpace = await getAvailableSpace();
      if (freeSpace > 5000000000) {
        setcourseDownloadLoadingList((prev) => [...prev, data.bundle_id]);
        updateEncryptProgress(0);
        const result =
          data.course_type === 0
            ? await dm.encryptTheoryCourse(
                data.bundle_id,
                updateEncryptProgress,
                source.token
              )
            : await dm.encryptPracticalCourse(
                data.bundle_id,
                updateEncryptProgress,
                source.token
              );
        if (result) {
          notification.close(`encrypt-${data.bundle_id}`);
          setcourseDownloadLoadingList((prev) =>
            prev.filter((item) => item !== data.bundle_id)
          );
          setIsArchiving(true);
          handleNotification(
            "info",
            "Generating course folder. This might take a few minutes, please wait...",
            "topRight",
            0,
            "zip-progress",
            <></>
          );
          await window.api.saveZip(data.bundle_id, data.bundle_name);
          window.api.zipped((data: string) => {
            if (data) {
              notification.close("zip-progress");
              handleNotification("success", `${data}`, "topRight", 3);
              setIsArchiving(false);
            }
          });
        } else {
          handleNotification(
            "error",
            "Something went wrong. Please try again."
          );
          setcourseDownloadLoadingList((prev) =>
            prev.filter((item) => item !== data.bundle_id)
          );
        }
      } else {
        handleNotification(
          "error",
          "Not enough disk space to download and encrypt course"
        );
      }
    } else {
      handleNotification("warning", "Please check your internet connection");
    }
  };

  const handleMultipleDownloads = (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    handleNotification("info", "Please wait for existing download to complete");
  };

  const handleInstallFromPendrive = (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>
  ) => {
    e.stopPropagation();
    window.api.copyZip(data.bundle_id, data.bundle_name);
    window.api.extracting((arg: string) => {
      if (arg) {
        setIsInstalling(true);
        notification.destroy();
        handleNotification(
          "info",
          `${arg}`,
          "topRight",
          0,
          "install-course",
          <></>
        );
      }
    });
    window.api.receiveCurriculum((isError: boolean, arg: string) => {
      if (isError) {
        handleNotification("error", `${arg}`, "topRight", 2, "install-course");
        setIsInstalling(false);
      } else if (arg) {
        const curriculum = JSON.parse(arg);
        dm.updateCurriculum(curriculum.bundle_id, curriculum);
        dm.markAsInstalled(data.id);
        setisInstalled(true);
        setIsInstalling(false);
        handleNotification(
          "success",
          "Course installed successfully",
          "topRight",
          3,
          "install-course"
        );
      }
    });
  };

  return (
    <Spin
      spinning={isLoading || isInstalling || isArchiving}
      size="large"
      tip={
        <p className="text-lg font-bold drop-shadow">
          {isLoading
            ? "Downloading..."
            : isInstalling
            ? "Installing Course..."
            : "Creating course folder..."}
        </p>
      }
    >
      <div
        className="w-64 border border-solid border-gray-200 shadow-md"
        onClick={(e: any) => {
          e.stopPropagation();
          isDownloadComplete || isInstalled
            ? onClick(e)
            : handleNotification(
                "info",
                "Please download or install the course to view"
              );
        }}
      >
        <img className="w-full cursor-pointer" src={image} alt="" />
        <div className="pt-2 pb-4 px-2">
          <h5
            className="text-xl font-bold tracking-tight text-gray-900 cursor-pointer"
            // onClick={(e: any) =>
            //   isDownloadComplete || isInstalled
            //     ? onClick(e)
            //     : handleNotification(
            //         "info",
            //         "Please download the course to view"
            //       )
            // }
          >
            {data.bundle_name.split("_")[0]}
          </h5>
          <div className="flex justify-between mt-1">
            <p>{data.bundle_name.split("_")[1]}</p>
            <p className="text-sm text-blue-500">
              {data.bundle_name.split("_")[2]}
            </p>
          </div>
          <div className="flex justify-between mt-4 text-green-600 text-xs">
            {!isDownloadComplete && !isInstalled ? (
              <>
                <p
                  className="cursor-pointer"
                  onClick={(e: any) => {
                    !courseDownloadLoadingList?.length
                      ? downloadCourse(e)
                      : handleMultipleDownloads(e);
                  }}
                >
                  Download Online
                </p>
                <p
                  className="cursor-pointer"
                  onClick={(e: any) => {
                    !courseDownloadLoadingList?.length
                      ? handleInstallFromPendrive(e)
                      : handleMultipleDownloads(e);
                  }}
                >
                  Install from folder
                </p>
              </>
            ) : isDownloadComplete && !isInstalled ? (
              <>
                <p className="cursor-default">Downloaded</p>
                <p
                  className="cursor-pointer"
                  onClick={(e: any) => {
                    !courseDownloadLoadingList?.length
                      ? handleInstallFromPendrive(e)
                      : handleMultipleDownloads(e);
                  }}
                >
                  Install from folder
                </p>
              </>
            ) : (
              <>
                <p className="cursor-default">Installed from folder</p>
                <p
                  className="cursor-pointer self-end"
                  onClick={(e: any) => {
                    !courseDownloadLoadingList?.length
                      ? handleInstallFromPendrive(e)
                      : handleMultipleDownloads(e);
                  }}
                >
                  Reinstall course
                </p>
              </>
            )}
          </div>
          {JSON.parse(localStorage.getItem("user") || "").role === 2 && (
            <p
              className="mt-2 text-green-600 text-xs cursor-pointer"
              onClick={(e: any) => {
                !courseDownloadLoadingList?.length
                  ? encryptCourse(e)
                  : handleMultipleDownloads(e);
              }}
            >
              Encrypt Course
            </p>
          )}
        </div>
      </div>
    </Spin>
  );
};

export default CourseCard;
