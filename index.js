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

// app.get('/', function (req, res) {
//     res.send('Hello World')
// })

app.listen(3000, () => {
    console.log("server is running on port 3000");
});

//User Registration
app.post("/register", async (req, res) => {
    try {
        console.log(`Registering user ${req.body}`);
        const { name, gender, email, password } = req.body;
        const oldUser = await User.findOne({ email: email });

        if (oldUser) {
            return res.status(400).send({ error: "User already exists" });
        }

        const newUser = await User.create({
            name: name,
            gender: gender,
            email: email,
            password: password,
        });
        console.log("user created");

        return res.status(201).send({ status: "ok", data: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
});

//User Login
app.post("/login", async (req, res) => {
    try {
        console.log(`Logging user ${req.body}`);
        const { email, password } = req.body;
        const userExist = await User.findOne({ email: email });

        if (!userExist) {
            return res.status(400).send({ error: "User not exists" });
        }

        if (userExist.password !== password) {
            return res.status(400).send({ error: "Password mismatch" });
        }

        return res.status(201).send({ status: "ok", data: userExist });
    } catch (error) {
        return res.status(500).send({ error: "Unable to login" });
    }
});

/**
 * User
 */

//Retrieve User Info
app.get("/read/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        // console.log(userId)
        const user = await User.findById(userId); // Fetch user by _id
        // console.log(JSON.stringify(user))

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        return res.status(200).send({ status: "ok", data: user });
    } catch (error) {
        return res.status(500).send({ error: "Server error" });
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
            return res.status(404).send({ error: "User not found" });
        }

        return res.status(200).send({ status: "ok", data: result });
    } catch (error) {
        return res.status(500).send({ error: "Server error" });
    }
});

/**
 * Budget
 */

//Retrieve User Budget Info
app.get("/budget/:id/:name", async (req, res) => {
    try {
        console.log(`Processing budget update for user: ${req.params.id}`);
        const userId = req.params.id;
        const name = req.params.name;
        console.log("name", name);

        if (!name) {
            return res
                .status(400)
                .send({ error: "Missing required fields: name" });
        }

        const user = await User.findById(userId);
        console.log(user);

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        // Check if budget with the same name already exists
        const existingBudget = user.budgets.find(
            (budget) => budget.name === name
        );
        if (!existingBudget) {
            throw new Error(`Budget not found`);
        }
        return res.status(200).send({ status: "ok", data: existingBudget });
    } catch (error) {
        return res.status(500).send({ error: "Server error" });
    }
});

//Upsert User Budget Info
app.put("/budget/:id", async (req, res) => {
    try {
        console.log(`Processing budget update for user: ${req.params.id}`);
        const userId = req.params.id;
        const { name, budgetAmount } = req.body;
        console.log("name", name);
        console.log("budgetAmount", budgetAmount);

        if (!name || budgetAmount == null) {
            return res.status(400).send({
                error: "Missing required fields: name and budgetAmount",
            });
        }

        const user = await User.findById(userId);
        console.log(user);

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        // Check if budget with the same name already exists
        const existingBudget = user.budgets.find(
            (budget) => budget.name === name
        );
        if (existingBudget) {
            // Update existing budget
            existingBudget.budgetAmount = budgetAmount;
        } else {
            // Add new budget
            user.budgets.push({
                name,
                budgetAmount,
                expensesAmount: 0,
                expensesCategory: [],
            });
        }

        const userData = await user.save();

        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error("Error processing budget:", error);
        return res.status(500).send({ error: "Server error" });
    }
});

//Delete User Budget Info
app.delete("/budget/:id/:name", async (req, res) => {
    try {
        console.log(
            `Deleting budget for user: ${req.params.id}, budget: ${req.params.name}`
        );
        const userId = req.params.id;
        const budgetName = req.params.name;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        user.budgets = user.budgets.filter(
            (budget) => budget.name !== budgetName
        );

        const userData = await user.save();

        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error("Error deleting budget:", error);
        return res.status(500).send({ error: "Server error" });
    }
});

