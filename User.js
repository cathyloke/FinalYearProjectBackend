const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, CoverScreen2required: true },
        preferences: {
            travelModes: [String],
            interests: [String]
        },
        savedPlans: [String],
    },
    {
        collection: "User"
    }
);
mongoose.model("User", UserSchema)