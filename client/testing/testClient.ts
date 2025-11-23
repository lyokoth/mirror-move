import { ShowdownClient } from "../ShowdownClient";
import dotenv from "dotenv";

dotenv.config();

const username = process.env.SHOWDOWN_USER || "MirrorMoveAI";
const password = process.env.SHOWDOWN_PASSWORD || "summer3214";

const client = new ShowdownClient(
    username, 
    password, 
    "ws://sim3.psim.us:8000/showdown/websocket");

client.connect();

setTimeout(() => {
    console.log("[Test] User: MirrorMove has connected to the server.");
}, 3000);

