// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/weather", async (req, res) => {
    const { lat, lon } = req.query;

    try {
        const weatherRes = await axios.get(
            `https://api.openweathermap.org/data/3.0/onecall`,
            {
                params: {
                    lat,
                    lon,
                    units: "metric",
                    appid: process.env.WEATHER_API_KEY,
                },
            }
        );

        res.json(weatherRes.data);
    } catch (error) {
        console.error(
            "Weather API error:",
            error.response?.data || error.message
        );
        res.status(500).json({ error: "Failed to fetch weather" });
    }
});

app.post("/api/suggestions", async (req, res) => {
    const { mood, description, temperature } = req.body;

    const prompt = `It's ${temperature}°C and ${description.toLowerCase()}.
I'm feeling ${mood.toLowerCase()}.
Suggest a fun:
- 🎵 Song
- 🎬 Movie
- 🧘 Activity
Keep it short, creative, and friendly.`;

    try {
        const openaiResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const suggestion = openaiResponse.data.choices[0].message.content;
        res.json({ suggestion });
    } catch (error) {
        console.error("OpenAI error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get suggestions" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
