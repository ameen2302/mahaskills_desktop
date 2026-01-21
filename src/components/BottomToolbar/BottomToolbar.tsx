import React, { useEffect, useRef, useState } from "react";
import { Popover, Tooltip } from "antd";
import { useHistory, useParams } from "react-router-dom";
import BottomSheet from "../BottomSheet";
import { Chapter, Curriculum, Lesson } from "../../definitions/general";
import ZoomPopOver from "../ZoomPopOver";

interface BottomToolbarProps {
  handlePenToggle: () => void;
  curriculum: Curriculum | undefined;
  handleNoteToggle: () => void;
  handleZoomInEnableToogle: () => void;
  handleZoomOutEnableToogle: () => void;
  handleZoomReset: () => void;
  isDrawEnabled: boolean;
  isNoteEnable: boolean;
  isZoomInEnable: boolean;
  isZoomOutEnable: boolean;
  isPractical?: boolean;
  isToolbarDisabled?: boolean;
}

const BottomToolbar: React.FC<BottomToolbarProps> = ({
  handlePenToggle,
  curriculum,
  handleNoteToggle,
  handleZoomInEnableToogle,
  handleZoomOutEnableToogle,
  handleZoomReset,
  isDrawEnabled,
  isNoteEnable,
  isZoomInEnable,
  isZoomOutEnable,
  isPractical = false,
  isToolbarDisabled = false,
}) => {
  const history = useHistory();
  const params: { bundleId: string; lessonId: string; materialId: string } =
    useParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>();
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();
  const bottomSheetRef = useRef<any>();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // useEffect(() => {
  //   function handleClickOutside(event: any) {
  //     if (
  //       bottomSheetRef.current &&
  //       !bottomSheetRef.current.contains(event.target)
  //     ) {
  //       setIsOpen(false);
  //     }
  //   }
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  useEffect(() => {
    setSelectedLesson(
      curriculum?.curriculum.find(
        (lesson: Lesson) => +params.lessonId === lesson.lesson_id
      )
    );
  }, [params, curriculum]);

  useEffect(() => {
    setSelectedChapter(
      selectedLesson?.chapters.find(
        (chapter: Chapter) => +params.materialId === chapter.material_id
      )
    );
  }, [params, selectedLesson]);

  const getNextLesson = () => {
    return selectedLesson && curriculum?.curriculum[selectedLesson?.id];
  };

  const getPrevLesson = () => {
    return selectedLesson && curriculum?.curriculum[selectedLesson?.id - 2];
  };

  const handleGoToPrevChapter = () => {
    const prev = getPrevLesson();
    selectedLesson?.chapters.map((chapter: Chapter) =>
      selectedChapter &&
      +params.materialId !== +selectedLesson?.chapters[0].material_id
        ? history.push(
            `/${curriculum?.type === 0 ? "theory" : "practical"}/${
              curriculum?.bundle_id
            }/${selectedLesson?.lesson_id}/${
              selectedLesson?.chapters[selectedChapter.id - 2].material_id
            }`
          )
        : curriculum?.curriculum[0].id !== selectedLesson.id &&
          history.push(
            `/${curriculum?.type === 0 ? "theory" : "practical"}/${
              curriculum?.bundle_id
            }/${prev?.lesson_id}/${
              prev?.chapters[prev.chapters.length - 1].material_id
            }`
          )
    );
  };

  const handleGoToNextChapter = () => {
    const next = getNextLesson();
    selectedLesson?.chapters.map((chapter: Chapter) =>
      selectedChapter &&
      +params.materialId !==
        +selectedLesson?.chapters[selectedLesson?.chapters.length - 1]
          .material_id
        ? history.push(
            `/${curriculum?.type === 0 ? "theory" : "practical"}/${
              curriculum?.bundle_id
            }/${selectedLesson?.lesson_id}/${
              selectedLesson?.chapters[selectedChapter.id].material_id
            }`
          )
        : curriculum?.curriculum[curriculum.curriculum.length - 1].id !==
            selectedLesson.id &&
          history.push(
            `/${curriculum?.type === 0 ? "theory" : "practical"}/${
              curriculum?.bundle_id
            }/${next?.lesson_id}/${next?.chapters[0].material_id}`
          )
    );
  };

  return (
    <>
      <div className="flex justify-between bg-primary pl-4 py-[9px] 2xl:py-3 z-50">
        <div className="flex items-center">
          <div
            className={`flex items-center ${
              !isPractical ? "cursor-pointer" : "cursor-default"
            } mr-24 2xl:mr-32`}
            onClick={() => !isPractical && toggleDrawer()}
          >
            <img
              src="./assets/menu_icon.svg"
              alt="bookmark"
              className="mr-4 2xl:w-8"
            />
            <span className="ml-2 font-medium text-base 2xl:text-lg">
              Content Menu
            </span>
          </div>
          {!isPractical && (
            <Tooltip
              placement="top"
              title="Video Library"
              color="#403779"
              overlayInnerStyle={{ padding: "10px 30px", borderRadius: "3px" }}
            >
              <div
                className="toolbar-icon-container ml-16 cursor-pointer"
                onClick={() =>
                  history.push({
                    pathname: `/${
                      curriculum?.type === 0
                        ? "theoryVideos"
                        : "practicalVideos"
                    }/${params.bundleId}/${
                      curriculum?.curriculum[0].lesson_id
                    }`,
                  })
                }
              >
                <img src="./assets/video_library.svg" alt="video library" />
              </div>
            </Tooltip>
          )}

          <Tooltip
            placement="top"
            title="Notes"
            color="#403779"
            overlayInnerStyle={{ padding: "10px 30px", borderRadius: "3px" }}
          >
            <div
              className={`toolbar-icon-container mx-5 ${
                isToolbarDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => !isToolbarDisabled && handleNoteToggle()}
            >
              <img
                id="note-img"
                src="./assets/notes.svg"
                alt="notes"
                className={`${
                  isNoteEnable
                    ? "scale-90 origin-top ease-in-out duration-150"
                    : ""
                } ${isToolbarDisabled ? "opacity-30" : ""}`}
              />
              <div
                id={isNoteEnable ? "toolbar-point-show" : ""}
                className="toolbar-point"
              ></div>
            </div>
          </Tooltip>
          <Tooltip
            placement="top"
            title="Pen tool"
            color="#403779"
            overlayInnerStyle={{ padding: "10px 30px", borderRadius: "3px" }}
          >
            <div
              className={`toolbar-icon-container ${
                isToolbarDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <img
                onClick={() => !isToolbarDisabled && handlePenToggle()}
                src="./assets/pen.svg"
                alt="pen tool"
                className={`${
                  isDrawEnabled
                    ? "scale-90 origin-top ease-in-out duration-150"
                    : ""
                } ${isToolbarDisabled ? "opacity-30" : ""}`}
              />
              <div
                id={isDrawEnabled ? "toolbar-point-show" : ""}
                className="toolbar-point"
              ></div>
            </div>
          </Tooltip>
          <Popover
            content={
              !isToolbarDisabled ? (
                <ZoomPopOver
                  handleZoomInEnableToogle={handleZoomInEnableToogle}
                  handleZoomOutEnableToogle={handleZoomOutEnableToogle}
                  handleZoomReset={handleZoomReset}
                />
              ) : (
                <div className="text-white">Zoom controls</div>
              )
            }
            color="#403779"
          >
            <div
              className={`toolbar-icon-container ml-5 ${
                isToolbarDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <img
                src="./assets/aspect.svg"
                alt="aspect ratio"
                className={`${
                  isZoomInEnable || isZoomOutEnable
                    ? "scale-90 origin-top ease-in-out duration-150"
                    : ""
                } ${isToolbarDisabled ? "opacity-30" : ""}`}
              />
              <div
                id={
                  isZoomInEnable || isZoomOutEnable ? "toolbar-point-show" : ""
                }
                className="toolbar-point"
                style={{ bottom: "-10px" }}
              ></div>
            </div>
          </Popover>
        </div>
        <div className="flex mr-4">
          <button
            className={`${
              curriculum?.curriculum[0].id === selectedLesson?.id &&
              selectedChapter &&
              selectedChapter.id === 1
                ? "bg-gray-400"
                : "bg-gradient-to-t from-dark-red to-light-red"
            } text-white w-20 xl:w-28 py-1 mx-3 rounded-2xl font-medium 2xl:text-base 2xl:mx-6`}
            onClick={handleGoToPrevChapter}
            disabled={
              curriculum?.curriculum[0].id === selectedLesson?.id &&
              selectedChapter &&
              selectedChapter.id === 1
            }
          >
            Previous
          </button>
          <button
            className={`${
              selectedLesson &&
              curriculum?.curriculum[curriculum.curriculum.length - 1]
                .lesson_id === selectedLesson.lesson_id &&
              selectedChapter &&
              selectedChapter.id ===
                selectedLesson.chapters[selectedLesson.chapters.length - 1].id
                ? "bg-gray-400"
                : "bg-gradient-to-t from-dark-red to-light-red"
            } text-white w-20 xl:w-28 py-1 rounded-2xl font-medium 2xl:text-base`}
            onClick={handleGoToNextChapter}
            disabled={
              selectedLesson &&
              curriculum?.curriculum[curriculum.curriculum.length - 1]
                .lesson_id === selectedLesson.lesson_id &&
              selectedChapter &&
              selectedChapter.id ===
                selectedLesson.chapters[selectedLesson.chapters.length - 1].id
            }
          >
            Next
          </button>
        </div>
      </div>
      <div ref={bottomSheetRef}>
        <BottomSheet
          isOpen={isOpen}
          toggleBottomSheet={toggleDrawer}
          curriculum={curriculum}
        />
      </div>
    </>
  );
};

export default BottomToolbar;
