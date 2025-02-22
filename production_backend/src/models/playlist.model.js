import mongoose,{Schema} from mongoose

const playlistSchema=new Schema({
    name:{
        type:String,
        trim:true,
        required:true,
    },
    description:{
        type:String,
        trim:true,
    },
    videos:{
        type:Schema.Type.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Type.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Playlist=mongoose.model("Playlist",playlistSchema)