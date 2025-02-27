import { Router } from "express";
import multer from "multer";
import { createSponsorGroup, uploadSponsor, deleteSponsor } from "../controllers/sponsor.controller";
import authWare from "../middlewares/authWare";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/sponsor/");
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${encodeURI(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const sponsorRouter = Router();

sponsorRouter.post("/create-group", authWare, createSponsorGroup);
sponsorRouter.post("/upload", authWare, upload.single("sLogo"), uploadSponsor);
sponsorRouter.delete("/delete-group", authWare, deleteSponsor);

export default sponsorRouter;
