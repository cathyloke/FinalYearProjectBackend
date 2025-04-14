const express = require("express");
const mongoose = require("mongoose");
const mongoURL =
    "mongodb+srv://catloke963:1234@feriodb.isp9y.mongodb.net/feriodb?retryWrites=true&w=majority&appName=ferioDB";

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is working");
});

mongoose
    .connect(mongoURL)
    .then(() => {
        console.log("Database Connected!");
    })
    .catch((error) => {
        console.error(error);
    });
require("./User");
require("./TravelMode");
require("./Interest");

const User = mongoose.model("User");
const TravelMode = mongoose.model("TravelMode");
const Interest = mongoose.model("Interest");

app.listen(3000, () => {
    console.log("server is running on port 3000");
});

//User Registration
app.post("/register", async (req, res) => {
    try {
        console.log(`Registering user: ${JSON.stringify(req.body)}`);
        const { name, gender, email, password } = req.body;
        const oldUser = await User.findOne({ email: email });

        if (oldUser) {
            throw new Error("User already exists");
        }

        const newUser = await User.create({
            name: name,
            gender: gender,
            email: email,
            password: password,
        });

        console.log(`User registered: ${JSON.stringify(newUser)}`);
        return res.status(200).send({ status: "ok", data: newUser });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//User Login
app.post("/login", async (req, res) => {
    try {
        console.log(`Logging user: ${JSON.stringify(req.body)}`);
        const { email, password } = req.body;
        console.log(JSON.stringify(req.body));
        const userExist = await User.findOne({ email: email });

        if (!userExist) {
            throw new Error("User not exist");
        }

        if (userExist.password !== password) {
            throw new Error("Password mismatch");
        }

        console.log(`User logged in: ${JSON.stringify(userExist)}`);
        return res.status(200).send({ status: "ok", data: userExist });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

/**
 * User
 */

//Retrieve User Info
app.get("/read/:id", async (req, res) => {
    try {
        console.log(`Retrieving user: ${JSON.stringify(req.body)}`);

        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not exist");
        }

        console.log(`User retrieved: ${JSON.stringify(user)}`);
        return res.status(200).send({ status: "ok", data: user });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Edit User Info
app.put("/update/:id", async (req, res) => {
    try {
        console.log(`Updating user ${JSON.stringify(req.body)}`);
        const userId = req.params.id;
        const updates = req.body;

        const result = await User.updateOne({ _id: userId }, { $set: updates });

        if (result.matchedCount === 0) {
            throw new Error("User not exist");
        }

        console.log(`User updated: ${JSON.stringify(result)}`);
        return res.status(200).send({ status: "ok", data: result });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

/**
 * Budget
 */

//Retrieve User Budget Info
app.get("/budget/:id/:name", async (req, res) => {
    try {
        console.log(`Retrieving budget: ${req.params.id}`);
        const userId = req.params.id;
        const name = req.params.name;

        if (!name) {
            throw new Error("Missing required fields: name");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not exist");
        }

        // Check if budget with the same name already exists
        const existingBudget = user.budgets.find(
            (budget) => budget.name === name
        );
        if (!existingBudget) {
            throw new Error(`Budget not found`);
        }

        console.log(`Budget retrieved: ${JSON.stringify(existingBudget)}`);
        return res.status(200).send({ status: "ok", data: existingBudget });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Upsert User Budget Info
app.put("/budget/:id", async (req, res) => {
    try {
        console.log(`Updating budget: ${req.params.id}`);
        const userId = req.params.id;
        const { name, budgetAmount } = req.body;

        if (!name || budgetAmount == null) {
            throw new Error("Missing required fields: name and budgetAmount");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not exist");
        }

        // Check if budget with the same name already exists
        const existingBudget = user.budgets.find(
            (budget) => budget.name === name
        );
        if (existingBudget) {
            // Update existing budget
            existingBudget.budgetAmount = Number(budgetAmount);
        } else {
            // Add new budget
            user.budgets.push({
                name,
                budgetAmount: Number(budgetAmount),
                expensesAmount: 0,
                expensesCategory: [],
            });
        }

        const userData = await user.save();

        console.log(`Budget updated: ${JSON.stringify(userData)}`);
        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Delete User Budget Info
app.delete("/budget/:id/:name", async (req, res) => {
    try {
        console.log(
            `Deleting budget: ${req.params.id}, budget: ${req.params.name}`
        );
        const userId = req.params.id;
        const budgetName = req.params.name;

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not exist");
        }

        user.budgets = user.budgets.filter(
            (budget) => budget.name !== budgetName
        );

        const userData = await user.save();

        console.log(`Budget deleted: ${JSON.stringify(userData)}`);
        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Retrieve User expenses Info
app.get("/expenses/:id/:name/:categoryName", async (req, res) => {
    try {
        console.log(`Retrieving expenses: ${req.params.id}`);
        const userId = req.params.id;
        const name = req.params.name;
        const categoryName = req.params.categoryName;

        if (!name) {
            throw new Error("Missing required fields: name");
        }

        if (!categoryName) {
            throw new Error("Missing required fields: categoryName");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not exist");
        }

        // Check if budget with the same name already exists
        const existingBudget = user.budgets.find(
            (budget) => budget.name === name
        );
        if (!existingBudget) {
            throw new Error(`Budget not found`);
        }

        const existingExpense = existingBudget.expensesCategory.find(
            (expense) => expense.expensesCategoryName === categoryName
        );
        if (!existingExpense) {
            throw new Error(`Expenses not found`);
        }

        console.log(`Expenses retrieved: ${JSON.stringify(existingExpense)}`);
        return res.status(200).send({ status: "ok", data: existingExpense });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Retrieve User expenses details Info
app.get("/expenses/:id/:name/:categoryName/:detailId", async (req, res) => {
    try {
        console.log(`Retrieving expenses details: ${req.params.id}`);
        const userId = req.params.id;
        const name = req.params.name;
        const categoryName = req.params.categoryName;
        const detailId = req.params.detailId;

        if (!name) {
            throw new Error(`Missing required fields: name`);
        }

        if (!categoryName) {
            throw new Error(`Missing required fields: categoryName`);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found`);
        }

        // Check if budget with the same name already exists
        const existingBudget = user.budgets.find(
            (budget) => budget.name === name
        );
        if (!existingBudget) {
            throw new Error(`Budget not found`);
        }

        const existingExpense = existingBudget.expensesCategory.find(
            (expense) => expense.expensesCategoryName === categoryName
        );
        if (!existingExpense) {
            throw new Error(`Expenses not found`);
        }

        const existingExpenseDetail =
            existingExpense.expensesCategoryDetail.find(
                (expense) => expense._id.toString() === detailId
            );
        if (!existingExpenseDetail) {
            throw new Error(`Expenses Details not found`);
        }

        console.log(
            `Expenses details retrieved: ${JSON.stringify(
                existingExpenseDetail
            )}`
        );
        return res
            .status(200)
            .send({ status: "ok", data: existingExpenseDetail });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Add Expenses
app.post("/expenses/:id/:name", async (req, res) => {
    try {
        console.log(
            `Adding expenses: ${req.params.id}, budget: ${req.params.name}`
        );
        const userId = req.params.id;
        const budgetName = req.params.name;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            throw new Error(`User not found`);
        }

        const budgetIndex = user.budgets.findIndex(
            (b) => b.name === budgetName
        );
        if (budgetIndex === -1) {
            throw new Error(`Budget not found`);
        }

        let budget = user.budgets[budgetIndex];

        let categoryIndex = budget.expensesCategory.findIndex(
            (c) => c.expensesCategoryName === req.body.expensesData.category
        );

        if (categoryIndex === -1) {
            budget.expensesCategory.push({
                expensesCategoryName: req.body.expensesData.category,
                expensesCategoryAmount: 0,
                expensesCategoryDetail: [],
            });
            categoryIndex = budget.expensesCategory.length - 1;
        }

        let expenseCategory = budget.expensesCategory[categoryIndex];

        // Add the new expense to the category details
        expenseCategory.expensesCategoryDetail.push({
            name: req.body.expensesData.name,
            payer: req.body.expensesData.payer,
            dateCreated: new Date(req.body.expensesData.date),
            amount: Number(req.body.expensesData.amount),
        });

        // Update category total
        expenseCategory.expensesCategoryAmount += Number(
            req.body.expensesData.amount
        );

        // Update overall budget expensesAmount
        budget.expensesAmount += Number(req.body.expensesData.amount);

        // Save user document
        const userData = await user.save();

        console.log(`Expenses added: ${JSON.stringify(userData)}`);
        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Update the expenses detail
app.put("/expenses/:id/:name/:categoryName", async (req, res) => {
    try {
        console.log(
            `Updating expenses: ${req.params.id}, budget: ${req.params.name}`
        );
        const userId = req.params.id;
        const budgetName = req.params.name;
        const categoryName = req.params.categoryName;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            throw new Error(`User not found`);
        }

        const budgetIndex = user.budgets.findIndex(
            (b) => b.name === budgetName
        );
        if (budgetIndex === -1) {
            throw new Error(`Budget not found`);
        }

        let budget = user.budgets[budgetIndex];

        let categoryIndex = budget.expensesCategory.findIndex(
            (c) => c.expensesCategoryName === categoryName
        );

        if (categoryIndex === -1) {
            throw new Error(`Category not found`);
        }

        let expenseCategory = budget.expensesCategory[categoryIndex];

        // Update the category details based on the id given
        let categoryDetailIndex =
            expenseCategory.expensesCategoryDetail.findIndex(
                (c) => c._id.toString() === req.body.id
            );

        if (categoryDetailIndex === -1) {
            throw new Error("Expenses details not found");
        }

        const oldExpensesCategoryDetailAmount =
            expenseCategory.expensesCategoryDetail[categoryDetailIndex].amount;

        expenseCategory.expensesCategoryDetail[categoryDetailIndex] = {
            ...expenseCategory.expensesCategoryDetail[categoryDetailIndex],
            name: req.body.name,
            payer: req.body.payer,
            dateCreated: req.body.date,
            amount: req.body.amount,
        };

        let difference = req.body.amount - oldExpensesCategoryDetailAmount;

        expenseCategory.expensesCategoryAmount += difference;
        user.budgets[budgetIndex].expensesAmount += difference;

        // Save user document
        const userData = await user.save();

        console.log(`Expenses details updated: ${JSON.stringify(userData)}`);
        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Delete User Expense Info
app.delete("/expenses/:id/:name/:categoryName/:detailId", async (req, res) => {
    try {
        console.log(
            `Deleting expenses: ${req.params.id}, budget: ${req.params.name}`
        );
        const userId = req.params.id;
        const budgetName = req.params.name;
        const categoryName = req.params.categoryName;
        const detailId = req.params.detailId;

        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found`);
        }

        const budgetIndex = user.budgets.findIndex(
            (b) => b.name === budgetName
        );

        let budget = user.budgets[budgetIndex];

        let categoryIndex = budget.expensesCategory.findIndex(
            (c) => c.expensesCategoryName === categoryName
        );

        if (categoryIndex === -1) {
            throw new Error(`Category not found`);
        }

        let expenseCategory = budget.expensesCategory[categoryIndex];

        // Update the category details based on the id given
        let categoryDetailIndex =
            expenseCategory.expensesCategoryDetail.findIndex(
                (c) => c._id.toString() === detailId
            );

        if (categoryDetailIndex === -1) {
            throw new Error("Expenses details not found");
        }

        const amount =
            user.budgets[budgetIndex].expensesCategory[categoryIndex]
                .expensesCategoryDetail[categoryDetailIndex].amount;

        user.budgets[budgetIndex].expensesCategory[
            categoryIndex
        ].expensesCategoryDetail = user.budgets[budgetIndex].expensesCategory[
            categoryIndex
        ].expensesCategoryDetail.filter(
            (detail) => detail._id.toString() !== detailId
        );

        user.budgets[budgetIndex].expensesCategory[
            categoryIndex
        ].expensesCategoryAmount -= amount;

        user.budgets[budgetIndex].expensesAmount -= amount;

        const userData = await user.save();

        console.log(`Expenses details deleted: ${JSON.stringify(userData)}`);
        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

/**
 * Preferences
 */

//Read preferences
app.get("/preferences/:type", async (req, res) => {
    try {
        console.log(`Retrieving preferences: ${req.params.type}`);
        const type = req.params.type;

        let travelModes;
        let interest;
        if (type === "travelMode") {
            travelModes = await TravelMode.find();
        } else if (type === "interest") {
            interest = await Interest.find();
        }

        if (!travelModes && !interest) {
            throw new Error("Type of Preferences not found");
        }

        console.log(
            `Preferences retrieved: ${JSON.stringify(travelModes || interest)}`
        );
        return res
            .status(200)
            .send({ status: "ok", data: travelModes || interest });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

/**
 * Itinerary
 */

//Read itinerary
app.get("/itinerary/:id", async (req, res) => {
    try {
        console.log(`Retrieving itinerary: ${req.params.id}`);
        const userId = req.params.id;
        // const { name, budgetAmount } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error(`User not found`);
        }

        const itineraries = user.savedPlans;
        if (!itineraries) {
            throw new Error(`Itinerary not found`);
        }

        console.log(`Itinerary retrieved: ${JSON.stringify(itineraries)}`);
        return res.status(200).send({ status: "ok", data: itineraries });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

app.get("/itinerary/:id/:itineraryId", async (req, res) => {
    try {
        console.log(`Retrieving itinerary: ${req.params.id}`);
        const userId = req.params.id;
        const itineraryId = req.params.itineraryId;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error(`User not found`);
        }

        const plans = user.savedPlans;
        if (!plans) {
            throw new Error(`Plans not found`);
        }

        const plan = plans.find((plan) => plan._id.toString() === itineraryId);
        if (!plan) {
            throw new Error(`Plan not found`);
        }

        console.log(`Itinerary plan retrieved: ${JSON.stringify(plan)}`);
        return res.status(200).send({ status: "ok", data: plan });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Add itinerary
app.post("/itinerary/:id", async (req, res) => {
    try {
        console.log(`Adding itinerary: ${req.params.id}`);
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error(`User not found`);
        }

        user.savedPlans.push(req.body.newItinerary);

        await user.save();

        const createdItinerary = user.savedPlans[user.savedPlans.length - 1];

        console.log(`Itinerary added: ${JSON.stringify(createdItinerary)}`);
        return res.status(200).send({ status: "ok", data: createdItinerary });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Update itinerary
app.put("/itinerary/:userId/:itineraryId", async (req, res) => {
    try {
        console.log(`Updating itinerary: ${JSON.stringify(req.params)}`);

        const { userId, itineraryId } = req.params;
        const updateData = req.body; // Contains the new itinerary data

        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found`);
        }

        // Find the itinerary to update
        const itineraryIndex = user.savedPlans.findIndex(
            (plan) => plan._id.toString() === itineraryId
        );
        if (itineraryIndex === -1) {
            throw new Error(`Itinerary not found`);
        }

        // Update only the fields provided in the request body
        user.savedPlans[itineraryIndex] = updateData;

        // Save the updated user document
        const userUpdated = await user.save();

        console.log(`Itinerary updated: ${JSON.stringify(userUpdated)}`);
        return res.status(200).send({ status: "ok", data: userUpdated });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

//Delete itinerary
app.delete("/itinerary/:userId/:itineraryId", async (req, res) => {
    try {
        console.log(`Deleting itinerary: ${JSON.stringify(req.params)}`);
        const { userId, itineraryId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found`);
        }

        // Find the index of the itinerary to delete
        const itineraryIndex = user.savedPlans.findIndex(
            (plan) => plan._id.toString() === itineraryId
        );
        if (itineraryIndex === -1) {
            throw new Error(`Itinerary not found`);
        }

        // Remove the itinerary from savedPlans
        user.savedPlans.splice(itineraryIndex, 1);
        const userUpdated = await user.save();

        console.log(`Itinerary deleted: ${JSON.stringify(userUpdated)}`);
        return res.status(200).send({ status: "ok", data: userUpdated });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});

app.put("/itinerary/details/:userId/:itineraryId", async (req, res) => {
    try {
        console.log(`Updating itinerary plan: ${JSON.stringify(req.params)}`);

        const { userId, itineraryId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found`);
        }

        const planIndex = user.savedPlans.findIndex(
            (plan) => plan._id.toString() === itineraryId
        );
        if (planIndex === -1) {
            throw new Error(`Itinerary not found`);
        }

        user.savedPlans[planIndex].itinerary = req.body.itinerary;

        user.markModified(`savedPlans.${planIndex}.itinerary`);

        // Save the updated user document
        const userUpdated = await user.save();

        console.log(`Itinerary plan updated: ${JSON.stringify(userUpdated)}`);

        return res.status(200).send({ status: "ok", data: userUpdated });
    } catch (error) {
        console.error(error);
        return res
            .status(400)
            .send({ status: "error", message: error.message });
    }
});
