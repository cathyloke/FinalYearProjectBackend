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
        budgets: [{
            name: { type: String, unique: true },
            budgetAmount: { type: Number },
            expensesAmount: { type: Number },
            expensesCategory: [{
                expensesCategoryName: { type: String },
                expensesCategoryAmount: { type: Number },
                expensesCategoryDetail: [{
                    name: { type: String },
                    dateCreated: { type: Date },
                    amount: { type: Number },
                }]
            }]
        }]
    },
    {
        collection: "User"
    }
);
mongoose.model("User", UserSchema)