const mongoose = require("mongoose");

const mongoURL =
    "mongodb+srv://catloke963:1234@feriodb.isp9y.mongodb.net/?retryWrites=true&w=majority&appName=ferioDB";
mongoose.connect(mongoURL);

const Interest = mongoose.model(
    "Interest",
    new mongoose.Schema({
        name: String,
    })
);

const TravelMode = mongoose.model(
    "TravelMode",
    new mongoose.Schema({
        name: String,
    })
);

async function seedDB() {
    try {
        await Interest.deleteMany({});
        await TravelMode.deleteMany({});
        console.log("Existing data cleared");

        await Interest.insertMany([
            { name: "Adventure & Outdoor" },
            { name: "Culture & History" },
            { name: "Food & Drinks" },
            { name: "Relaxation & Wellness" },
            { name: "Entertainment & Nightlife" },
            { name: "Nature & Scenic Spots" },
            { name: "Shopping & Luxury" },
            { name: "Sports & Events" },
            { name: "Eco-Tourism" },
            { name: "Technology & Innovation" },
            { name: "Music & Festivals" },
            { name: "Spiritual & Religious Travel" },
            { name: "Photography" },
            { name: "Wildlife & Safaris" },
            { name: "Cruise & Island Hopping" },
            { name: "Skiing & Snowboarding" },
            { name: "Road Trips" },
            { name: "Backpacking & Budget Travel" },
            { name: "Luxury Travel" },
            { name: "Volunteering & Social Impact Travel" },
        ]);

        await TravelMode.insertMany([
            { name: "Air Travel" },
            { name: "Road Trip" },
            { name: "Rail Travel" },
            { name: "Cruise & Ferry" },
            { name: "Eco-friendly Travel" },
            { name: "Adventure Travel" },
            { name: "Cycling" },
            { name: "Walking & Hiking" },
            { name: "Self-Driving" },
            { name: "Public Transport" },
            { name: "Luxury Travel" },
        ]);

        console.log("Database seeded successfully");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
    }
}

seedDB();
