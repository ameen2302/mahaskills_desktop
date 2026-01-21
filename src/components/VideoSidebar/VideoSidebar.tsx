import { Modal } from "antd";
import React, { useEffect, memo, useRef, useState } from "react";
import { handleNotification } from "../../utils/notification";
import { loadThumbnails } from "../../utils/thumbnailStore";
import { convertSeconds } from "../../utils/time";
declare const window: any;

interface VideoSidebarProps {
  data: any;
  language: string;
}

const VideoSidebar: React.FC<VideoSidebarProps> = ({ data, language }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [vidTitle, setVidTitle] = useState<string>("");
  const [vidSrc, setVidSrc] = useState<string>("");
  const [thumbs, setThumbs] = useState<any>();
  const videoRef = useRef<any>();

  useEffect(() => {
    if (data) {
      loadThumbnails(data[language].videos).then((videos) => {
        setThumbs(videos);
      });
    }
  }, [data, language]);

  const getVideo = (videoSrc: string) => {
    if (videoSrc.startsWith("https")) {
      if (navigator.onLine) {
        setVidSrc(videoSrc);
      } else {
        handleNotification("error", "Video could not be loaded");
      }
    } else {
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

  return (
    <div className="flex flex-col flex-grow">
      <div className="bg-custom-gray px-2 py-[0.7rem] 2xl:py-[0.65rem] font-bold 2xl:h-[62px] 2xl:text-lg 2xl:pt-4 2xl:pl-2">
        Video(s) list
      </div>
      <div className="overflow-y-scroll h-[82vh]">
        {data[language].videos.length > 0 ? (
          data[language].videos.map((video: any, i: number) => (
            <div
              className="flex px-4 py-5 border-b border-solid border-black cursor-pointer"
              key={i}
              onClick={() => handleModal(video)}
            >
              <div className="relative">
                {thumbs ? (
                  <img
                    src={thumbs && thumbs[i].vid_thumb}
                    alt="video thumbnail"
                    className="w-32 rounded-lg"
                  />
                ) : (
                  <div className="w-32 rounded-lg bg-gray-300 h-full min-h-[80px]"></div>
                )}
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
                <p className="text-sm font-sans font-medium">
                  {video.vid_title}
                </p>
                <p className="self-end mr-4">
                  {i + 1}/{data[language].videos.length}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center p-4 font-bold text-lg">
            No videos
          </div>
        )}
      </div>
      <Modal
        centered
        width={window.innerWidth < 1920 ? "1024px" : "1250px"}
        title={
          <div className="flex justify-between mx-2 text-white font-semibold">
            <span>{vidTitle}</span>
          </div>
        }
        open={isVisible}
        footer={false}
        onCancel={handleCancel}
      >
        <div className="flex max-h-[65vh] bg-white justify-between w-full">
          <video
            className="min-w-[inherit] max-h-[inherit] w-[65%]"
            autoPlay
            controls
            controlsList="nodownload"
            src={vidSrc}
            ref={videoRef}
          />
          <div className="flex flex-col overflow-y-scroll h-full bg-gray-100 max-h-[65vh] max-w-[35%]">
            <p className="text-lg font-bold px-3 py-1.5 border-b border-solid border-gray-300 text-center">
              VIDEO LIST
            </p>
            {data[language].videos.length > 0 &&
              data[language].videos.map((video: any, i: number) => (
                <div
                  className={`flex py-2 border-b border-solid border-black cursor-pointer pl-1 ${
                    vidTitle === video.vid_title ? "bg-gray-300" : ""
                  }`}
                  key={i}
                  onClick={() => handleModal(video)}
                >
                  <div className="relative ">
                    <img
                      src={thumbs && thumbs[i].vid_thumb}
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
                    <p className="text-sm font-sans font-semibold">
                      {video.vid_title}
                    </p>
                    <p className="self-end mr-4">
                      {i + 1}/{data[language].videos.length}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Modal>
      <div className="fixed bottom-0 bg-primary w-full h-12 2xl:h-14 bg-gradient-to-r from-primary to-tertiary"></div>
    </div>
  );
};

export default memo(VideoSidebar);
