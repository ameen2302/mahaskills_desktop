import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Curriculum } from "../../definitions/general";

interface BottomSheetProps {
  isOpen: boolean;
  toggleBottomSheet: () => void;
  curriculum: Curriculum | undefined;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  toggleBottomSheet,
  curriculum,
}) => {
  const history = useHistory();
  const params: { bundleId: string; lessonId: string; materialId: string } =
    useParams();
  const [openLesson, setOpenLesson] = useState<number>(0);

  return isOpen ? (
    <div
      className={`flex flex-col h-auto w-96 2xl:w-[30rem] transition-all ease-in-out bg-transparent fixed left-0 bottom-0 shadow-lg ${
        isOpen ? "-translate-y-12" : "translate-y-96"
      }`}
    >
      <div className="sticky flex top-0 justify-between items-center px-3 py-2 2xl:px-4 2xl:py-3 bg-dark-blue text-white rounded-t-md font-semibold text-base 2xl:text-lg">
        <div className="pl-1.5">Content Menu</div>
        <img
          onClick={toggleBottomSheet}
          src="./assets/close_btn.svg"
          alt="close button"
          className="w-6 2xl:w-7 cursor-pointer"
        />
      </div>
      {/* content */}
      <div className="pt-2 pl-3 text-black pb-8 bg-[#F5F5F5] h-[71.5vh] xl:h-[76.5vh] 2xl:h-[75vh] overflow-y-scroll">
        {curriculum?.curriculum.map((lesson: any, i: number) => (
          <div key={i} className="text-sm pr-1.5">
            <p
              className={`py-2 pl-1 cursor-pointer truncate ${
                +params.lessonId === lesson.lesson_id ? "font-bold" : ""
              } 2xl:text-xl`}
              onClick={() => {
                if (openLesson === i) {
                  setOpenLesson(-1);
                } else {
                  setOpenLesson(i);
                }
              }}
            >
              {lesson.name}
            </p>
            {openLesson === i ? (
              lesson.chapters.map((chapter: any, index: number) => (
                <p
                  key={index}
                  className={`ml-4 pb-1.5 text-xs pr-1.5 cursor-pointer ${
                    chapter.material_id === +params.materialId
                      ? "font-bold"
                      : ""
                  } 2xl:text-lg `}
                  onClick={() => {
                    history.push(
                      `/theory/${curriculum.bundle_id}/${lesson.lesson_id}/${chapter.material_id}`
                    );
                  }}
                >
                  {chapter.name}
                </p>
              ))
            ) : (
              <></>
            )}
          </div>
        ))}
      </div>
      {/* footer */}
      <div className="h-8 2xl:h-10 bg-dark-blue rounded-b-md"></div>
    </div>
  ) : null;
};

export default BottomSheet;
