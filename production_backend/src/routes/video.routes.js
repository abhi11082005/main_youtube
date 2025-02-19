import { upload } from "../middlewares/multer.middleware.js";
import authMiddleware from "../middlewares/auth.middlewares.js"
import { Router } from "express";
import { publishAVideo , getVideoById, updateVideo, deleteVideo} from "../controllers/video.controller.js";

const videoRouter=Router()
videoRouter.use(authMiddleware)

videoRouter.route("/").post(
    upload.fields([
        {
            name: "videofile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        }
    ])
    ,publishAVideo)
    .get(getVideoById)
    .patch(upload.single("thumbnail"),updateVideo)
    .delete(deleteVideo)



export default videoRouter