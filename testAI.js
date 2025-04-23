const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

// require("dotenv").config();

const openai = new OpenAI({
    apiKey: "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",
});

app.post("/generate-itinerary", async (req, res) => {
    const {
        startDate,
        endDate,
        name,
        destination,
        budgetCategory,
        travelMode,
        interests,
    } = req.body;

    const prompt = `Create a travel itinerary for ${name} in ${destination} from ${startDate} to ${endDate} with a ${budgetCategory} budget. The user is traveling by ${travelMode} and enjoys ${interests.join(
        ", "
    )}. Provide the itinerary in JSON format like:
        [
            {
                "day": 1,
                "activities": [
                    {
                        "time": "13:00",
                        "activity": "Visit...",
                        "location": "..."
                    }
                ]
            }
        ]`;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2000,
        });

        const itineraryText = response.choices[0].message.content;
        console.log("AI Response:\n", itineraryText);
        res.json(JSON.parse(itineraryText));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3001, () => console.log("Server running on port 3001"));

/**
 * const response = await axios.post("http://localhost:3001/generate-itinerary", {
        startDate: "7 April 2025",
        endDate: "10 April 2025",
        name: "Ipoh 4 Days Trip",
        destination: "Ipoh, Perak",
        budgetCategory: "Medium",
        travelMode: "Private car",
        interests: ["Local markets", "Adventure sports"],
      });
      setItinerary(response.data);
 */
