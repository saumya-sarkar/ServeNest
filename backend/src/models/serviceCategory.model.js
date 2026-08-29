import mongoose, { Schema } from "mongoose";

const serviceCategorySchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String
    },
    services: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "Service"
            }
        ]
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


export const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema)