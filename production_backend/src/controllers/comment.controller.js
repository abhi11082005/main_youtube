import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    const {content} = req.body
    const {videoId} = req.query
    if(!content) throw new ApiError(401,"content not exist in addComment ")
    if(!isValidObjectId(videoId)) throw new ApiError(401,"video Id not exist in addComment")
    // TODO: add a comment to a video

    const addCommentInDb = await Comment.create({
        content,
        video:videoId,
        owner:req.user?._id
    })
    if(!addCommentInDb) throw new ApiError(401,"comment not created in db in add Comment")
    
    res
    .status(200)
    .json( new ApiResponse(200,addCommentInDb,"Successfully add comment in Db"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {newContent} = req.body
    const {commentId} = req.query
    if(!newContent) throw new ApiError(401,"content not exist in updateComment ")
    if(!isValidObjectId(commentId)) throw new ApiError(401,"video Id not exist in updateComment")

    const updateCommentinDb = await Comment.findByIdandUpdate({_id:commentId},{content:newContent})
    if(!updateCommentinDb) throw new ApiError(401,"not update in updatecomment")
    
    res
    .status(200)
    .json(new ApiResponse(200,updateCommentinDb,"successfully add Comment in updateComment"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.query
    if(!isValidObjectId(commentId)) throw new ApiError(401,"video Id not exist in updateComment")
    const deleteCommentFromDb = await Comment.findByIdandDelete({_id:commentId})
    if(!deleteCommentFromDb) throw new ApiError(401,"not deleted in deleteComment")
    res
    .status(200)
    .json(new ApiResponse(200,deleteCommentFromDb,"successfully delete Comment in deleteComment"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }