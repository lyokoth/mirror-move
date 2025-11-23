import dotenv from "dotenv";
dotenv.config();

import { ShowdownClient } from "./ShowdownClient.js";

// Create the bot instance using your credentials
const server = process.env.SHOWDOWN_SERVER || "ws://localhost.psim.us:8000/showdown/websocket";
const bot = new ShowdownClient(
    process.env.SHOWDOWN_USER,       // your bot’s username
    process.env.SHOWDOWN_PASSWORD,   // your bot’s password
    "ws://localhost.psim.us:8000/showdown/websocket" // Showdown server URL
);



// Start connection
console.log("[Mirror Move] Logging in as " + process.env.SHOWDOWN_USER + "to " + bot.server);
bot.connect();