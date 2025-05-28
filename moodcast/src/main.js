import "./style.css";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const WEATHER_API_KEY = "4e9393cfb7374c6c6a437848f6050136";

const fetchBtn = document.getElementById("fetchBtn");
const moodBtnDiv = document.getElementById("mood-btn-div");
const moodBtns = document.getElementsByClassName("mood-btn");
const weatherInfo = document.getElementById("weather");

let mood = "";
let weatherDescription = "";
let temperature = 0;

fetchBtn.addEventListener("click", () => {
    const location = document.getElementById("location");
    const degree = document.getElementById("degree");
    const icon = document.getElementById("icon");
    const description = document.getElementById("description");
    const body = document.querySelector("body");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
                );

                const data = await response.json();
                console.log(data);

                weatherDescription = data.current.weather[0].description;
                temperature = Math.round(data.current.temp * 10) / 10;

                location.textContent = data.timezone;
                degree.textContent = `${temperature} °C`;
                icon.setAttribute(
                    "src",
                    `../assets/icons/${data.current.weather[0].icon}.png`
                );
                description.textContent = weatherDescription;
                body.style.backgroundImage = `url("../assets/backgrounds/${data.current.weather[0].icon}.jpg")`;

                fetchBtn.classList.toggle("hidden");
                weatherInfo.classList.remove("hidden");
                weatherInfo.classList.add("flex");
                moodBtnDiv.classList.toggle("hidden");
            } catch (error) {
                console.error("Weather API error:", error);
            }
        });
    }
});

async function getSuggestions(mood, description, temperature) {
    const prompt = `It's ${temperature}°C and ${description.toLowerCase()}.
I'm feeling ${mood.toLowerCase()}.
Suggest a fun:
- 🎵 Song
- 🎬 Movie
- 🧘 Activity
Keep it short, creative, and friendly.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI error: ${errorData.error.message}`);
    }

    const data = await response.json();
    console.log(data);
    return data.choices[0].message.content;
}

Array.from(moodBtns).forEach((btn) => {
    btn.addEventListener("click", () => {
        console.log("Clicked:", btn.dataset.mood);
        mood = btn.dataset.mood;

        getSuggestions(mood, weatherDescription, temperature)
            .then((suggestion) => {
                const suggestionsDiv = document.getElementById("suggestions");

                // Split the suggestion string by newline
                const lines = suggestion
                    .split("\n")
                    .filter((line) => line.trim() !== "");

                // Create HTML elements for each suggestion
                const formatted = lines
                    .map((line) => {
                        const [label, content] = line.split(":");
                        return `<p><strong>${label.trim()}:</strong> ${content.trim()}</p>`;
                    })
                    .join("");

                suggestionsDiv.innerHTML = formatted;
                suggestionsDiv.classList.remove("hidden");
            })
            .catch((error) => {
                console.error("AI error:", error);
            });
    });
});
