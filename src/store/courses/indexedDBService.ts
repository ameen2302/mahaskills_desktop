import { Chapter, NotesData } from "../../definitions/general";

export class IndexedDBService {
  db: any | null;
  version: number;
  constructor() {
    this.db = null;
    this.version = 1;
  }

  createDatabase = () => {
    this.initCoursesDb();
  };

  initCoursesDb = () => {
    const request = window.indexedDB.open("Courses", this.version);
    request.onerror = (e) => {
      console.error("IndexedDB error:");
      this.db = null;
    };

    request.onsuccess = (e) => {
      this.db = request.result;
      // console.info("Successful database connection");
    };

    request.onupgradeneeded = () => {
      this.db = request.result;
      if (!this.db.objectStoreNames.contains("course")) {
        const courseStore = this.db.createObjectStore("course", {
          keyPath: "id",
          autoIncrement: true,
        });
        courseStore.createIndex("bundle_name", "bundle_name");
        courseStore.createIndex("bundle_id", "bundle_id");
        courseStore.createIndex("type", "type");
        courseStore.createIndex("is_installed", "is_installed");
        courseStore.createIndex("img_url", "img_url");
        courseStore.createIndex("is_downloaded", "is_downloaded");
        courseStore.createIndex("curriculum", "curriculum");
      }

      if (!this.db.objectStoreNames.contains("notes")) {
        // console.log("Object store notes created");
        const notesStore = this.db.createObjectStore("notes", {
          keyPath: "id",
          autoIncrement: true,
        });
        notesStore.createIndex("blm_id", "blm_id");
        notesStore.createIndex("page_number", "page_number");
        notesStore.createIndex("x_cord", "x_cord");
        notesStore.createIndex("y_cord", "y_cord");
        notesStore.createIndex("content", "content");
      }

      if (!this.db.objectStoreNames.contains("bookmarks")) {
        // console.log("Object store bookmarks created");
        const bookmarksStore = this.db.createObjectStore("bookmarks", {
          keyPath: "id",
          autoIncrement: true,
        });
        bookmarksStore.createIndex("name", "name");
        bookmarksStore.createIndex("course_type", "course_type");
        bookmarksStore.createIndex("bundleId", "bundleId");
        bookmarksStore.createIndex("lessonId", "lessonId");
        bookmarksStore.createIndex("materialId", "materialId", {
          unique: true,
        });
      }
    };
  };

  addCoursesInDB = (course: any) => {
    const request = window.indexedDB.open("Courses", this.version);
    let db = null;
    request.onsuccess = () => {
      db = request.result;
      const store = db.transaction("course", "readwrite").objectStore("course");
      let exists = store.index("bundle_id").get(+course.bundle_id);
      exists.onsuccess = () => {
        if (!exists.result) {
          store.add(course);
        }
      };
    };
  };

