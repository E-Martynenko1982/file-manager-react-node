// routing main /
const fs = require("fs");
const isFolder = require("../util/isFolder");
const multer = require("multer");
const upload = multer({ dest: "./files/tmp/" });

module.exports = function (app) {
  isFolder
  app.get("/", (req, res) => {
    const base = "./files/";
    let path = "";

    if ("path" in req.query) {
      path = req.query.path;
    }


    if (isFolder(base + path)) {
      let files = fs.readdirSync(base + path).map(item => {
        const isDir = fs.lstatSync(base + path + "/" + item).isDirectory();
        let size = 0;
        if (!isDir) {
          size = fs.statSync(base + path + "/" + item);
          console.log(size.size);
        }
        return {
          name: item,
          dir: isDir,
          size: size.size ?? 0
        }
      })
      res.json({
        path: path,
        result: true,
        files: files
      });
    }
  });

  // Upload file endpoint
  app.post("/upload", upload.single("file"), (req, res) => {
    const targetPath = req.body.path || "";
    const file = req.file;
    if (!file) {
      return res.status(400).json({ result: false, message: "No file uploaded" });
    }
    const fs = require("fs");
    const path = require("path");
    const dest = path.join("./files/", targetPath, file.originalname);
    fs.rename(file.path, dest, (err) => {
      if (err) {
        return res.status(500).json({ result: false, message: "File move error", error: err });
      }
      res.json({ result: true, message: "File uploaded", filename: file.originalname });
    });
  });

  // Create folder endpoint
  app.post("/mkdir", (req, res) => {
    const targetPath = req.body.path || "";
    const folderName = req.body.name;
    if (!folderName) {
      return res.status(400).json({ result: false, message: "No folder name provided" });
    }
    const fs = require("fs");
    const path = require("path");
    const dirPath = path.join("./files/", targetPath, folderName);
    if (fs.existsSync(dirPath)) {
      return res.status(400).json({ result: false, message: "Folder already exists" });
    }
    fs.mkdirSync(dirPath, { recursive: true });
    res.json({ result: true, message: "Folder created", folder: folderName });
  });

  // Delete file or folder endpoint
  app.post("/delete", (req, res) => {
    const targetPath = req.body.path || "";
    const name = req.body.name;
    if (!name) {
      return res.status(400).json({ result: false, message: "No name provided" });
    }
    const fs = require("fs");
    const path = require("path");
    const fullPath = path.join("./files/", targetPath, name);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ result: false, message: "File or folder not found" });
    }
    try {
      const stat = fs.lstatSync(fullPath);
      if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      res.json({ result: true, message: "Deleted", name });
    } catch (err) {
      res.status(500).json({ result: false, message: "Delete error", error: err });
    }
  });
}