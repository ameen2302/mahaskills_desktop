import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Lesson } from "../../definitions/general";

interface CollapseMenuProps {
  data: any;
}

const CollapseMenu: React.FC<CollapseMenuProps> = ({ data }) => {
  const history = useHistory();
  const params: { bundleId: string; lessonId: string; materialId: string } =
    useParams();
  const [openedLesson, setOpenedLesson] = useState<number>(0);
  const isOpen = (index: number) => openedLesson === index;
  return (
    <div className="py-2">
      <div
        className={`lesson-menu ${
          openedLesson === -1 ? "closed-lesson-menu" : ""
        }`}
      >
        {data?.map((lesson: Lesson, index: number) => (
          <div
            key={index}
            className="flex flex-col"
            onClick={() => {
              if (openedLesson !== index) {
                setOpenedLesson(index);
              } else {
                setOpenedLesson(-1);
              }
            }}
          >
            <div className="flex gap-2 cursor-pointer z-20 items-start py-1">
              <img
                alt="lesson-icon"
                src={
                  require(!isOpen(index)
                    ? "../../assets/plus_icon.svg"
                    : "../../assets/minus_icon.svg").default
                }
                className="mt-1 w-3 2xl:w-4"
              />
              <p
                className={`text-sm xl:text-base pr-4 truncate ${
                  +params.lessonId === lesson.lesson_id ? "font-bold" : ""
                }`}
              >
                {lesson?.name}
              </p>
            </div>
            {lesson?.chapters?.length > 0 && isOpen(index) && (
              <div
                className="pl-5 chapter-menu"
                style={{
                  height: `calc(min(90%,25*${lesson.chapters.length}%))`,
                }}
              >
                {lesson?.chapters?.map((chapter: any, idx: number) => (
                  <div
                    className="flex gap-2 py-1 cursor-pointer items-start"
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      history.push(
                        `/practical/${params.bundleId}/${lesson.lesson_id}/${chapter.material_id}`
                      );
                    }}
                  >
                    <img
                      alt="chapter-icon"
                      className="z-20 mt-1 w-3 2xl:w-4"
                      src={require("../../assets/courses-green.svg").default}
                    />
                    <p
                      className={`${
                        chapter.material_id === +params.materialId
                          ? "font-bold"
                          : "font-normal"
                      } text-sm xl:text-base truncate`}
                    >
                      {chapter.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollapseMenu;
