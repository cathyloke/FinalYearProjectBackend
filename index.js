const express = require("express");
const mongoose = require("mongoose");
const mongoURL =
    "mongodb+srv://catloke963:1234@feriodb.isp9y.mongodb.net/?retryWrites=true&w=majority&appName=ferioDB";
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

const User = mongoose.model("User");

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
        console.log(`Updating user ${req.body}`);
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

//Retrieve User Budget Info
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

//https://www.youtube.com/watch?v=Pqo7RBh7Xh4 - mongodb, prisma and graphql
