import { Router } from "express";
import { createPost, deletePost, getAllPost, getPost, updatePost } from "../controllers/post.controller";
import authWare from "../middlewares/authWare";

const postRouter = Router();

postRouter.post("/create", authWare, createPost);
postRouter.get("/all", getAllPost);
postRouter.get("/get", getPost);
postRouter.post("/update", authWare, updatePost);
postRouter.delete("/delete", authWare, deletePost);

export default postRouter;
