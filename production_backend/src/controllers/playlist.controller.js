import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!name || !description) throw new ApiError(401,"name not exist in createPlaylist")
    
    const createOnePlaylist = await Playlist.create({
        name,
        description,
        owner:req.user?._id
    })

    if(!createOnePlaylist) throw new ApiError(401,"createOnePlaylist not exist in createPlaylist")
    
    req
    .status(200)
    .json( new ApiResponse(200,createOnePlaylist,`successfully create playlist ${createOnePlaylist?.name}`))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.query
    if(!isValidObjectId(playlistId)) throw new ApiError(401,"not valid playlistId in getPlaylistById")
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.query
    // TODO: delete playlist
    
    if(!isValidObjectId(playlistId)) throw new ApiError(401,"playlistid not exist in deletePlaylist")
    const findAndDeleteVideo = await Playlist.findbyIdAndDelete({ _id : playlistId})
    if(!findAndDeleteVideo) throw new ApiError(401,"playlist not exist in deletePlaylist")
    
    res
    .status(200)
    .json( new ApiResponse(201,findAndDeleteVideo,"Successfully Delete Playlist"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!playlistId) throw new ApiError(401,"playlistId not exist in updatePlaylist")
    const queryAll={}
    if(name) queryAll[name]=name
    if(description) queryAll[description]=description

    //TODO: update playlist
    const ownerOfPlaylist=await Playlist.findById({_id:playlistId})
    if(req.user?._id.toString()!== ownerOfPlaylist?.owner.toString()) throw new ApiError(401,"Unauthorised credidential in updatePlaylist")
    
    const updatePlaylistInDb= await Playlist.findByIdAndUpdate({_id : playlistId},{queryAll})
    if(!updatePlaylist) throw new ApiError(401,"not update in updatePlaylist")

    res
    .status(200)
    .json(201,updatePlaylistInDb,`Successfully Update in updatePlatlist`)
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}