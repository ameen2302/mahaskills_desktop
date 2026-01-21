import axios from "axios";
import { GeneralObject } from "../../definitions/general";
import { ApiService } from "./apiService";
import { IndexedDBService } from "./indexedDBService";
declare const window: any;

export class CourseDataManager {
  private coursesService: ApiService;
  private indexedDBService: IndexedDBService;

  constructor() {
    this.coursesService = new ApiService();
    this.indexedDBService = new IndexedDBService();
    this.indexedDBService.createDatabase();
  }

  getAllCoursesFromDb = async () => {
    let coursesResponse: any = null;
    coursesResponse = await this.indexedDBService.getAllCoursesFromDB();
    if (Object.keys(coursesResponse).length >= 1) {
      return coursesResponse;
    }
    return coursesResponse;
  };

  getPracticalStructure = async (course: any, bundle: GeneralObject) => {
    let courseData: any;
    const course_id = +bundle?.find(
      (b: any) => b.bundle_id === course.bundle_id
    ).course_ids[0];
    const curriculum = await this.coursesService.getCurriculum(course_id);
    if (curriculum) {
      const courseCurriculum: any[] = [];
      curriculum.course_curriculum?.resources.forEach(
        (lesson: any, i: number) => {
          let lessonsObj: any = { chapters: [] };
          lessonsObj.id = i + 1;
          lessonsObj.lesson_id = lesson.section_id;
          lessonsObj.name = lesson.section_name;
          lesson.resources &&
            lesson.resources.forEach(async (chapter: any, i: number) => {
              let chapterObj: any = {};
              chapterObj.id = i + 1;
              chapterObj.tabs = {};
              chapterObj.name = chapter.material_name;
              chapterObj.material_id = chapter.material_id;
              chapter.material_id && lessonsObj.chapters.push(chapterObj);
            });
          courseCurriculum.push(lessonsObj);
        }
      );
      courseData = {
        bundle_id: course.bundle_id,
        bundle_name: course.bundle_name,
        img_url: bundle?.filter((b: any) => b.bundle_id === course.bundle_id)[0]
          .img_url,
        type: 1, //practical
        curriculum: courseCurriculum,
        is_downloaded: false,
        is_installed: false,
      };
    }
    return courseData;
  };

  getTheoryStructure = async (course: any, bundle: GeneralObject) => {
    let courseData: any;
    const course_id = +bundle?.find(
      (b: any) => b.bundle_id === course.bundle_id
    ).course_ids[0];
    const curriculum = await this.coursesService.getCurriculum(course_id);
    if (curriculum) {
      const courseCurriculum: any[] = [];
      curriculum.course_curriculum?.resources.forEach(
        (lesson: any, i: number) => {
          let lessonsObj: any = { chapters: [] };
          lessonsObj.id = i + 1;
          lessonsObj.lesson_id = lesson.section_id;
          lessonsObj.name = lesson.section_name;
          lesson.resources &&
            lesson.resources.forEach(async (chapter: any, i: number) => {
              let chapterObj: any = {};
              chapterObj.language_resources = {};
              chapterObj.id = i + 1;
              chapterObj.name = chapter.material_name;
              chapterObj.material_id = chapter.material_id;
              chapter.material_id && lessonsObj.chapters.push(chapterObj);
            });
          lessonsObj.name && courseCurriculum.push(lessonsObj);
        }
      );
      courseData = {
        bundle_id: course.bundle_id,
        bundle_name: course.bundle_name,
        img_url: bundle?.filter((b: any) => b.bundle_id === course.bundle_id)[0]
          .img_url,
        type: 0, //theory
        curriculum: courseCurriculum,
        is_downloaded: false,
        is_installed: false,
      };
    }
    // courses.push(courseData);
    // await this.indexedDBService.addCoursesInDB(courses);
    // coursesResponse = await this.indexedDBService.getAllCoursesFromDB();
    return courseData;
  };

