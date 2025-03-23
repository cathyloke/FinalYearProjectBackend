const mongoose = require("mongoose");

const mongoURL =
    "mongodb+srv://catloke963:1234@feriodb.isp9y.mongodb.net/feriodb?retryWrites=true&w=majority&appName=ferioDB";

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
            { name: "art" },
            { name: "theater" },
            { name: "museums" },
            { name: "history" },
            { name: "architecture" },
            { name: "cultural events" },
            { name: "hiking" },
            { name: "wildlife" },
            { name: "beaches" },
            { name: "national parks" },
            { name: "adventure sports" },
            { name: "cuisine" },
            { name: "street food" },
            { name: "wine tasting" },
            { name: "breweries" },
            { name: "fine dining" },
            { name: "spa" },
            { name: "yoga retreats" },
            { name: "relaxation" },
            { name: "resorts" },
            { name: "shopping" },
            { name: "luxury brands" },
            { name: "local markets" },
            { name: "theme parks" },
            { name: "zoos" },
            { name: "kid-friendly activities" },
            { name: "bars" },
            { name: "clubs" },
            { name: "live music" },
            { name: "theater shows" },
            { name: "sports events" },
            { name: "fitness" },
            { name: "cycling" },
            { name: "tech" },
            { name: "innovation" },
            { name: "conventions" },
            { name: "photography" },
            { name: "scenic views" },
        ]);

        await TravelMode.insertMany([
            { name: "walking" },
            { name: "public transport" },
            { name: "rental car" },
            { name: "bike" },
            { name: "guided tours" },
            { name: "private car" },
            { name: "scooter" },
            { name: "rideshare" },
            { name: "mixed" },
        ]);

        console.log("Database seeded successfully");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
    }
}

seedDB();
