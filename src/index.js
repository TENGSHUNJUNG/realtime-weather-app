import React from "react";
import ReactDOM from "react-dom/client";
import WeatherApp from "./WeatherApp";

import "./styles.css";

function App() {
    return <WeatherApp />;
}

const rootElement = ReactDOM.createRoot(document.getElementById("root"));
rootElement.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
