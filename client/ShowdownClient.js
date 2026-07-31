import WebSocket from "ws";
import fetch from "node-fetch";
import { URLSearchParams, fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to gen9randombattle.json data file
const RANDBATS_PATH = path.join(__dirname, "../data/randbats/gen9randombattle.json");

// Read and parse the Random Battle dataset
let RANDBATS_DATA = {};
try {
    RANDBATS_DATA = JSON.parse(fs.readFileSync(RANDBATS_PATH, "utf8"));
    console.log("[Mirror Move] Loaded randbats database successfully.");
} catch (err) {
    console.error("[Mirror Move] Could not load randbats data file:", err.message);
}

export class ShowdownClient {
    constructor(username, password, server = "wss://sim3.psim.us/showdown/websocket") {
        this.username = username;
        this.password = password;
        this.server = server;
        this.ws = null;
        this.connected = false;
        this.isLoggingIn = false;
        this.loggedIn = false;
        this.hasChallenged = false;
        this.battles = {};
    }

    connect() {
        this.ws = new WebSocket(this.server);

        this.ws.on("open", () => {
            console.log("[Mirror Move] Connected to Showdown server.");
            this.connected = true;
        });

        this.ws.on("message", (data) => {
            const msg = data.toString();
            const lines = msg.split("\n").filter(Boolean);
            
            for (const line of lines) {
                if (line.trim()) {
                    // Mute general lobby chat and user presence logs to keep terminal clean
                    const isChatOrPresence = line.includes("|c|") || line.includes("|c:|") || line.startsWith("|j|") || line.startsWith("|l|") || line.startsWith("|J|") || line.startsWith("|L|");
                    if (!isChatOrPresence) {
                        console.log(`[WS IN] ${line}`);
                    }
                }
            }
            this.handleMessage(lines);
        });

        this.ws.on("close", () => {
            console.log("[Mirror Move] Disconnected from Showdown server.");
            this.connected = false;
            this.isLoggingIn = false;
            this.loggedIn = false;
            this.hasChallenged = false;
        });

        this.ws.on("error", (err) => {
            console.error("[Mirror Move] WebSocket error:", err);
            this.connected = false;
            this.isLoggingIn = false;
            this.loggedIn = false;
            this.hasChallenged = false;
        });
    }

    async handleMessage(lines) {
        let currentRoom = "";

        if (lines[0] && lines[0].startsWith(">")) {
            currentRoom = lines[0].substring(1);
        }

        for (const line of lines) {
            const parts = line.split("|");

            // Room / Battle initialization & URL logger
            if (parts[1] === "init" && parts[2] === "battle") {
                const battleUrl = `https://play.pokemonshowdown.com/${currentRoom}`;
                console.log(`[Mirror Move] Battle started! Watch here: ${battleUrl}`);

                // Leave lobby room to mute background chat during matches
                this.sendMessage("/leave lobby");

            // Login challstr
            } else if (line.startsWith("|challstr|")) {
                const challstr = line.split("|challstr|")[1];
                await this.login(challstr);

            // Successful login acknowledgment from Showdown
            } else if (line.includes("|updateuser|")) {
                const updateLine = line.substring(line.indexOf("|updateuser|"));
                const updateParts = updateLine.split("|");
                const username = updateParts[2] ? updateParts[2].trim() : "";
                const isNamed = updateParts[3] === "1";

                if (isNamed && username.toLowerCase() === this.username.toLowerCase()) {
                    console.log(`[Showdown] Logged in successfully as ${username}`);
                    
                    // Join lobby and trigger challenge sequence
                    this.joinLobbyAndChallenge();
                }

            // New battle room joined
            } else if (line.startsWith("|update|") && line.includes("battle-")) {
                const battleId = line.split("battle-")[1].split("|")[0];
                if (!this.battles[battleId]) {
                    console.log(`[Mirror Move] Joined battle ${battleId}`);
                    this.battles[battleId] = {};
                }

            // Battle request (Your turn)
            } else if (line.startsWith("|request|")) {
                const rawData = line.slice(9);
                if (rawData) {
                    this.handleBattleRequest(currentRoom, rawData);
                }

            // Turn info
            } else if (line.startsWith("|turn|")) {
                console.log("[Mirror Move] New turn:", line);

            // Battle ended
            } else if (line.startsWith("|win|")) {
                const winner = line.split("|win|")[1];
                console.log(`[Mirror Move] Battle ended. Winner: ${winner}`);

            // Incoming challenges
            } else if (line.startsWith("|updatechallenges|")) {
                try {
                    const challenges = JSON.parse(line.split("|updatechallenges|")[1]);
                    if (challenges.challengesFrom) {
                        for (const challengerUser in challenges.challengesFrom) {
                            console.log(`[Mirror Move] Accepting challenge from ${challengerUser}`);
                            this.sendMessage(`/accept ${challengerUser}`);
                        }
                    }
                } catch (e) {
                    // Ignore malformed JSON
                }
            }
        }
    }

    // Login using challstr
    async login(challstr) {
        if (this.isLoggingIn || this.loggedIn) return;
        this.isLoggingIn = true;

        console.log("[Mirror Move] Attempting to log in as " + this.username + "...");
        console.log(`[Mirror Move] Raw Password String:`, JSON.stringify(this.password ? this.password : "No password provided"));

        try {
            const bodyParams = new URLSearchParams({
                act: "login",
                name: this.username,
                pass: this.password || "",
                challstr: challstr,
            });

            const res = await fetch("https://play.pokemonshowdown.com/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: bodyParams.toString(),
            });

            const text = await res.text();

            // Strip leading ']' character returned by Showdown API
            const cleanedText = text.startsWith("]") ? text.slice(1) : text;
            const json = JSON.parse(cleanedText);

            if (!json.assertion) {
                console.error("[Mirror Move] Login failed. Server response:", json);
                this.isLoggingIn = false;
                return;
            }

            // Send login assertion token back over WebSocket
            this.ws.send(`|/trn ${this.username},0,${json.assertion}`);
            this.loggedIn = true;
            this.isLoggingIn = false;
            console.log("[Mirror Move] Sent assertion token to Showdown server.");
        } catch (err) {
            console.error("[Mirror Move] Error during login request:", err.message);
            this.isLoggingIn = false;
        }
    }

    // Helper to query possible set info for a given species
    getRandbatsData(speciesName) {
        const key = speciesName.toLowerCase().replace(/[^a-z0-9]/g, "");
        return RANDBATS_DATA[key] || null;
    }

    // Handle battle request (chooses valid moves)
    handleBattleRequest(battleId, requestJson) {
        try {
            const request = JSON.parse(requestJson);
            if (!request || request.wait || !request.active) return;

            const moves = request.active[0].moves;
            if (!moves || moves.length === 0) return;

            const validMoves = [];
            for (let i = 0; i < moves.length; i++) {
                if (!moves[i].disabled) validMoves.push(i + 1);
            }

            const chosenIndex = validMoves[Math.floor(Math.random() * validMoves.length)] || 1;

            this.sendMessage(`/choose move ${chosenIndex}`, battleId);
            console.log(`[Mirror Move] Battle ${battleId}: Chose move slot ${chosenIndex}`);
        } catch (err) {
            console.error("[Mirror Move] Failed to process battle request:", err);
        }
    }

    // Send a message
    sendMessage(message, room = "") {
        if (!this.ws || this.ws.readyState !== 1) return;
        const payload = room ? `${room}|${message}` : `|${message}`;
        console.log(`[WS OUT] ${payload}`);
        this.ws.send(payload);
    }

    // Join lobby & fire auto challenge sequence
    joinLobbyAndChallenge() {
        if (!this.connected || this.hasChallenged) return;
        this.hasChallenged = true;

        console.log("[Mirror Move] Joining lobby...");
        this.sendMessage("/join lobby");

        console.log("[Mirror Move] Waiting 2s before issuing challenge...");
        setTimeout(() => {
            const challenger = process.env.SHOWDOWN_CHALLENGER || "kenya_megami";
            this.autoChallenge(challenger);
        }, 2000);
    }

    // Auto-challenge specific user to Gen 9 Random Battle
    autoChallenge(user) {
        if (!this.connected) return;
        const targetUser = user || process.env.SHOWDOWN_CHALLENGER || "kenya_megami";
        console.log(`[Mirror Move] Challenging user: ${targetUser}`);

        // Send PM first
        this.sendMessage(`/pm ${targetUser}, I have challenged you to a Gen 9 Random Battle!`);

        // Wait half a second before sending challenge packet
        setTimeout(() => {
            this.sendMessage(`/challenge ${targetUser}, gen9randombattle`);
        }, 500);
    }

    // Disconnect
    disconnect() {
        if (this.connected) this.ws.close();
    }
}