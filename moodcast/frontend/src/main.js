import "./style.css";

const fetchBtn = document.getElementById("fetchBtn");
const moodBtnDiv = document.getElementById("mood-btn-div");
const moodBtns = document.getElementsByClassName("mood-btn");
const moodBtnsLine = document.getElementById("mood-btns-line");
const weatherInfo = document.getElementById("weather");
const weatherLoader = document.getElementById("weather-loader");
const suggestionLoader = document.getElementById("suggestion-loader");
const suggestionsDiv = document.getElementById("suggestions");
const cooldownDiv = document.getElementById("cooldown");
const cooldownTimer = document.getElementById("cooldown-timer");
const moodBtnArr = Array.from(moodBtns);
const moodChgBtn = document.getElementById("mood-change-btn");
const moodP = document.getElementById("mood-p");

let mood = "";
let weatherDescription = "";
let temperature = 0;
let isCooldown = false;

function showLoader(loader) {
    loader.classList.remove("hidden");
}

function hideLoader(loader) {
    loader.classList.add("hidden");
}

function moodBtnActive() {
    moodBtnArr.forEach((btn) => {
        btn.toggleAttribute("disabled");
        btn.classList.toggle("disabled:bg-gray-500");
    });
}

function startCooldown(seconds = 30) {
    isCooldown = true;
    cooldownDiv.classList.remove("hidden");
    moodP.classList.add("hidden");

    let remaining = seconds;
    cooldownTimer.textContent = remaining;

    const interval = setInterval(() => {
        remaining--;

        cooldownTimer.classList.remove("scale-100");
        cooldownTimer.classList.add("scale-75", "opacity-50");

        setTimeout(() => {
            cooldownTimer.textContent = remaining;
            cooldownTimer.classList.remove("scale-75", "opacity-50");
            cooldownTimer.classList.remove("scale-100");
        }, 100);

        if (remaining <= 0) {
            clearInterval(interval);
            isCooldown = false;
            cooldownDiv.classList.add("hidden");
            moodBtnActive();
            moodBtnsLine.classList.remove("hidden");
            moodP.classList.remove("hidden");
            moodP.textContent = "What's your mood?";
        }
    }, 1000);
}

fetchBtn.addEventListener("click", () => {
    const location = document.getElementById("location");
    const degree = document.getElementById("degree");
    const icon = document.getElementById("icon");
    const description = document.getElementById("description");
    const body = document.querySelector("body");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            showLoader(weatherLoader);
            try {
                const response = await fetch(
                    `https://moodcast-6bd269b99874.herokuapp.com/api/weather?lat=${latitude}&lon=${longitude}`
                );

                const data = await response.json();
                console.log(data);

                weatherDescription = data.current.weather[0].description;
                temperature = Math.round(data.current.temp * 10) / 10;

                location.textContent = data.timezone;
                degree.textContent = `${temperature} °C`;
                const iconPath = `/icons/${data.current.weather[0].icon}.png`;
                icon.setAttribute("src", iconPath);
                description.textContent = weatherDescription;
                const backgroundPath = `url("/backgrounds/${data.current.weather[0].icon}.jpg")`;
                body.style.backgroundImage = backgroundPath;

                fetchBtn.classList.toggle("hidden");
                weatherInfo.classList.remove("hidden");
                weatherInfo.classList.add("flex");
                moodBtnDiv.classList.toggle("hidden");
            } catch (error) {
                console.error("Weather API error:", error);
            } finally {
                hideLoader(weatherLoader);
            }
        });
    }
});

async function getSuggestions(mood, description, temperature) {
    try {
        const response = await fetch(
            "https://moodcast-6bd269b99874.herokuapp.com/api/suggestions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mood, description, temperature }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server error: ${errorData.error}`);
        }

        const data = await response.json();
        return data.suggestion;
    } catch (error) {
        console.error("Frontend suggestion fetch error:", error);
        throw error;
    }
}

moodBtnArr.forEach((btn) => {
    btn.addEventListener("click", () => {
        console.log("Clicked:", btn.dataset.mood);
        mood = btn.dataset.mood;
        suggestionsDiv.classList.add("hidden");
        moodBtnActive();
        showLoader(suggestionLoader);

        getSuggestions(mood, weatherDescription, temperature)
            .then((suggestion) => {
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
            })
            .finally(() => {
                hideLoader(suggestionLoader);
                moodChgBtn.classList.remove("hidden");
                moodBtnsLine.classList.add("hidden");
                moodP.textContent = mood;
            });
    });
});

moodChgBtn.addEventListener("click", () => {
    startCooldown(60);
    suggestionsDiv.classList.add("hidden");
    moodChgBtn.classList.add("hidden");
});
