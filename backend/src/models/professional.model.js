import mongoose, { Schema } from "mongoose";

const professionalSchema = new Schema({
    services: {
    type: [
        { 
            type: Schema.Types.ObjectId, 
            ref: "Service" 
        }
        ],
    default: undefined,
    validate: {
        validator: function(v) {
            return Array.isArray(v) && v.length > 0;
        },
        message: "A professional must offer at least one service."
        },
    required: true
    }
    ,
    experienceYears: { 
        type: Number, 
        default: 0,
        required: true
    },
    about: { 
        type: String, 
        default: "" 
    },
    idCard: { 
        type: String, //cloudinary url
        required: true
    },
    documents: {
        type: [
                { 
                    doc_name: {type:String, required:true},
                    doc_url: {type:String, required:true} //cloudinary url
                }
            ],
        validate: {
            validator: function(v) {
                return  Array.isArray(v) && v.length > 0;
            },
            message: "At least one document related to past experiences or certifications is required for verification." 
        }

    }, // docs for verification
    approved: { 
        type: Boolean, 
        default: false 
    } // admin approval
}, {timestamps: true});
    

export const Professional = mongoose.model("Professional", professionalSchema);