import dotenv from "dotenv";
dotenv.config();

import { ShowdownClient } from "./ShowdownClient.js";

// Creating the showdown client, login, and server connection
const server = process.env.SHOWDOWN_SERVER || "ws://localhost.psim.us:8000/showdown/websocket";
const bot = new ShowdownClient(
    process.env.SHOWDOWN_USERNAME,       
    process.env.SHOWDOWN_PASSWORD,   
    server
);



// Start connection
console.log("[Mirror Move] Logging in as:  " + process.env.SHOWDOWN_USERNAME  + "  to  " + bot.server);
bot.connect();