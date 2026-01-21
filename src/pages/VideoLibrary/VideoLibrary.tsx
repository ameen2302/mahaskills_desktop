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
import { loadThumbnails } from "../../utils/thumbnailStore";
import { convertSeconds } from "../../utils/time";
declare const window: any;

interface VideoLibraryProps {}

const VideoLibrary: React.FC<VideoLibraryProps> = () => {
  const history = useHistory();
  const params: { bundleId: string } = useParams();
  const [curriculum, setCurriculum] = useState<any>();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [vidTitle, setVidTitle] = useState<string>("");
  const [vidSrc, setVidSrc] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const videoRef = useRef<any>();
  const [language, setLanguage] = useState<string>(
    localStorage.getItem(`${params?.bundleId}_lang`) || "english"
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson>();
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();

  useEffect(() => {
    const dm = new CourseDataManager();
    let curriculum: Curriculum;
    (async () => {
      curriculum = await dm.getCurriculumByBundleId(+params?.bundleId);
      if (curriculum) {
        const promises = [] as Promise<void>[];
        curriculum?.curriculum?.forEach((curr: any) => {
          curr.chapters.forEach((chapter: any) => {
            for (const lang in chapter.language_resources) {
              const videos = chapter.language_resources[lang].videos;
              promises.push(
                new Promise((resolve, reject) => {
                  loadThumbnails(videos).then((videos) => {
                    chapter.language_resources[lang].videos = videos;
                    resolve();
                  });
                })
              );
            }
          });
        });
        Promise.allSettled(promises).then(() => {
          setCurriculum(curriculum.curriculum);
        });
      }
    })();
  }, [params.bundleId]);

  useEffect(() => {
    if (curriculum) {
      setSelectedLesson(curriculum[0]);
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
    getVideo(video.vid_src);
    setVidTitle(video.vid_title);
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
      count += chapter.language_resources["english"].videos.length;
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
              {curriculum?.map((lesson: Lesson, i: number) => (
                <div
                  key={i}
                  className={`flex items-center p-4 hover:bg-gray-300 cursor-pointer ${
                    selectedLesson?.lesson_id === lesson.lesson_id
                      ? "bg-gray-300 font-bold"
                      : ""
                  }`}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  {/* <img
                    alt="icons"
                    className={`mr-4 h-3 w-3 xl:h-4 xl:w-4 xl:pt-1`}
                    src="../../assets/plus_icon.svg"
                  /> */}
                  <p key={i} className="uppercase">
                    {lesson.name}
                    <span>
                      {" ("}
                      {getVideoCount(lesson)}
                      {")"}
                    </span>
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
                {chapter.language_resources[language].videos.length ? (
                  <p className="mb-2 text-base 2xl:text-lg font-bold ml-4">
                    {chapter.name}
                  </p>
                ) : null}
                <div className="flex flex-wrap">
                  {chapter.language_resources[language].videos.length > 0 &&
                    chapter.language_resources[language].videos.map(
                      (video: GeneralObject, i: number) => (
                        <div
                          className="ml-5"
                          key={i}
                          onClick={() => {
                            handleModal(video);
                            setSelectedChapter(chapter);
                          }}
                        >
                          <VideoLibraryCard
                            className="mb-4"
                            name={video.vid_title}
                            duration={video.duration}
                            thumb={video.vid_thumb}
                          />
                        </div>
                      )
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        centered
        width={window.innerWidth < 1920 ? "1024px" : "1080px"}
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
                Object.keys(curriculum[0].chapters[0].language_resources).map(
                  (lang: string, i: number) => (
                    <option value={lang} key={i}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  )
                )}
            </select>
          </div>
        }
        open={isVisible}
        footer={false}
        onCancel={handleCancel}
      >
        <div className="flex max-h-[576px] bg-white justify-between w-full">
          <video
            className="w-[65%] max-h-[inherit]"
            autoPlay
            controls
            controlsList="nodownload"
            src={vidSrc}
            ref={videoRef}
          />
          <div className="flex flex-col overflow-y-scroll h-full bg-gray-100 max-h-[63vh] 2xl:max-h-[53vh] w-[35%]">
            <p className="text-lg font-bold px-3 py-1.5 border-b border-solid border-gray-300 text-center">
              VIDEO LIST
            </p>
            {selectedChapter?.language_resources[language].videos.map(
              (video: any, i: number) => (
                <div
                  className={`flex py-2 border-b border-solid border-black cursor-pointer pl-1.5 ${
                    vidTitle === video.vid_title ? "bg-gray-300" : ""
                  }`}
                  key={i}
                  onClick={() => handleModal(video)}
                >
                  <div className="relative">
                    <img
                      src={video.vid_thumb}
                      alt="video thumbnail"
                      className="w-32 rounded-lg"
                    />
                    <img
                      className="absolute top-[40%] left-[40%]"
                      src="./assets/play.svg"
                      alt="play button"
                    />
                    <div className="absolute top-2 right-2 font-bold bg-white rounded-lg px-2 py-0.5 text-[0.6rem] 2xl:text-xs">
                      {convertSeconds(video.duration)}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between ml-5">
                    <p className="text-sm font-sans font-semibold pr-4">
                      {video.vid_title}
                    </p>
                    <p className="self-end mr-4">
                      {i + 1}/
                      {
                        selectedChapter?.language_resources[language].videos
                          .length
                      }
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VideoLibrary;
