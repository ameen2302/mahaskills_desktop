import React, { useEffect, useState } from "react";
import BottomToolbar from "../../components/BottomToolbar";
import CourseHeader from "../../components/CourseHeader";
import VideoSidebar from "../../components/VideoSidebar";
import { message, Popover, Spin } from "antd";
import { CourseDataManager } from "../../store/courses/datamanager";
import { useHistory, useParams } from "react-router-dom";
import {
  Bookmark,
  Chapter,
  Curriculum,
  Lesson,
} from "../../definitions/general";
import PDFViewer from "../../components/PDFViewer";
import { BookmarkPopover } from "../../components/BookmarkPopover";
import { IndexedDBService } from "../../store/courses/indexedDBService";
import BookmarkModal from "../../components/BookmarkModal";
import AssessmentViewer from "../../components/HTMLViewer";
declare const window: any;

interface CourseModulePageProps {}

const CourseModulePage: React.FC<CourseModulePageProps> = () => {
  const history = useHistory();
  const indexedDBService = new IndexedDBService();
  const params: { bundleId: string; lessonId: string; materialId: string } =
    useParams();
  const [isDrawEnabled, setIsDrawEnabled] = useState<boolean>(false);
  const [curriculum, setCurriculum] = useState<Curriculum | undefined>();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>();
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();
  const [isNoteEnable, setisNoteEnable] = useState<boolean>(false);
  const [isZoomInEnable, setisZoomInEnable] = useState(false);
  const [isZoomOutEnable, setisZoomOutEnable] = useState(false);
  const [bookmarksDB, setbookmarksDB] = useState<Bookmark[]>();
  const [isBookmarkViewEnable, setisBookmarkViewEnable] = useState(false);
  const [pdf, setPdf] = useState<string>("");
  const [language, setLanguage] = useState<string | any>(
    localStorage.getItem(`${params?.bundleId}_lang`) || "english"
  );

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      history.push("/");
    }
    indexedDBService.getAllBookmarks().then((bookmarks) => {
      setbookmarksDB(bookmarks as Bookmark[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dm = new CourseDataManager();
    dm.getCurriculumByBundleId(+params.bundleId).then((cr) => {
      setCurriculum(cr);
    });
  }, [params.bundleId, params.materialId]);

  useEffect(() => {
    const sl = curriculum?.curriculum.find(
      (lesson: Lesson) => +params.lessonId === lesson.lesson_id
    );
    setSelectedLesson(sl);
    const sc = sl?.chapters.find(
      (chapter: Chapter) => +params.materialId === chapter.material_id
    );
    setSelectedChapter(sc);
  }, [curriculum, params]);

  useEffect(() => {
    if (selectedChapter) {
      // setPdf("");
      window.api.requestPdfContent(
        `${selectedChapter?.language_resources[language].pdf_src}`
      );
      window.api.receivePdfContent((data: any) => {
        if (data) {
          setPdf(data);
        }
      });
    }
  }, [language, selectedChapter]);

  // useEffect(() => {
  //   function rel() {
  //     window.location.reload();
  //   }
  //   window.addEventListener("resize", rel);

  //   return () => {
  //     window.removeEventListener("resize", rel);
  //   };
  // });

  const handleNoteToggle = () => {
    const containerEle = document.getElementsByClassName(`canvas-container`);
    if (
      // @ts-ignore
      !containerEle[1]?.style?.zoom ||
      // @ts-ignore
      Number(containerEle[1]?.style?.zoom.split("%")[0]) === 100
    ) {
      setisNoteEnable((prev) => !prev);
      setIsDrawEnabled(false);
      setisZoomInEnable(false);
      setisZoomOutEnable(false);
    } else {
      message.error("Reset zoom to use Notes");
    }
  };

  const handlePenToggle = () => {
    const containerEle = document.getElementsByClassName(`canvas-container`);
    if (
      // @ts-ignore
      !containerEle[1]?.style?.zoom ||
      // @ts-ignore
      Number(containerEle[1]?.style?.zoom.split("%")[0]) === 100
    ) {
      setIsDrawEnabled((prev) => !prev);
      setisNoteEnable(false);
      setisZoomInEnable(false);
      setisZoomOutEnable(false);
    } else {
      message.error("Reset zoom to use pen tool");
    }
  };

  const handleZoomInEnableToogle = () => {
    setisZoomInEnable((prev) => !prev);
    setIsDrawEnabled(false);
    setisNoteEnable(false);
    setisZoomOutEnable(false);
  };

  const handleZoomOutEnableToogle = () => {
    setisZoomOutEnable((prev) => !prev);
    setIsDrawEnabled(false);
    setisNoteEnable(false);
    setisZoomInEnable(false);
  };

  const handleZoomReset = () => {
    const containerEle = document.getElementsByClassName(`canvas-container`);
    for (let index = 0; index < containerEle.length; index++) {
      // @ts-ignore
      containerEle[index].style.zoom = "100%";
    }
    setisZoomInEnable(false);
    setisZoomOutEnable(false);
  };

  const handleBookmarkView = () => {
    indexedDBService.getAllBookmarks().then((bookmarks) => {
      setbookmarksDB(bookmarks as Bookmark[]);
      setisBookmarkViewEnable(true);
    });
  };

  const handleBookmarkViewClose = () => {
    setisBookmarkViewEnable(false);
  };

  const handleBookmarkAdd = () => {
    const bookmarkExist = bookmarksDB?.filter(
      (item) => Number(item.materialId) === selectedChapter?.material_id
    );
    if (bookmarkExist?.length) {
      message.error("This chapter is already bookmarked");
    } else {
      indexedDBService.addBookmarkInDB(
        selectedChapter,
        params,
        curriculum?.type || 0
      );
      indexedDBService.getAllBookmarks().then((bookmarks) => {
        setbookmarksDB(bookmarks as Bookmark[]);
        message.success("Bookmark added successfully");
      });
    }
  };

  const handleBookmarkDelete = (id: number | undefined) => {
    if (id) {
      indexedDBService.deleteBookmarkById(id).then(() => {
        handleBookmarkView();
        message.success("Bookmark successfully deleted.");
      });
    }
  };

  const VideoSidebarMemoized = React.useCallback(
    () => (
      <VideoSidebar
        data={selectedChapter?.language_resources}
        language={language}
      />
    ),
    [selectedChapter, language]
  );

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex">
        <CourseHeader title={selectedLesson?.name || ""} />
      </div>
      <div className="flex h-auto">
        <div className="w-[70%]">
          <div className="flex justify-between pl-20 py-2 bg-custom-gray items-center 2xl:py-4 2xl:pl-24">
            <span className="2xl:text-lg text-lg font-semibold">
              {selectedChapter?.name || ""}
            </span>
            <div className="flex justify-between mr-8 2xl:mr-12">
              <Popover
                placement="bottom"
                content={
                  <BookmarkPopover
                    handleBookmarkView={handleBookmarkView}
                    handleBookmarkAdd={handleBookmarkAdd}
                  />
                }
                color="#403779"
              >
                <img
                  src="./assets/bookmark.svg"
                  alt="bookmark"
                  className="mr-6 2xl:mr-10 cursor-pointer 2xl:w-6"
                />
              </Popover>
              <select
                className="text-white bg-btn-green px-3 py-0.5 rounded-2xl font-bold 2xl:text-base appearance-none outline-none cursor-pointer text-center"
                onChange={(e) => {
                  setLanguage(e.target.value);
                  localStorage.setItem(
                    `${params?.bundleId}_lang`,
                    e.target.value
                  );
                }}
                value={language || "english"}
              >
                {curriculum &&
                  Object.keys(
                    curriculum.curriculum[0].chapters[0].language_resources
                  ).map((lang: string, i: number) => (
                    <option value={lang} key={i}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div
            className={`bg-white relative ${
              selectedChapter?.isAssessment
                ? "overflow-hidden"
                : "overflow-y-scroll"
            }`}
            style={{
              height: `${
                pdf.includes(";base64")
                  ? window.innerWidth < 1920
                    ? "calc(100vh - 140px)"
                    : "calc(100vh - 190px)"
                  : "100vh"
              }`,
            }}
          >
            {pdf && pdf !== "" ? (
              selectedChapter?.isAssessment ? (
                <AssessmentViewer base64Src={pdf} />
              ) : (
                pdf.includes(";base64") && (
                  <PDFViewer
                    pdfData={pdf.split(";base64,")[1]}
                    isNoteEnable={isNoteEnable}
                    isDrawEnabled={isDrawEnabled}
                    setisNoteEnable={setisNoteEnable}
                    isZoomInEnable={isZoomInEnable}
                    isZoomOutEnable={isZoomOutEnable}
                  />
                )
              )
            ) : (
              <div className="h-[87vh] w-full flex justify-center items-center">
                <Spin spinning={true} size="large"></Spin>
              </div>
            )}
          </div>
          <div className="fixed bottom-0 w-[70%] text-white">
            <BottomToolbar
              handlePenToggle={handlePenToggle}
              curriculum={curriculum}
              handleNoteToggle={handleNoteToggle}
              handleZoomInEnableToogle={handleZoomInEnableToogle}
              handleZoomOutEnableToogle={handleZoomOutEnableToogle}
              handleZoomReset={handleZoomReset}
              isDrawEnabled={isDrawEnabled}
              isNoteEnable={isNoteEnable}
              isZoomInEnable={isZoomInEnable}
              isZoomOutEnable={isZoomOutEnable}
              isToolbarDisabled={selectedChapter?.isAssessment}
            />
          </div>
        </div>
        <div className="w-[30%] pl-1">
          {selectedChapter && <VideoSidebarMemoized />}
        </div>
        <BookmarkModal
          bookmarks={bookmarksDB}
          isOpen={isBookmarkViewEnable}
          handleClose={handleBookmarkViewClose}
          handleBookmarkDelete={handleBookmarkDelete}
        />
      </div>
    </div>
  );
};

export default CourseModulePage;
