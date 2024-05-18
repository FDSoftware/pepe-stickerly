import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div>
      <div className="flex flex-col justify-center items-center text-center">
        <div className="content">
          <h2>$Motorboat</h2>
          <h2>$Motorboat</h2>
        </div>
        <h1 className=" freeman mt-12  py-4  animate-jump-in animate-duration-700 animate-ease-in-out">
          Hi anon, make a meme
        </h1>

        <App />
      </div>
      <footer>
        Powered by
        <a href="https://www.github.com/fiammamuscari" target="_blank">
          &nbsp;Motorboat
        </a>
      </footer>
    </div>
  </React.StrictMode>
);
