import mongoose,{Schema} from mongoose

const commentSchema=new Schema({
    content:{
        type:String,
        trim:true
    },
    video:{
        type:Schema.Type.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Type.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Comment=mongoose.model("Comment",commentSchema)