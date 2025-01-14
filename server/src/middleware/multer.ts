import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory for easy processing
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error("Only .png, .jpg formats are supported."));
    }
  },
});
