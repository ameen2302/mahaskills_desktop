const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { mkdir } = require("fs/promises");
const fs = require("fs");
const checkDiskSpace = require("check-disk-space").default;
const crypto = require("crypto");
const os = require("os");
const { move } = require("fs-extra");

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    show: isDev ? true : false,
    center: true,
    icon: path.join(__dirname + "icon.ico"),
    title: "MAHA SKILLS",
    webPreferences: {
      nodeIntegration: true,
      preload: isDev
        ? path.join(__dirname, "./preload.js")
        : path.join(__dirname, "../build/preload.js"),
      // devTools: isDev ? true : false,
    },
  });

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // Open DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
  if (!isDev) {
    win.maximize();
    win.show();
  }

  function encrypt(text) {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
      encryptedData: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      key: key.toString("base64"),
    };
  }

  function decrypt(text) {
    const spl = text.split(",");
    let iv = Buffer.from(spl[1], "base64");
    let encryptedText = Buffer.from(spl[0], "base64");
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(spl[2], "base64"),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  const getCurrentDirPath = () => {
    const path =
      process.platform === "darwin"
        ? app.getAppPath("appData").lastIndexOf("/")
        : app.getAppPath("appData").lastIndexOf("\\");
    const directoryPath = app.getAppPath("appData").substring(0, path);
    return directoryPath;
  };

  const copyRecursiveSync = (src, dest) => {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(function (childItemName) {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  ipcMain.on("request-free-disk-space", () => {
    const directoryPath = getCurrentDirPath();
    checkDiskSpace(`${directoryPath}`).then((sp) => {
      win.webContents.send("get-free-disk-space", sp.free);
    });
  });

  ipcMain.on("request-app-path", (event, args) => {
    const path =
      process.platform === "darwin"
        ? app.getAppPath("appData").lastIndexOf("/")
        : app.getAppPath("appData").lastIndexOf("\\");
    win.webContents.send(
      "send-app-path",
      app.getAppPath("appData").substring(0, path)
    );
  });

  ipcMain.on("make-dir", async (event, args) => {
    const directoryPath = getCurrentDirPath() + `/${args}`;
    if (!fs.existsSync(directoryPath)) {
      await mkdir(directoryPath);
    }
  });

  ipcMain.on("save-file", async (event, ...args) => {
    let encryptedStr;
    const directoryPath = getCurrentDirPath() + `${args[0]}`;
    const result = encrypt(`${args[1]}`);
    encryptedStr = result.encryptedData + "," + result.iv + "," + result.key;

    // encryptedStr = safeStorage.encryptString(args[1]);

    if (!fs.existsSync(`${directoryPath}`)) {
      fs.writeFileSync(directoryPath, encryptedStr);
    }
  });

  ipcMain.on("request-pdf-content", (event, args) => {
    const directoryPath = getCurrentDirPath() + `${args}`;
    if (args) {
      fs.readFile(`${directoryPath}`, (err, data) => {
        // const decryptStr = safeStorage.decryptString(data);

        const decryptStr = decrypt(data.toString());
        win.webContents.send("receive-pdf-content", decryptStr);
      });
    }
  });

  ipcMain.on("request-video-content", (event, args) => {
    const directoryPath = getCurrentDirPath() + `${args}`;
    fs.readFile(`${directoryPath}`, (err, data) => {
      // const buf = Buffer.from(data, "base64");
      // const decryptStr = safeStorage.decryptString(buf);

      const decryptStr = decrypt(data.toString());
      win.webContents.send("receive-video-content", decryptStr);
    });
  });

  ipcMain.on("request-content", (event, args) => {
    const directoryPath = getCurrentDirPath() + `${args}`;
    fs.readFile(`${directoryPath}`, (err, data) => {
      // const buf = Buffer.from(data, "base64");
      // const decryptStr = safeStorage.decryptString(buf);

      const buf = Buffer.from(data, "base64").toString();
      const decryptStr = decrypt(buf);
      win.webContents.send("receive-content", decryptStr);
    });
  });

  ipcMain.handle("request-thumb-content", async (event, args) => {
    const directoryPath = getCurrentDirPath() + `${args}`;
    return new Promise((resolve, reject) => {
      fs.readFile(`${directoryPath}`, (err, data) => {
        if (err) {
          return reject(err);
        }
        const buf = Buffer.from(data, "base64").toString();
        const decryptStr = decrypt(buf);

        // const buf = Buffer.from(data, "base64");
        // const decryptStr = safeStorage.decryptString(buf);
        resolve(decryptStr);
      });
    });
  });

  ipcMain.on("remove-course", (event, args) => {
    if (fs.existsSync(`${getCurrentDirPath()}/${args}`)) {
      fs.rmSync(`${getCurrentDirPath()}/${args}`, { recursive: true });
    }
  });

  ipcMain.on("save-zip", async (event, ...args) => {
    // args[0] -> bundleID
    // args[1] -> zipFilename
    const directoryPath = getCurrentDirPath();
    const desktopPath = path.join(os.homedir(), "Desktop");
    if (!fs.existsSync(`${desktopPath}/${args[1]}`)) {
      await mkdir(`${desktopPath}/${args[1]}`);
    }
    if (!fs.existsSync(`${desktopPath}/${args[1]}/${args[0]}`)) {
      copyRecursiveSync(
        `${directoryPath}/${args[0]}`,
        `${desktopPath}/${args[1]}/${args[0]}`
      );
    }

    fs.rmSync(`${directoryPath}/${args[0]}`, { recursive: true });

    win.webContents.send(
      "zipped",
      `Encrypted course successfully, please find "${args[1]}" on desktop`
    );
  });

  ipcMain.on("copy-zip", (event, ...args) => {
    //  args[0] -> bundleId
    //  args[1] -> bundleName
    //  args[2] -> guest course install (boolean)
    dialog
      .showOpenDialog(win, {
        properties: ["openDirectory"],
        filters: [{ name: "Folder" }],
      })
      .then(async (res) => {
        if (!res.canceled) {
          win.webContents.send(
            "message",
            "Installing course. This might take a few minutes, please wait..."
          );
          const splitPath = res.filePaths[0].split(
            process.platform === "darwin" ? "/" : "\\"
          );
          const foldername = splitPath[splitPath.length - 1];
          const destPath =
            getCurrentDirPath() +
            `${process.platform === "darwin" ? "/" : "\\"}${foldername}`;

          if (args[2]) {
            let dirs;
            try {
              if (res.filePaths[0] !== destPath) {
                copyRecursiveSync(`${res.filePaths[0]}`, `${destPath}`);
              }
              dirs = fs.readdirSync(`${destPath}`);

              dirs = dirs.filter((dir) => !dir.startsWith(".DS"));

              if (dirs.length && dirs[0].match(/^[0-9]*$/g)) {
                win.webContents.send(
                  "extracting",
                  "Extracting course contents. This might take a few minutes, please wait..."
                );
                fs.rmSync(`${getCurrentDirPath()}/${dirs[0]}`, {
                  recursive: true,
                  force: true,
                });

                await move(
                  `${destPath}/${dirs[0]}`,
                  `${getCurrentDirPath()}/${dirs[0]}`
                );

                if (
                  fs.existsSync(
                    `${getCurrentDirPath()}/${dirs[0]}/curriculum.le`
                  )
                ) {
                  fs.readFile(
                    `${getCurrentDirPath()}/${dirs[0]}/curriculum.le`,
                    (err, data) => {
                      const buf = Buffer.from(data, "base64").toString();
                      const decryptStr = decrypt(buf);
                      win.webContents.send(
                        "receive-curriculum",
                        false,
                        decryptStr
                      );
                    }
                  );
                  fs.unlink(
                    `${getCurrentDirPath()}/${dirs[0]}/curriculum.le`,
                    (err) => {
                      if (err) console.log(err);
                      console.log("Curriculum json deleted successfully");
                    }
                  );
                } else if (
                  fs.existsSync(`${destPath}/${dirs[0]}/curriculum.le`)
                ) {
                  fs.readFile(
                    `${destPath}/${dirs[0]}/curriculum.le`,
                    (err, data) => {
                      const buf = Buffer.from(data, "base64").toString();
                      const decryptStr = decrypt(buf);
                      win.webContents.send(
                        "receive-curriculum",
                        false,
                        decryptStr
                      );
                    }
                  );
                } else {
                  win.webContents.send(
                    "receive-curriculum",
                    true,
                    "Missing course metadata, cannot install course"
                  );
                }

                if (fs.existsSync(`${destPath}`)) {
                  fs.rmSync(`${destPath}`, { recursive: true, force: true });
                }
              } else {
                win.webContents.send("error", "Invalid course selected");
              }
            } catch (error) {
              console.log(error);
            }
          } else if (`${foldername}` === `${args[1]}`) {
            win.webContents.send(
              "extracting",
              "Extracting course contents. This might take a few minutes, please wait..."
            );

            try {
              if (res.filePaths[0] !== destPath) {
                copyRecursiveSync(`${res.filePaths[0]}`, `${destPath}`);
              }

              fs.rmSync(`${getCurrentDirPath()}/${args[0]}`, {
                recursive: true,
                force: true,
              });

              await move(
                `${destPath}/${args[0]}`,
                `${getCurrentDirPath()}/${args[0]}`
              );

              if (
                fs.existsSync(`${getCurrentDirPath()}/${args[0]}/curriculum.le`)
              ) {
                fs.readFile(
                  `${getCurrentDirPath()}/${args[0]}/curriculum.le`,
                  (err, data) => {
                    const buf = Buffer.from(data, "base64").toString();
                    const decryptStr = decrypt(buf);
                    win.webContents.send(
                      "receive-curriculum",
                      false,
                      decryptStr
                    );
                  }
                );
                fs.unlink(
                  `${getCurrentDirPath()}/${args[0]}/curriculum.le`,
                  (err) => {
                    if (err) console.log(err);
                    console.log("Curriculum json deleted successfully");
                  }
                );
              } else if (
                fs.existsSync(`${destPath}/${args[0]}/curriculum.le`)
              ) {
                fs.readFile(
                  `${destPath}/${args[0]}/curriculum.le`,
                  (err, data) => {
                    const buf = Buffer.from(data, "base64").toString();
                    const decryptStr = decrypt(buf);
                    win.webContents.send(
                      "receive-curriculum",
                      false,
                      decryptStr
                    );
                  }
                );
              } else {
                win.webContents.send(
                  "receive-curriculum",
                  true,
                  "Missing files detected, cannot install course"
                );
              }

              if (fs.existsSync(`${destPath}`)) {
                setTimeout(() => {
                  fs.rmSync(`${destPath}`, { recursive: true, force: true });
                }, 2000);
              }
            } catch (error) {
              console.log(error);
            }
          } else {
            win.webContents.send(
              "receive-curriculum",
              true,
              "Incorrect course folder chosen"
            );
          }
        }
      })
      .catch((err) => {
        console.log(err, "err from dialog");
      });
  });
}

app.on("ready", () => {
  if (!isDev) {
    const template = [
      {
        label: "Menu",
        submenu: [{ label: "Open File", role: "open" }],
      },
      {
        label: "View",
        submenu: [{ role: "cut" }, { role: "copy" }, { role: "paste" }],
      },
      {
        label: "Window",
        submenu: [
          { label: "Toggle Full Screen", role: "togglefullscreen" },
          {
            label: "Reload",
            accelerator: "CommandOrControl+R",
            role: "reload",
          },
          {
            label: "Close Window",
            accelerator: "CommandOrControl+Q",
            role: "quit",
          },
        ],
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    // Menu.setApplicationMenu(menu);
  }
  createWindow();
  const path =
    process.platform === "darwin"
      ? app.getAppPath("appData").lastIndexOf("/")
      : app.getAppPath("appData").lastIndexOf("\\");
  const directoryPath = app.getAppPath("appData").substring(0, path);
  if (!fs.existsSync(`${directoryPath}/.preinstalled.le`)) {
    win.webContents.session.clearStorageData();
    fs.writeFileSync(`${directoryPath}/.preinstalled.le`, "");
  }
});

app.on("window-all-closed", () => {
  // if (process.platform !== "darwin") {
  app.quit();
  // }
});

// app.on("activate", () => {
//   if (BrowserWindow.getAllWindows().length === 0 || win === null) {
//     createWindow();
//   }
// });