  getAllCoursesFromDB = async () => {
    let db = null;
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("Courses", this.version);
      request.onsuccess = async () => {
        db = request.result;
        const req = db
          .transaction("course", "readwrite")
          .objectStore("course")
          .getAll();
        req.onsuccess = () => {
          resolve(req.result);
        };
        req.onerror = () => {
          reject("Error from fetching courses from db");
        };
      };
    });
  };

  addBookmarkInDB = (
    chapter: Chapter | undefined,
    params: {
      bundleId: string;
      lessonId: string;
      materialId: string;
    },
    type: number
  ) => {
    const request = window.indexedDB.open("Courses", this.version);
    let db = null;
    let data = {
      // chapter_id: chapter?.id,
      name: chapter?.name,
      bundleId: params.bundleId,
      lessonId: params.lessonId,
      materialId: params.materialId,
      course_type: type,
    };
    request.onsuccess = () => {
      db = request.result;
      const store = db
        .transaction("bookmarks", "readwrite")
        .objectStore("bookmarks");
      store.add(data);
    };
  };

  addNoteInDB = async (note: NotesData) => {
    const request = window.indexedDB.open("Courses", this.version);
    let db = null;
    return new Promise(
      (resolve, reject) =>
        (request.onsuccess = () => {
          db = request.result;
          const store = db
            .transaction("notes", "readwrite")
            .objectStore("notes");
          const noteStored = store.add(note);
          noteStored.onsuccess = () => {
            resolve(noteStored.result);
          };
        })
    );
  };

  getNoteByBLM_id = async (blm_id: string) => {
    let db = null;
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("Courses", this.version);
      request.onsuccess = async () => {
        db = request.result;
        const req = db
          .transaction("notes", "readwrite")
          .objectStore("notes")
          .index("blm_id")
          .getAll(blm_id);
        req.onsuccess = () => {
          resolve(req.result);
        };
        req.onerror = () => {
          reject("Error from get curriculum by course id");
        };
      };
    });
  };

  deleteNoteById = async (id: number) => {
    let db = null;
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("Courses", this.version);
      request.onsuccess = async () => {
        db = request.result;
        const req = db
          .transaction("notes", "readwrite")
          .objectStore("notes")
          .delete(id);
        req.onsuccess = () => {
          resolve(req.result);
        };
        req.onerror = () => {
          reject("Error from deleting notes from db");
        };
      };
    });
  };

  getAllBookmarks = async () => {
    let db = null;
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("Courses", this.version);
      request.onsuccess = async () => {
        db = request.result;
        const req = db
          .transaction("bookmarks", "readwrite")
          .objectStore("bookmarks")
          .getAll();
        req.onsuccess = () => {
          resolve(req.result);
        };
        req.onerror = () => {
          reject("Error from fetching bookmarks from db");
        };
      };
    });
  };

  deleteBookmarkById = async (id: number) => {
    let db = null;
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("Courses", this.version);
      request.onsuccess = async () => {
        db = request.result;
        const req = db
          .transaction("bookmarks", "readwrite")
          .objectStore("bookmarks")
          .delete(id);
        req.onsuccess = () => {
          resolve(req.result);
        };
        req.onerror = () => {
          reject("Error from deleting bookmarks from db");
        };
      };
    });
  };

  getCurriculumByBundleId = async (bundleId: number) => {
    let db = null;
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("Courses", this.version);
      request.onsuccess = async () => {
        db = request.result;
        const req = db
          .transaction("course", "readwrite")
          .objectStore("course")
          .index("bundle_id")
          .get(bundleId);
        req.onsuccess = () => {
          resolve(req.result);
        };
        req.onerror = () => {
          reject("Error from get curriculum by course id");
        };
      };
    });
  };

  updateCurriculum = (bundleId: number, curr: any) => {
    let db = null;
    const request = window.indexedDB.open("Courses", this.version);
    request.onsuccess = () => {
      db = request.result;
      const transaction = db.transaction("course", "readwrite");
      const objectStore = transaction.objectStore("course");

      objectStore.openCursor().onsuccess = async (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.bundle_id === bundleId) {
            const updateData = cursor.value;
            delete updateData.curriculum;
            updateData.img_url = curr.img_url;
            updateData.curriculum = curr.curriculum;
            objectStore.put(updateData);
          }
          cursor.continue();
        }
      };
    };
  };

  markAsInstalled = (id: number) => {
    let db = null;
    const request = window.indexedDB.open("Courses", this.version);
    request.onsuccess = () => {
      db = request.result;
      const objectStore = db
        .transaction("course", "readwrite")
        .objectStore("course");
      const req = objectStore.get(id);
      req.onsuccess = () => {
        const course = req.result;
        course.is_installed = true;
        objectStore.put(course);
      };
    };
  };

  markAsDownloaded = (id: number) => {
    let db = null;
    const request = window.indexedDB.open("Courses", this.version);
    request.onsuccess = () => {
      db = request.result;
      const objectStore = db
        .transaction("course", "readwrite")
        .objectStore("course");
      const req = objectStore.get(id);
      req.onsuccess = () => {
        const course = req.result;
        course.is_downloaded = true;
        objectStore.put(course);
      };
    };
  };

  clearData = () => {
    let db = null;
    const request = window.indexedDB.open("Courses", this.version);
    request.onsuccess = () => {
      db = request.result;
      const courseObjectStore = db
        .transaction("course", "readwrite")
        .objectStore("course");
      const notesObjectStore = db
        .transaction("notes", "readwrite")
        .objectStore("notes");
      const bookmarksObjectStore = db
        .transaction("bookmarks", "readwrite")
        .objectStore("bookmarks");

      courseObjectStore.clear();
      notesObjectStore.clear();
      bookmarksObjectStore.clear();
    };
  };
}