//Retrieve User expenses Info
app.get("/expenses/:id/:name/:categoryName", async (req, res) => {
    try {
        console.log(`Retrieving expenses for user: ${req.params.id}`);
        const userId = req.params.id;
        const name = req.params.name;
        const categoryName = req.params.categoryName;

        if (!name) {
            return res
                .status(400)
                .send({ error: "Missing required fields: name" });
        }

        if (!categoryName) {
            return res
                .status(400)
                .send({ error: "Missing required fields: categoryName" });
        }

        const user = await User.findById(userId);
        console.log(user);

        if (!user) {
            return res.status(404).send({ error: "User not found" });
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
        return res.status(200).send({ status: "ok", data: existingExpense });
    } catch (error) {
        return res.status(500).send({ error: "Server error" });
    }
});

//Retrieve User expenses details Info
app.get("/expenses/:id/:name/:categoryName/:detailId", async (req, res) => {
    try {
        console.log(`Retrieving expenses for user: ${req.params.id}`);
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
        console.log(existingExpense);

        const existingExpenseDetail =
            existingExpense.expensesCategoryDetail.find(
                (expense) => expense._id.toString() === detailId
            );
        if (!existingExpenseDetail) {
            throw new Error(`Expenses Details not found`);
        }
        console.log("sdfsdf");
        console.log(existingExpenseDetail);

        return res
            .status(200)
            .send({ status: "ok", data: existingExpenseDetail });
    } catch (error) {
        return res.status(500).send({ error: "Server error" });
    }
});

//Add Expenses
app.post("/expenses/:id/:name", async (req, res) => {
    try {
        console.log(
            `Adding expenses for user: ${req.params.id}, budget: ${req.params.name}`
        );
        const userId = req.params.id;
        const budgetName = req.params.name;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const budgetIndex = user.budgets.findIndex(
            (b) => b.name === budgetName
        );
        if (budgetIndex === -1) {
            return res.status(404).send({ error: "Budget not found" });
        }

        let budget = user.budgets[budgetIndex];
        console.log("xcvxcv");
        console.log(req.body);
        let categoryIndex = budget.expensesCategory.findIndex(
            (c) => c.expensesCategoryName === req.body.expensesData.category
        );
        console.log(`category index ${categoryIndex}`);
        if (categoryIndex === -1) {
            budget.expensesCategory.push({
                expensesCategoryName: req.body.expensesData.category,
                expensesCategoryAmount: 0,
                expensesCategoryDetail: [],
            });
            categoryIndex = budget.expensesCategory.length - 1;
        }
        console.log("asdasads");

        let expenseCategory = budget.expensesCategory[categoryIndex];
        console.log("xcvxvxvc");
        console.log(`category ${expenseCategory}`);

        // Add the new expense to the category details
        expenseCategory.expensesCategoryDetail.push({
            name: req.body.expensesData.name,
            payer: req.body.expensesData.payer,
            dateCreated: new Date(req.body.expensesData.date),
            amount: req.body.expensesData.amount,
        });

        // Update category total
        expenseCategory.expensesCategoryAmount += req.body.expensesData.amount;

        // Update overall budget expensesAmount
        budget.expensesAmount += req.body.expensesData.amount;

        // Save user document
        const userData = await user.save();

        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error("Error adding expenses:", error);
        return res.status(500).send({ error: "Server error" });
    }
});

//Update the expenses detail
app.put("/expenses/:id/:name/:categoryName", async (req, res) => {
    try {
        console.log(
            `Updating expenses for user: ${req.params.id}, budget: ${req.params.name}`
        );
        const userId = req.params.id;
        const budgetName = req.params.name;
        const categoryName = req.params.categoryName;
        console.log(req.body);
        const { id, name, amount, payer, date } = req.body;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        console.log(`User ${user}`);

        const budgetIndex = user.budgets.findIndex(
            (b) => b.name === budgetName
        );
        if (budgetIndex === -1) {
            return res.status(404).send({ error: "Budget not found" });
        }

        let budget = user.budgets[budgetIndex];

        let categoryIndex = budget.expensesCategory.findIndex(
            (c) => c.expensesCategoryName === categoryName
        );

        if (categoryIndex === -1) {
            throw new Error(`Category name ${categoryName} not found`);
        }

        let expenseCategory = budget.expensesCategory[categoryIndex];

        // Update the category details based on the id given
        let categoryDetailIndex =
            expenseCategory.expensesCategoryDetail.findIndex(
                (c) => c._id.toString() === req.body.id
            );

        if (categoryDetailIndex === -1) {
            throw new Error("Expense detail not found");
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

        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error("Error updating expenses:", error);
        return res.status(500).send({ error: "Server error" });
    }
});

//Delete User Expense Info
app.delete("/expenses/:id/:name/:categoryName/:detailId", async (req, res) => {
    try {
        console.log(
            `Deleting expenses for user: ${req.params.id}, budget: ${req.params.name}`
        );
        const userId = req.params.id;
        const budgetName = req.params.name;
        const categoryName = req.params.categoryName;
        const detailId = req.params.detailId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const budgetIndex = user.budgets.findIndex(
            (b) => b.name === budgetName
        );

        let budget = user.budgets[budgetIndex];

        let categoryIndex = budget.expensesCategory.findIndex(
            (c) => c.expensesCategoryName === categoryName
        );

        if (categoryIndex === -1) {
            throw new Error(`Category name ${categoryName} not found`);
        }

        let expenseCategory = budget.expensesCategory[categoryIndex];

        // Update the category details based on the id given
        let categoryDetailIndex =
            expenseCategory.expensesCategoryDetail.findIndex(
                (c) => c._id.toString() === detailId
            );

        if (categoryDetailIndex === -1) {
            throw new Error("Expense detail not found");
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

        return res.status(200).send({ status: "ok", data: userData });
    } catch (error) {
        console.error("Error deleting expenses:", error);
        return res.status(500).send({ error: "Server error" });
    }
});

/**
 * Preferences
 */

//Read preferences
app.get("/preferences/:type", async (req, res) => {
    try {
        console.log(`Retrieving preferences for type ${req.params.type}`);
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

        return res
            .status(200)
            .send({ status: "ok", data: travelModes || interest });
    } catch (error) {
        return res.status(500).send({ error: error });
    }
});

/**
 * Itinerary
 */

//Read itinerary
app.get("/itinerary/:id", async (req, res) => {
    try {
        console.log(`Retrieving itinerary for user: ${req.params.id}`);
        const userId = req.params.id;
        // const { name, budgetAmount } = req.body;

        const user = await User.findById(userId);
        console.log(user);

        if (!user) {
            throw new Error(`User not found`);
        }

        const itineraries = user.savedPlans;
        if (!itineraries) {
            throw new Error(`Itinerary not found`);
        }

        return res.status(200).send({ status: "ok", data: itineraries });
    } catch (error) {
        return res.status(500).send({ error: error });
    }
});

app.get("/itinerary/:id/:itineraryId", async (req, res) => {
    try {
        console.log(`Retrieving itinerary for user: ${req.params.id}`);
        const userId = req.params.id;
        const itineraryId = req.params.itineraryId;

        const user = await User.findById(userId);
        console.log(user);

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

        return res.status(200).send({ status: "ok", data: plan });
    } catch (error) {
        return res.status(500).send({ error: error });
    }
});

//Add itinerary
app.post("/itinerary/:id", async (req, res) => {
    try {
        console.log(`Processing itinerary update for user: ${req.params.id}`);
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error(`User not found`);
        }

        console.log(req.body);
        console.log("sdfsdf");
        console.log(req.body.newItinerary);
        user.savedPlans.push(req.body.newItinerary);
        console.log("asdadsasd");
        await user.save();

        const createdItinerary = user.savedPlans[user.savedPlans.length - 1];

        return res.status(200).send({ status: "ok", data: createdItinerary });
    } catch (error) {
        return res.status(500).send({ error: error });
    }
});

//Update itinerary
app.put("/itinerary/:userId/:itineraryId", async (req, res) => {
    try {
        const { userId, itineraryId } = req.params;
        const updateData = req.body; // Contains the new itinerary data

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        // Find the itinerary to update
        const itineraryIndex = user.savedPlans.findIndex(
            (plan) => plan._id.toString() === itineraryId
        );
        if (itineraryIndex === -1) {
            return res.status(404).send({ error: "Itinerary not found" });
        }

        // Update only the fields provided in the request body
        Object.assign(user.savedPlans[itineraryIndex], updateData);

        // Save the updated user document
        await user.save();

        return res.status(200).send({
            message: "Itinerary updated successfully",
            updatedItinerary: user.savedPlans[itineraryIndex],
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

//Delete itinerary
app.delete("/itinerary/:userId/:itineraryId", async (req, res) => {
    try {
        const { userId, itineraryId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        // Find the index of the itinerary to delete
        const itineraryIndex = user.savedPlans.findIndex(
            (plan) => plan._id.toString() === itineraryId
        );
        if (itineraryIndex === -1) {
            return res.status(404).send({ error: "Itinerary not found" });
        }

        // Remove the itinerary from savedPlans
        user.savedPlans.splice(itineraryIndex, 1);
        const userUpdated = await user.save();

        return res.status(200).send({
            message: "Itinerary deleted successfully",
            data: userUpdated,
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

app.put("/itinerary/details/:userId/:itineraryId", async (req, res) => {
    try {
        const { userId, itineraryId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const planIndex = user.savedPlans.findIndex(
            (plan) => plan._id.toString() === itineraryId
        );
        if (planIndex === -1) {
            return res.status(404).send({ error: "Itinerary not found" });
        }

        user.savedPlans[planIndex].itinerary = req.body.itinerary;
        // console.log(user);
        console.log("dasdad");
        console.log(JSON.stringify(user.savedPlans[planIndex].itinerary));
        console.log(JSON.stringify(req.body.itinerary));
        // Mark as modified to ensure Mongoose detects the change
        user.markModified(`savedPlans.${planIndex}.itinerary`);

        console.log("saving");
        // Save the updated user document
        const userUpdated = await user.save();

        return res.status(200).send({
            message: "Itinerary deleted successfully",
            data: userUpdated,
        });
    } catch (error) {
        console.error(JSON.stringify(error));
        return res.status(500).send({ error: error.message });
    }
});

//https://www.youtube.com/watch?v=Pqo7RBh7Xh4 - mongodb, prisma and graphql
