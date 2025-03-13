const mongoose = require("mongoose");

const InterestSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
    },
    {
        collection: "Interest",
    }
);
mongoose.model("Interest", InterestSchema);
