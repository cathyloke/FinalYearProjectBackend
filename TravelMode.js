const mongoose = require("mongoose");

const TravelModeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
    },
    {
        collection: "travelmodes",
    }
);
mongoose.model("TravelMode", TravelModeSchema);
