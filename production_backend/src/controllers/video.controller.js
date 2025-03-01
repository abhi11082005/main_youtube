import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import { Video } from "../models/video.model.js"
import {User} from "../models/user.models.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js"
import mongoose,{isValidObjectId } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title){
        throw new ApiError(401,"title is not exist in publishAVideo")
    }
    if(!description){
        throw new ApiError(401,"description is not exist in publishAVideo")
    }
    let videofilelocalpath;
    if (req.files && Array.isArray(req.files.videofile) && req.files.videofile.length > 0) {
        videofilelocalpath = req.files.videofile[0].path
    }
    if(!videofilelocalpath){
        throw new ApiError(401,"videoFile is not exist in publishAVideo")
    }
    let thumbnaillocalpath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnaillocalpath = req.files.thumbnail[0].path
    }
    if(!thumbnaillocalpath){
        throw new ApiError(401,"videoFile is not exist in publishAVideo")
    }
    const uploadVideo=await uploadOnCloudinary(videofilelocalpath)
    if(!uploadVideo) throw new ApiError(401,"video not uploaded on cloudinary on publishAVideo")
    const uploadThumbnail=await uploadOnCloudinary(thumbnaillocalpath)
    if(!uploadThumbnail) throw new ApiError(401,"thumbnail not found in publishAVideo")
    const video=await Video.create({
        title,
        description,
        videofile:uploadVideo?.url,
        thumbnail:uploadThumbnail?.url,
        duration:uploadVideo?.duration,
        videofilepublicid:uploadVideo?.public_id,
        thumbnailpublicid:uploadThumbnail?.public_id,
        owner:req.user?._id,
    })

    return res
    .status(200)
    .json(new ApiResponse(200, video , "video uploaded succesfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoid } = req.query
    console.log(videoid)
    if(!isValidObjectId(videoid)) throw new ApiError(401,"video Id not found in params in getVideoById")
    //TODO: get video by id
    const video=await Video.findOne({_id:videoid})
    if(!video) throw new ApiError(401,"video not exist in getVideoById")
    return res.status(200)
    .json(new ApiResponse(200,video.videofile,"video file sent succesfully"))
})  

const updateVideo = asyncHandler(async (req, res) => {
    const { videoid } = req.query
    const {title,description} = req.body
    const thumbnail=req.file?.path
    // console.log(videoid," ",title," ",description," ",thumbnail)
    //TODO: update video details like title, description, thumbnail
    if(!isValidObjectId(videoid)) throw new ApiError(401,"videoId not found in updateVideo")
    
    const findVideo=await Video.findOne({_id:videoid})
    if(!findVideo) throw new ApiError(401,"data video not found from database in updatevideo")
    let thumbnailPath;        
    if(thumbnail){
        const deletePrevThumbnail=await deleteFromCloudinary(findVideo.thumbnailpublicid)
        if(!deletePrevThumbnail) throw new ApiError(401,"previous photo not deleted from cloudinary in updatevideo")
        thumbnailPath=await uploadOnCloudinary(thumbnail)
        if(!thumbnailPath) throw new ApiError(401,"thumbnailPath not found in updateVideo")
    }

        const video=await Video.findByIdAndUpdate(videoid,{
        title:title||findVideo.title,
        description:description||findVideo.description,
        thumbnail:thumbnailPath?.url||findVideo.thumbnail,
        thumbnailpublicid:thumbnailPath?.public_id||findVideo.thumbnailpublicid
    });
    if(!video) throw new ApiError(401,"updation not in updateVideo")

    res
    .status(200)
    .json(new ApiResponse(200,video,"video updated successfully"))

})  

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoid } = req.query
    //TODO: delete video
    const video=await Video.findById(videoid);
    if(!isValidObjectId(videoid)) throw new ApiError(401,"video not found in deleteVideo")
    console.log(video.videofilepublicid)
    //delete video from cloudinary
    const deleteVideoFromCloudinary=await deleteFromCloudinary(video.videofilepublicid,"video")
    const deletethumbnailFromCloudinary=await deleteFromCloudinary(video.thumbnailpublicid,"image")

    console.log(deleteVideoFromCloudinary)
    if(!deleteVideoFromCloudinary) throw new ApiError(401,"video not deleted in deleteVideo")
    if(!deletethumbnailFromCloudinary) throw new ApiError(401,"thumbnail not deleted in deleteVideo")
    
    
    const deleteVideo=await Video.findByIdAndDelete(videoid);
    res
    .status(200)
    .json( new ApiResponse(200,deleteVideo,"Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)) throw new ApiError(401,"videoId not present in togglePublishVideo")
    
    const video = await Video.findById(videoId)
    if(!video) throw new ApiError(401,"video not found in db in togglePublishStatus")
    
    video.ispublished=!(video.ispublished)
    await video.save({validateBeforeSave:false})

    res
    .status(200)
    .json(new ApiResponse(200,video,"IsPublished Successfully Toggle"))
    
})

const getAllVideo = asyncHandler(async (req,res) =>{
    const {
        page=1,
        query="abhi",
        limit=10,
        sortedBy="createdAt",
        sortType=1,
    } = req.query
    const user=await User.findById({_id:req.user?._id})
    if(!user) throw new ApiError(401, "user not found in getAllVideo")
    const userId=user._id
    let skip=( page-1 )*limit
    // const videos= await Video.findOne({owner:user})
    const videosAggregation= await Video.aggregate(
        [
            {$match:{owner:(userId)}},
            {$match:{
                $or:[
                    { title:{$regex:query , $options:'i'} },
                    {description:{$regex:query , $options:'i'} }
                ]   
            }},
            {
                $sort:{ [sortedBy]:Number(sortType) }
            },
            {$skip:Number(skip)},
            {$limit:Number(limit)}
        ]
    )
    console.log(videosAggregation)
     Video.aggregatePaginate(videosAggregation,{page,skip})
    .then((result)=>{
        return res.status(200)
        .json(new ApiResponse(200,result,"Successfully data fetched"))    
    })
    .catch((error)=>{
        console.log(error,"error found in aggregatePaginate of getAllVideo")
        throw error
    }) 
})
export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideo

}