  getAllCoursesFromApi = async () => {
    let coursesResponse: any = null;
    let courses;
    coursesResponse = await this.coursesService.getAllCourses();
    if (coursesResponse) {
      const bundles = await this.coursesService.getBundles();

      coursesResponse.courses.forEach(async (c: any, i: number) => {
        c.tags[0].value[0] === "Practical"
          ? (courses = await this.getPracticalStructure(c, bundles.bundle))
          : (courses = await this.getTheoryStructure(c, bundles.bundle));

        await this.indexedDBService.addCoursesInDB(courses);
      });
      if (coursesResponse) {
        return await coursesResponse;
      }
    }
  };

  markAsDownloaded = (id: number) => {
    this.indexedDBService.markAsDownloaded(id);
  };

  markAsInstalled = (id: number) => {
    this.indexedDBService.markAsInstalled(id);
  };

  getCurriculumByBundleId = async (id: number) => {
    return await this.indexedDBService
      .getCurriculumByBundleId(id)
      .then((res: any) => res);
  };

  getMaterialById = async (id: number) => {
    return await this.coursesService
      .getResource(id)
      .then((res: any) => res.material);
  };

  updateCurriculum = (id: number, curr: any) => {
    this.indexedDBService.updateCurriculum(id, curr);
  };

  downloadPracticalCourse = async (
    bundleId: number,
    id: number,
    updateProgress: Function,
    cancelToken: any
  ) => {
    await window.api.makeDir(bundleId);
    const curriculum: any = await this.indexedDBService.getCurriculumByBundleId(
      bundleId
    );

    let count = 0;
    if (curriculum.img_url.startsWith("https")) {
      let courseImgFilename = `${bundleId}/${bundleId}.le`;
      const courseImgD = await axios
        .get(`${curriculum.img_url}`, {
          responseType: "blob",
          cancelToken,
        })
        .catch((e) => console.log("Error from practical course image", e));
      const courseImgPromise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(courseImgD?.data);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      const courseImgResult = await courseImgPromise;
      await window.api.saveFile(`/${courseImgFilename}`, courseImgResult);
      curriculum.img_url = `/${courseImgFilename}`;
    }

    for (let { chapters, lesson_id } of curriculum.curriculum) {
      for (let chapter of chapters) {
        try {
          await this.downloadExercise(
            chapter,
            bundleId,
            lesson_id,
            cancelToken
          );
          count = count + 1;
          updateProgress(count);
        } catch (e) {
          console.log(e);
        }
      }
    }

    this.indexedDBService.updateCurriculum(bundleId, curriculum);
    this.markAsDownloaded(id);

    return curriculum;
  };

  downloadTheoryCourse = async (
    bundleId: number,
    id: number,
    updateProgress: Function,
    cancelToken: any
  ) => {
    await window.api.makeDir(bundleId);
    const curriculum: any = await this.indexedDBService.getCurriculumByBundleId(
      bundleId
    );

    let count = 0;
    if (curriculum.img_url.startsWith("https")) {
      let courseImgFilename = `${bundleId}/${bundleId}.le`;
      const courseImgD = await axios
        .get(`${curriculum.img_url}`, {
          responseType: "blob",
          cancelToken,
        })
        .catch((e) => console.log("Error from theory course image", e));
      const courseImgPromise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(courseImgD?.data);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      const courseImgResult = await courseImgPromise;
      await window.api.saveFile(`/${courseImgFilename}`, courseImgResult);
      curriculum.img_url = `/${courseImgFilename}`;
    }

    for (let { chapters, lesson_id } of curriculum.curriculum) {
      for (let chapter of chapters) {
        try {
          await this.downloadChapter(chapter, bundleId, lesson_id, cancelToken);
          count = count + 1;
          updateProgress(count);
        } catch (e) {
          console.log(e);
        }
      }
    }
    this.indexedDBService.updateCurriculum(bundleId, curriculum);
    this.markAsDownloaded(id);

    return curriculum;
  };

  async downloadChapter(
    chapter: any,
    bundleId: any,
    lesson_id: any,
    cancelToken: any
  ): Promise<void> {
    return new Promise((resolve, reject) =>
      this.coursesService.getResource(chapter.material_id).then((res) => {
        this.loadChapter(
          bundleId,
          lesson_id,
          chapter.material_id,
          res,
          cancelToken
        ).then(({ languageResources, isAssessment }) => {
          chapter.isAssessment = isAssessment;
          chapter.language_resources = languageResources;
          resolve();
        });
      })
    );
  }

