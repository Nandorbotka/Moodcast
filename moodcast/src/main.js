import "./style.css";
const API_KEY = "4e9393cfb7374c6c6a437848f6050136";
const fetchBtn = document.getElementById("fetchBtn");
const moodBtnDiv = document.getElementById("mood-btn-div");
const AI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const moodBtn = document.getElementsByClassName("mood-btn");
let mood = "";
let weatherDescription = "";
let temperature = 0;

window.addEventListener("load", () => {
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
                    `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                );

                const data = await response.json();
                console.log(data);
                weatherDescription = data.current.weather[0].description;
                temperature = Math.round(data.current.temp * 10) / 10 + " C°";
                location.textContent = data.timezone;
                degree.textContent = temperature;
                icon.setAttribute(
                    "src",
                    `../assets/icons/${data.current.weather[0].icon}.png`
                );
                description.textContent = weatherDescription;
                body.setAttribute(
                    "style",
                    `background-image: url("../assets/backgrounds/${data.current.weather[0].icon}.jpg")`
                );
                fetchBtn.classList.toggle("hidden");
                moodBtnDiv.classList.toggle("hidden");
                return weatherDescription;
            } catch (error) {}
        });
    }
});

async function getSuggestions(mood, description, temprature) {
    const prompt = `It's ${temprature}°C and ${description.toLowerCase()}. 
I'm feeling ${mood.toLowerCase()}. 
Suggest a fun:
- 🎵 Song
- 🎬 Movie
- 🧘 Activity
Keep it short, creative, and friendly. 
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
        }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Something went wrong";
}

console.log("KAKAA");

Array.from(moodBtn).forEach((btn) => {
    btn.addEventListener("click", () => {
        console.log("Clicked:", btn.dataset.mood);
        mood = btn.dataset.mood;

        getSuggestions(mood, weatherDescription, temperature)
            .then((suggestion) => {
                document.getElementById("suggestions").textContent = suggestion;
            })
            .catch((error) => {
                console.error("AI error:", error);
            });
    });
});
