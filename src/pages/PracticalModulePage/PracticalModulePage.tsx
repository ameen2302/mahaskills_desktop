import { message, Popover, Spin } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import BookmarkModal from "../../components/BookmarkModal";
import { BookmarkPopover } from "../../components/BookmarkPopover";
import BottomToolbar from "../../components/BottomToolbar";
import CollapseMenu from "../../components/CollapseMenu";
import CourseHeader from "../../components/CourseHeader";
import AssessmentViewer from "../../components/HTMLViewer";
import PDFViewer from "../../components/PDFViewer";
import Tabs from "../../components/Tabs";
import {
  Bookmark,
  Chapter,
  Curriculum,
  Lesson,
} from "../../definitions/general";
import { CourseDataManager } from "../../store/courses/datamanager";
import { IndexedDBService } from "../../store/courses/indexedDBService";
declare const window: any;

interface PracticalModulePageProps {}

const PracticalModulePage: React.FC<PracticalModulePageProps> = () => {
  const history = useHistory();
  const indexedDBService = new IndexedDBService();
  const params: { bundleId: string; lessonId: string; materialId: string } =
    useParams();
  const [curriculum, setCurriculum] = useState<Curriculum | undefined>();
  const [isNoteEnable, setisNoteEnable] = useState<boolean>(false);
  const [isDrawEnabled, setIsDrawEnabled] = useState<boolean>(false);
  const [isZoomInEnable, setisZoomInEnable] = useState(false);
  const [isZoomOutEnable, setisZoomOutEnable] = useState(false);
  const [language, setLanguage] = useState<string | any>(
    localStorage.getItem(`${params?.bundleId}_lang`) || "english"
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson>();
  const [selectedChapter, setSelectedChapter] = useState<Chapter>();
  const [isBookmarkViewEnable, setisBookmarkViewEnable] = useState(false);
  const [bookmarksDB, setbookmarksDB] = useState<Bookmark[]>();
  const [content, setContent] = useState<any>();
  const [currentTab, setCurrentTab] = useState<number>(0);
  const videoRef = useRef<any>();

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
      setContent("");
      window.api.requestContent(
        `${selectedChapter?.tabs[currentTab].language_resources[language].src}`
      );
      window.api.receiveContent((data: any) => {
        if (data) {
          setContent(data);
        }
      });
    }
  }, [language, selectedChapter, currentTab]);

  const formattedTabData = useMemo(() => {
    let result: {
      title: string;
      indexAt?: number;
      //holds the tab index from actual selectedChapter.tabs array
      //because in case of procedure it will be changed
      children?: { title: string; indexAt: number }[];
    }[] = [];
    const withoutProcedure = [
      "Objective",
      "Requirements",
      "Skill Information",
      "Assessment",
    ];
    let procedureCount = selectedChapter?.tabs.filter(
      (d: any) => !withoutProcedure.includes(d?.name)
    ).length;
    selectedChapter?.tabs?.forEach((d: any, index: number) => {
      if (!withoutProcedure.includes(d?.name) && procedureCount > 0) {
        let temp = result?.findIndex((f) => f?.title === "Procedure");
        if (temp === -1) {
          result.push({
            title: "Procedure",
            children: [{ title: d?.name, indexAt: index }],
          });
        } else {
          result[temp].children?.push({ title: d?.name, indexAt: index });
        }
      } else {
        result.push({ title: d?.name, indexAt: index });
      }
    });
    return result;
  }, [selectedChapter]);

  // useEffect(() => {
  //   if (content.includes("html")) {
  //     let parser = new DOMParser();
  //     let htmlDoc = parser.parseFromString(content, "text/html");
  //     let body = htmlDoc.getElementsByTagName("body")[0];
  //     setAssessmentHtml(body.innerHTML);
  //     let scripts = body.getElementsByTagName("script");
  //     let scriptElement = document.createElement("script");
  //     scriptElement.type = "text/javascript";
  //     for (let i = 0; i < scripts.length; i++) {
  //       let script = scripts[i].innerHTML;
  //       scriptElement.text += script;
  //     }
  //     document.head.appendChild(scriptElement);
  //   }
  // }, [content]);

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
      message.error("This exercise is already bookmarked");
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
  useEffect(() => {
    setCurrentTab(0);
  }, [params.materialId]);

  return (
    <div className="h-screen overflow-hidden flex gap-2">
      <div className="h-full w-[25%] shadow">
        <div className="text-center">
          <img
            src="./assets/practical_header_icon.jpg"
            alt="logo"
            className="w-96 py-1 sm:w-[300px] 4xl:w-[410px] sm:py-1 xl:py-0 inline-flex 2xl:py-2"
          ></img>
        </div>
        <p className="font-bold bg-primary text-white py-3 text-center 4xl:py-5">
          {curriculum?.bundle_name.split("_").join(" ")}
        </p>
        <p className="font-semibold bg-dark-blue text-white py-1.5 my-px text-center 4xl:py-4">
          Content Menu
        </p>
        <div
          className="pl-3 text-black bg-[#F5F5F5] overflow-y-scroll"
          style={{
            height: `${
              window.innerWidth < 1920
                ? "calc(100vh - 175px)"
                : "calc(100vh - 254px)"
            }`,
          }}
        >
          <CollapseMenu data={curriculum?.curriculum} />
        </div>
      </div>
      <div className="w-[75%] shadow">
        <CourseHeader title={selectedLesson?.name || ""} isPractical={true} />
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
              value={language}
            >
              {curriculum &&
                Object.keys(
                  curriculum.curriculum[0].chapters[0].tabs[0]
                    .language_resources
                ).map((lang: string, i: number) => (
                  <option value={lang} key={i}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
            </select>
          </div>
        </div>
        {/* Tabs */}
        <Tabs
          onChange={(index: number) => setCurrentTab(index)}
          items={formattedTabData}
          activeTabIndex={currentTab}
        />
        <div
          className={`relative pb-32 ${
            content && content.startsWith("data:video/mp4")
              ? "overflow-hidden"
              : "overflow-auto"
          }`}
          style={{
            height: `${
              content && content.startsWith("data:video/mp4")
                ? window.innerWidth < 1920
                  ? "calc(100% - 50px)"
                  : "calc(100% - 105px)"
                : "100%"
            }`,
          }}
        >
          {content ? (
            content?.startsWith("data:video/mp4") ? (
              <video
                className="!h-full"
                // autoPlay
                controls
                height="100%"
                width="100%"
                controlsList="nodownload"
                src={content}
                ref={videoRef}
              />
            ) : content?.startsWith("data:application/pdf") ? (
              <PDFViewer
                pdfData={content?.split(";base64,")[1]}
                isNoteEnable={isNoteEnable}
                isDrawEnabled={isDrawEnabled}
                setisNoteEnable={setisNoteEnable}
                isZoomInEnable={isZoomInEnable}
                isZoomOutEnable={isZoomOutEnable}
              />
            ) : (
              // content?.startsWith("<!doctype") && (
              <AssessmentViewer base64Src={content} />
              // )
            )
          ) : (
            <div className="absolute top-[35%] left-[50%]">
              <Spin size="large" />
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 w-full text-white z-50">
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
          isPractical
          isToolbarDisabled={
            content?.startsWith("data:video/mp4") ||
            content?.startsWith("<!doctype")
          }
        />
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

export default PracticalModulePage;
