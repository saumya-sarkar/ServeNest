import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const addressSchema = new Schema({
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: { 
    type: String, 
    index: true,
    required: true 
  },
  // optional GeoJSON for future geo queries:
  /*
  coordinates: {
    type: { 
        type: String, 
        enum: ['Point'], 
        default: 'Point' 
    },
    coordinates: { 
        type: [Number], 
        default: undefined 
    } // [lng, lat]
  }
  */
}, { _id: false });

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    profilePicture: {
        type: String, //cloudinary url
        default: null
    },
    role: {
        type: String,
        enum: {
            values: ["admin", "user", "professional"],
            message: "{VALUE} is not supported. Allowed roles are admin, user, professional"
        },
        default: "user",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    professionalProfile: {
        type: Schema.Types.ObjectId,
        ref: "Professional",
        required: function() {
            return this.role === "professional";
        }
    },
    address: {
        type: addressSchema
    },
    refreshToken: {
        type: String,
        default: null
    }
}, { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {

    const payload = {
        _id: this._id,
        email: this.email,
        role: this.role,
        username: this.username,
        fullName: this.fullName
    }

    return jwt.sign(payload, 
        process.env.ACCESS_TOKEN_SECRET, 
        { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        });

}

userSchema.methods.generateRefreshToken = function () {

    const payload = {
        _id: this._id,
        role: this.role
    }

    return jwt.sign(payload, 
        process.env.REFRESH_TOKEN_SECRET, 
        { 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
        });

}

export const User = mongoose.model("User", userSchema)