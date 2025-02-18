const express = require('express')
const mongoose = require('mongoose');
const mongoURL = "mongodb+srv://catloke963:1234@feriodb.isp9y.mongodb.net/?retryWrites=true&w=majority&appName=ferioDB"
const app = express()
app.use(express.json())
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
    res.send("Server is working");
});

mongoose.connect(mongoURL)
    .then(() => {
        console.log('Database Connected!')
    }).catch((error) => {
        console.error(error)
    });
require('./User')

const User = mongoose.model("User")

// app.get('/', function (req, res) {
//     res.send('Hello World')
// })

app.listen(3000, () => {
    console.log("server is running on port 3000")
});

app.post('/register', async (req, res) => {
    try {
        console.log(`Registering user ${req.body}`)
        const { name, gender, email, password } = req.body;
        const oldUser = await User.findOne({ email: email })

        if (oldUser) {
            return res.status(400).send({ error: "User already exists" });
        }

        const newUser = await User.create({
            name: name,
            gender: gender,
            email: email,
            password: password
        });
        console.log('user created')

        return res.status(201).send({ status: "ok", data: newUser });
    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: "Internal Server Error" });
    }
})

app.post('/login', async (req, res) => {
    try {
        console.log(`Logging user ${req.body}`)
        const { email, password } = req.body;
        const userExist = await User.findOne({ email: email })

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
})

app.get('/read/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // console.log(userId)
        const user = await User.findById(userId);  // Fetch user by _id
        // console.log(JSON.stringify(user))

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        return res.status(200).send({ status: "ok", data: user });
    } catch (error) {
        return res.status(500).send({ error: "Server error" });
    }
});

app.put('/update/:id', async (req, res) => {
    try {
        console.log(`Updating user ${req.body}`)
        const userId = req.params.id;
        const updates = req.body;
        // console.log(userId)
        // console.log(JSON.stringify(updates))

        const result = await User.updateOne({ _id: userId }, { $set: updates });

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: "User not found" });
        }

        return res.status(200).send({ status: "ok", message: "User updated successfully" });
    } catch (error) {
        return res.status(500).send({ error: "Server error" });
    }
})

app.post('/budget/:id', async (req, res) => {
    try {
        console.log(`Processing budget update for user: ${req.params.id}`);
        const userId = req.params.id;
        const { name, budgetAmount } = req.body;

        if (!name || budgetAmount == null) {
            return res.status(400).send({ error: "Missing required fields: name and budgetAmount" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        // Check if budget with the same name already exists
        const existingBudget = user.budgets.find(budget => budget.name === name);
        if (existingBudget) {
            // Update existing budget
            existingBudget.budgetAmount = budgetAmount;
        } else {
            // Add new budget
            user.budgets.push({ name, budgetAmount, expensesAmount: 0, expensesCategory: [] });
        }

        await user.save();
        return res.status(200).send({ status: "ok", message: "Budget processed successfully" });
    } catch (error) {
        console.error("Error processing budget:", error);
        return res.status(500).send({ error: "Server error" });
    }
});


app.delete('/budget/:id/:name', async (req, res) => {
    try {
        console.log(`Deleting budget for user: ${req.params.id}, budget: ${req.params.name}`);
        const userId = req.params.id;
        const budgetName = req.params.name;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        user.budgets = user.budgets.filter(budget => budget.name !== budgetName);

        await user.save();
        return res.status(200).send({ status: "ok", message: "Budget deleted successfully" });
    } catch (error) {
        console.error("Error deleting budget:", error);
        return res.status(500).send({ error: "Server error" });
    }
});