import React from "react";
import { convertSeconds } from "../../utils/time";

interface VideoLibraryCardProps {
  className: string;
  name: string;
  thumb: string;
  duration?: number;
}

const VideoLibraryCard: React.FC<VideoLibraryCardProps> = ({
  className,
  thumb,
  name,
  duration,
}) => {
  return (
    <div
      className={`flex flex-col w-52 relative ${className ? className : ""}`}
    >
      <div className="relative">
        <img
          src={thumb}
          alt="video thumbnail"
          className="rounded-lg cursor-pointer"
        />
        <img
          className="absolute top-[40%] left-[40%] cursor-pointer w-9"
          src="./assets/play.svg"
          alt="play button"
        />
      </div>
      <p className="text-xs 2xl:text-sm pt-0.5 font-sans font-semibold">
        {name}
      </p>
      {duration && (
        <div className="absolute top-2 right-6 font-bold bg-white rounded-lg px-2 py-0.5 text-[0.6rem] 2xl:text-xs">
          {convertSeconds(duration)}
        </div>
      )}
    </div>
  );
};

export default VideoLibraryCard;
