import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const serviceSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    durationInMins: {
        type: Number,
        required: true,
        min: [0, "time required can not be negative"]
    },
    price: {
        type: Number,
        required: true,
        min: [0, "price can not be negative"]
    },
    description:{
        type: String
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "ServiceCategory",
        required: true
    },
    coverImage: { 
        type: String, //cloudinary url
        default: null
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

serviceSchema.plugin(mongooseAggregatePaginate);

export const Service = mongoose.model("Service", serviceSchema)