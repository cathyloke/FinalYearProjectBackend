const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true,
        },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        preferences: {
            travelModes: [String],
            interests: [String],
        },
        savedPlans: [
            {
                name: { type: String },
                days: { type: Number },
                startDate: { type: Date },
                endDate: { type: Date },
                destination: { type: String },
                budget: {
                    type: String,
                    enum: ["high", "medium", "low"],
                },
                travelModes: [String],
                interests: [String],
                itinerary: [
                    {
                        day: { type: Number },
                        activities: [
                            {
                                time: { type: String },
                                activity: { type: String },
                                location: { type: String },
                            },
                        ],
                    },
                ],
            },
        ],
        budgets: [
            {
                name: { type: String },
                budgetAmount: { type: Number },
                expensesAmount: { type: Number },
                expensesCategory: [
                    {
                        expensesCategoryName: { type: String },
                        expensesCategoryAmount: { type: Number },
                        expensesCategoryDetail: [
                            {
                                name: { type: String },
                                payer: { type: String },
                                dateCreated: { type: Date },
                                amount: { type: Number },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        collection: "users",
    }
);
mongoose.model("User", UserSchema);
