import mongoose from "mongoose";

const Card = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    number:{
        type: Number,
        required: true,
    },
    cvv:{
        type: Number,
        required: true,
    },
    expires:{
        type: String,
        required: true
    }
}) 

export default mongoose.model("Card", Card);
