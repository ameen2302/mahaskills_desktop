import { Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import VideoLibraryCard from "../../components/VideoLibraryCard/VideoLibraryCard";
import {
  Chapter,
  Curriculum,
  GeneralObject,
  Lesson,
} from "../../definitions/general";
import { CourseDataManager } from "../../store/courses/datamanager";
import { handleNotification } from "../../utils/notification";
import { convertSeconds } from "../../utils/time";
declare const window: any;

interface PracticalVideoLibraryProps {}

const PracticalVideoLibrary: React.FC<PracticalVideoLibraryProps> = () => {
  const history = useHistory();
  const params: { bundleId: string } = useParams();
  const [curriculum, setCurriculum] = useState<any>();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [vidTitle, setVidTitle] = useState<string>("");
  const [vidSrc, setVidSrc] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [language, setLanguage] = useState<string>(
    localStorage.getItem(`${params?.bundleId}_lang`) || "english"
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson>();
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();
  const videoRef = useRef<any>();

  useEffect(() => {
    const dm = new CourseDataManager();
    let curriculum: Curriculum;
    (async () => {
      curriculum = await dm.getCurriculumByBundleId(+params?.bundleId);
      if (curriculum) {
        for (let lesson of curriculum?.curriculum) {
          for (let chapter of lesson.chapters) {
            let proc = chapter.tabs?.filter(
              (tab: any) =>
                ![
                  "Objective",
                  "Requirements",
                  "Skill Information",
                  "Assessment",
                ].includes(tab?.name)
            );
            chapter.tabs = proc;
          }
        }
        const promises = [] as Promise<void>[];

        curriculum?.curriculum?.forEach((lesson: any) => {
          lesson.chapters.forEach((chapter: any) => {
            chapter.tabs.forEach((tab: any) => {
              for (const [key, value] of Object.entries(
                tab.language_resources as object
              )) {
                promises.push(
                  new Promise((resolve, reject) => {
                    window.api.requestThumbContent(
                      `${value.thumbnail}`,
                      (arg: any) => {
                        resolve((value.thumbnail = arg));
                      }
                    );
                  })
                );
              }
            });
          });
        });

        Promise.allSettled(promises).then(() => {
          setCurriculum(curriculum);
        });
      }
    })();
  }, [params.bundleId]);

  useEffect(() => {
    if (curriculum) {
      setSelectedLesson(curriculum?.curriculum[0]);
    }
  }, [curriculum]);

  useEffect(() => {
    if (language && currentFileName) {
      const requestVideo = `${currentFileName.substring(
        0,
        currentFileName.lastIndexOf("_")
      )}_${language}.le`;
      getVideo(requestVideo);
    }
  }, [language, currentFileName]);

  const goBack = () => {
    history.goBack();
  };

  const getVideo = (videoSrc: string) => {
    setCurrentFileName(videoSrc);
    if (videoSrc.startsWith("https")) {
      if (navigator.onLine) {
        setVidSrc(videoSrc);
      } else {
        handleNotification("error", "Video could not be loaded");
      }
    } else if (!videoSrc.startsWith("data:video/mp4")) {
      window.api.requestVideoContent(`${videoSrc}`);
      window.api.receiveVideoContent((data: any) => {
        if (data) {
          setVidSrc(data);
        }
      });
    }
  };

  const handleModal = (video: any) => {
    getVideo(video.language_resources[language].src);
    setVidTitle(video.name);
    setIsVisible(true);
  };

  const handleCancel = () => {
    setIsVisible(false);
    if (videoRef) {
      videoRef.current.pause();
    }
  };

  const getVideoCount = (lesson: any) => {
    let count = 0;
    for (let chapter of lesson.chapters) {
      count += chapter.tabs.length;
    }
    return count;
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-auto">
        <div className="w-[30%]">
          <div className="flex flex-col">
            <div>
              <p className="bg-light-red text-white text-center font-bold text-lg py-2 2xl:text-xl 2xl:py-3">
                VIDEO LIBRARY
              </p>
              <p className="font-bold pl-4 py-2 bg-[#CCC] 2xl:text-lg 2xl:py-3">
                UNITS
              </p>
            </div>
            <div className="bg-[#EEE] h-screen font-semibold overflow-y-scroll pb-28 items-center">
              {curriculum?.curriculum.map((lesson: Lesson, i: number) => (
                <div
                  key={i}
                  className={`flex items-center p-4 hover:bg-gray-300 cursor-pointer ${
                    selectedLesson?.lesson_id === lesson.lesson_id
                      ? "bg-gray-300"
                      : ""
                  }`}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <p key={i} className="uppercase">
                    {lesson.name}
                    {" ("}
                    {getVideoCount(lesson)}
                    {")"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-[70%]">
          <div className="flex justify-between py-1.5 bg-light-red items-center ml-1 2xl:py-2.5">
            <span className="text-white font-bold text-lg pl-4 2xl:text-xl">
              {selectedLesson?.name}
            </span>
            <div className="cursor-pointer" onClick={goBack}>
              <img
                src="./assets/close_btn.svg"
                alt="close button"
                className="mr-10 w-8 relative"
              />
            </div>
          </div>
          <div className="overflow-y-scroll h-screen pb-16 xl:pb-20 pt-5 bg-white">
            {selectedLesson?.chapters.map((chapter: Chapter, index: number) => (
              <div key={index}>
                <p className="mb-2 text-base 2xl:text-lg font-bold ml-4">
                  {chapter.name}
                </p>
                <div className="flex flex-wrap">
                  {chapter.tabs.map((tab: GeneralObject, i: number) => (
                    <div
                      className="ml-5"
                      key={i}
                      onClick={() => {
                        setSelectedChapter(chapter);
                        handleModal(tab);
                      }}
                    >
                      <VideoLibraryCard
                        className="mb-4"
                        name={tab.name}
                        thumb={tab.language_resources[language].thumbnail}
                        duration={tab.language_resources[language].duration}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        width={window.innerWidth < 1920 ? "1200px" : "1480px"}
        centered
        title={
          <div className="flex justify-between mx-2 text-white font-semibold">
            <span>{vidTitle}</span>
            <select
              className="text-white border border-solid border-black bg-btn-green px-3 py-0.5 rounded-2xl font-bold 2xl:text-base appearance-none outline-none cursor-pointer text-center mr-8"
              onChange={(e) => {
                setLanguage(e.target.value);
                localStorage.setItem(
                  `${params?.bundleId}_lang`,
                  e.target.value
                );
              }}
              value={language}
            >
              {curriculum &&
                Object.keys(
                  curriculum?.curriculum[0].chapters[0].tabs[0]
                    .language_resources
                ).map((lang: string, i: number) => (
                  <option value={lang} key={i}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
            </select>
          </div>
        }
        open={isVisible}
        footer={false}
        onCancel={handleCancel}
      >
        <div className="flex max-h-[576px] bg-white justify-between relative w-full">
          <video
            className="w-[65%] max-h-[inherit]"
            // autoPlay
            controls
            controlsList="nodownload"
            src={vidSrc}
            ref={videoRef}
          />
          <div className="flex flex-col overflow-y-scroll h-full bg-gray-100 max-h-[65vh] w-[35%]">
            <p className="text-lg font-bold px-3 py-1.5 border-b border-solid border-gray-300 text-center">
              VIDEO LIST
            </p>
            <div>
              {selectedChapter?.tabs.map((tab: GeneralObject, i: number) => (
                <div
                  className={`flex py-2 border-b border-solid border-black cursor-pointer pl-1.5 ${
                    vidTitle === tab.name ? "bg-gray-300" : ""
                  }`}
                  key={i}
                  onClick={() => handleModal(tab)}
                >
                  <div className="relative">
                    <img
                      src={tab.language_resources[language].thumbnail}
                      alt="video thumbnail"
                      className="w-32 rounded-lg"
                    />
                    <img
                      className="absolute top-[40%] left-[40%]"
                      src="./assets/play.svg"
                      alt="play button"
                    />
                    <div className="absolute top-2 right-2 font-bold bg-white rounded-lg px-2 py-0.5 text-[0.6rem] 2xl:text-xs">
                      {convertSeconds(
                        tab.language_resources[language].duration
                      )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between ml-5">
                    <p className="text-sm font-sans font-semibold">
                      {tab.name}
                    </p>
                    <p className="self-end mr-4">
                      {i + 1}/{selectedChapter?.tabs.length}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PracticalVideoLibrary;
