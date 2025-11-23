import dotenv from "dotenv";
dotenv.config();

import { ShowdownClient } from "./ShowdownClient";

// Create the bot instance using your credentials
const showdown = new ShowdownClient(
    process.env.SHOWDOWN_USER!,       // your bot’s username
    process.env.SHOWDOWN_PASSWORD!,   // your bot’s password
    "ws://sim3.psim.us:8000/showdown/websocket"
);

// Start connection
console.log("[Mirror Move] Starting Showdown bot...");
showdown.connect();