  async downloadExercise(
    chapter: any,
    bundleId: any,
    lesson_id: any,
    cancelToken: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.coursesService.getResource(chapter.material_id).then((res) => {
        this.loadExercise(
          bundleId,
          lesson_id,
          chapter.material_id,
          res,
          cancelToken
        ).then((languageResources) => {
          chapter.tabs = languageResources;
          resolve();
        });
      });
    });
  }

  async loadExercise(
    bundleId: number,
    lesson_id: number,
    material_id: number,
    res: any,
    cancelToken: any
  ) {
    // html parsing
    const html_src = res.material.html_text.split('src="')[1].split(".html")[0];
    const resp = await axios
      .get(`${html_src}.html`, {
        cancelToken,
      })
      .catch((e) => console.log("Error from practical html ", e));
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(resp?.data, "text/html");
    let languageObj = htmlDoc
      .getElementById("resourceObj")
      ?.innerHTML?.split("= ")[1] as string;
    languageObj = languageObj.replaceAll(/,+[\s\t]*,+/g, ",");
    if (languageObj.includes(",]")) {
      languageObj = languageObj.replace(",]", "]");
    }
    const promises = [] as Promise<void>[];
    const resourceObj = JSON.parse(languageObj);

    //loop through and download
    resourceObj.forEach(async (obj: any, index: number) => {
      const func = async (obj: GeneralObject, index: number) => {
        for (const [key, value] of Object.entries(
          obj.language_resources as object
        )) {
          //Assessment htmls download
          if (obj.name === "Assessment") {
            const html = value.src;
            const htmlD = await axios
              .get(`${html}`, { responseType: "text", cancelToken })
              .catch((e) =>
                console.log("Error from practical assessment html", e)
              );
            if (htmlD) {
              const srcFilename = `${bundleId}/${lesson_id}_${material_id}_${
                index + 1
              }_${key}.le`;
              value.src = `/${srcFilename}`;
              await window.api.saveFile(`/${srcFilename}`, htmlD.data);
            }

            //procedure videos with duration
          } else if (
            obj.name !== "Objective" &&
            obj.name !== "Requirements" &&
            obj.name !== "Skill Information" &&
            obj.name !== "Assessment"
          ) {
            let proc = "";
            if (value.src.includes("pdfjs")) {
              let sp = value.src.split("/pdfjs/web/viewer.html?file=");
              proc = sp.join("").split("&embedded")[0];
            } else {
              proc = value.src;
            }
            const procD = await axios
              .get(`${proc}`, { responseType: "blob", cancelToken })
              .catch((e) =>
                console.log("Error from practical procedure videos", e)
              );

            const procFilename = `${bundleId}/${lesson_id}_${material_id}_${
              index + 1
            }_${key}.le`;
            const procPromise = new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(procD?.data);
              reader.onload = () => resolve(reader.result);
              reader.onerror = (error) => reject(error);
            });
            const procResult = (await procPromise) as string;
            value.src = `/${procFilename}`;
            await window.api.saveFile(`/${procFilename}`, procResult);

            const vid = document.createElement("video");
            vid.src = procResult;

            await new Promise((resolve, reject) => {
              vid.ondurationchange = function () {
                value.duration = vid.duration;
                resolve(1);
              };
            });

            //procedure thumbnails
            if (value.thumbnail) {
              const thumb = value.thumbnail;
              let imgFilename = `${bundleId}/${lesson_id}_${material_id}_${
                index + 1
              }_${key}_thumb.le`;
              const imgD = await axios
                .get(`${thumb}`, {
                  responseType: "blob",
                  cancelToken,
                })
                .catch((e) =>
                  console.log(
                    "Error from practical procedure video thumbnails",
                    e
                  )
                );
              const imgPromise = new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(imgD?.data);
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
              });
              const imgResult = await imgPromise;
              await window.api.saveFile(`/${imgFilename}`, imgResult);
              value.thumbnail = `/${imgFilename}`;
            }
          } else {
            let src = "";
            if (value.src.includes("pdfjs")) {
              let sp = value.src.split("/pdfjs/web/viewer.html?file=");
              src = sp.join("").split("&embedded")[0];
            } else {
              src = value.src;
            }

            const srcD = await axios
              .get(`${src}`, { responseType: "blob", cancelToken })
              .catch((e) =>
                console.log("Error from practical skill information pdf", e)
              );
            if (srcD) {
              const srcFilename = `${bundleId}/${lesson_id}_${material_id}_${
                index + 1
              }_${key}.le`;
              const srcPromise = new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(srcD.data);
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
              });
              const srcResult = await srcPromise;
              value.src = `/${srcFilename}`;
              await window.api.saveFile(`/${srcFilename}`, srcResult);
            }
          }
        }
      };

      promises.push(func(obj, index));
    });
    await Promise.all(promises);
    return resourceObj;
  }

  async loadChapter(
    bundleId: number,
    lesson_id: number,
    material_id: number,
    res: Record<string, any>,
    cancelToken: any
  ): Promise<Record<string, any>> {
    const html_src = res.material.html_text.split('src="')[1].split(".html")[0];
    const resp = await axios
      .get(`${html_src}.html`, {
        cancelToken,
      })
      .catch((e) => console.log("Error from theory chapter html", e));
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(resp?.data, "text/html");
    let languageObj = htmlDoc.getElementById("resourceObj")?.innerHTML;
    const promises = [] as Promise<void>[];
    const resourceObj = JSON.parse(`${languageObj?.split("= ")[1]}`);
    //create folders for pdf, images and videos seperately inside course parent folder
    await window.api.makeDir(`${bundleId}/vid`);
    await window.api.makeDir(`${bundleId}/thumb`);
    await window.api.makeDir(`${bundleId}/pdf`);
    const resObj = resourceObj.data ? resourceObj.data : resourceObj;

    for (const [key, value] of Object.entries(resObj as object)) {
      // pdf
      let pdf = "";
      if (resourceObj.isAssessment) {
        const assessmentHtml = value.pdf_src;
        const assessmentHtmlD = await axios
          .get(`${assessmentHtml}`, {
            responseType: "text",
            cancelToken,
          })
          .catch((e) => console.log("Error from theory assessment html", e));
        if (assessmentHtmlD) {
          const srcFilename = `${bundleId}/pdf/${lesson_id}_${material_id}_${key}.le`;
          value.pdf_src = `/${srcFilename}`;
          await window.api.saveFile(`/${srcFilename}`, assessmentHtmlD.data);
        }
      } else {
        if (value.pdf_src.includes("pdfjs")) {
          let sp = value.pdf_src.split("/pdfjs/web/viewer.html?file=");
          pdf = sp.join("").split("&embedded")[0];
        } else {
          pdf = value.pdf_src;
        }
        const pdfD = await axios
          .get(`${pdf}`, {
            responseType: "blob",
            cancelToken,
          })
          .catch((e) => console.log("Error from theory pdf", e));
        if (pdfD) {
          let pdfFilename = `${bundleId}/pdf/${lesson_id}_${material_id}_${key}.le`;
          const pdfPromise = new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(pdfD.data);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });
          const pdfResult = await pdfPromise;
          value.pdf_src = `/${pdfFilename}`;
          await window.api.saveFile(`/${pdfFilename}`, pdfResult);
        }

        await value.videos.map(async (video: any, i: number) => {
          const func = async (video: any, i: number) => {
            let vidFilename = `${bundleId}/vid/${lesson_id}_${material_id}_${
              i + 1
            }_${key}.le`;
            const vidD = await axios
              .get(`${video.vid_src}`, {
                responseType: "blob",
                cancelToken,
              })
              .catch((e) => console.log("Error from theory videos", e));
            const vid = document.createElement("video");

            const vidPromise = new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(vidD?.data);
              reader.onload = () => resolve(reader.result);
              reader.onerror = (error) => reject(error);
            });

            const vidResult = (await vidPromise) as string;
            vid.src = vidResult;
            await new Promise((resolve, reject) => {
              vid.ondurationchange = function () {
                video.duration = vid.duration;
                resolve(1);
              };
            });

            await window.api.saveFile(`/${vidFilename}`, vidResult);
            video.vid_src = `/${vidFilename}`;

            // image
            let imgFilename = `${bundleId}/thumb/${lesson_id}_${material_id}_${
              i + 1
            }_${key}.le`;
            const imgD = await axios
              .get(`${video.vid_thumb}`, {
                responseType: "blob",
                cancelToken,
              })
              .catch((e) =>
                console.log("Error from theory video thumbnails", e)
              );
            const imgPromise = new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(imgD?.data);
              reader.onload = () => resolve(reader.result);
              reader.onerror = (error) => reject(error);
            });
            const imgResult = await imgPromise;
            await window.api.saveFile(`/${imgFilename}`, imgResult);
            video.vid_thumb = `/${imgFilename}`;
          };
          promises.push(func(video, i));
        });
      }
    }
    await Promise.all(promises);
    return {
      languageResources: resObj,
      isAssessment: resourceObj.isAssessment,
    };
  }

  encryptTheoryCourse = async (
    bundleId: number,
    updateProgress: Function,
    cancelToken: any
  ) => {
    await window.api.makeDir(bundleId);
    const curriculum: any = await this.indexedDBService.getCurriculumByBundleId(
      bundleId
    );

    let count = 0;
    if (curriculum.img_url.startsWith("https")) {
      let courseImgFilename = `${bundleId}/${bundleId}.le`;
      const courseImgD = await axios
        .get(`${curriculum.img_url}`, {
          responseType: "blob",
          cancelToken,
        })
        .catch((e) => console.log("Error from theory course image", e));
      const courseImgPromise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(courseImgD?.data);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      const courseImgResult = await courseImgPromise;
      await window.api.saveFile(`/${courseImgFilename}`, courseImgResult);
      curriculum.img_url = `/${courseImgFilename}`;
    }

    for (let { chapters, lesson_id } of curriculum.curriculum) {
      for (let chapter of chapters) {
        try {
          await this.downloadChapter(chapter, bundleId, lesson_id, cancelToken);
          count = count + 1;
          updateProgress(count);
        } catch (e) {
          console.log(e);
        }
      }
    }
    // this.indexedDBService.updateCurriculum(bundleId, curriculum);

    const currFilename = `${bundleId}/curriculum.le`;
    await window.api.saveFile(`/${currFilename}`, JSON.stringify(curriculum));

    return curriculum;
  };

  encryptPracticalCourse = async (
    bundleId: number,
    updateProgress: Function,
    cancelToken: any
  ) => {
    await window.api.makeDir(bundleId);
    const curriculum: any = await this.indexedDBService.getCurriculumByBundleId(
      bundleId
    );

    let count = 0;
    if (curriculum.img_url.startsWith("https")) {
      let courseImgFilename = `${bundleId}/${bundleId}.le`;
      const courseImgD = await axios
        .get(`${curriculum.img_url}`, {
          responseType: "blob",
          cancelToken,
        })
        .catch((e) => console.log("Error from practical course image", e));
      const courseImgPromise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(courseImgD?.data);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      const courseImgResult = await courseImgPromise;
      await window.api.saveFile(`/${courseImgFilename}`, courseImgResult);
      curriculum.img_url = `/${courseImgFilename}`;
    }

    for (let { chapters, lesson_id } of curriculum.curriculum) {
      for (let chapter of chapters) {
        try {
          await this.downloadExercise(
            chapter,
            bundleId,
            lesson_id,
            cancelToken
          );
          count = count + 1;
          updateProgress(count);
        } catch (e) {
          console.log(e);
        }
      }
    }
    // this.indexedDBService.updateCurriculum(bundleId, curriculum);

    const currFilename = `${bundleId}/curriculum.le`;
    await window.api.saveFile(`/${currFilename}`, JSON.stringify(curriculum));

    return curriculum;
  };
}
