import "./style.css";
const API_KEY = "4e9393cfb7374c6c6a437848f6050136";

window.addEventListener("load", () => {
    const location = document.getElementById("location");
    const degree = document.getElementById("degree");
    const icon = document.getElementById("icon");
    const description = document.getElementById("description");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                );

                const data = await response.json();
                console.log(data);
                location.textContent = data.timezone;
                degree.textContent = Math.round(data.current.temp * 10) / 10;
                icon.setAttribute(
                    "src",
                    `../assets/icons/${data.current.weather[0].icon}.png`
                );
                description.textContent = data.current.weather[0].description;
            } catch (error) {}
        });
    }
});
