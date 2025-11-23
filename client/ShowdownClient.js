// ShowdownClient.js
import WebSocket from "ws";
import fetch from "node-fetch";
import { URLSearchParams, fileURLToPath } from "url";
import path from "path";
import fs from "fs";


// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to team.json in root folder
const TEAM_PATH = path.join(__dirname, '../team1.json');

// Read and parse the team JSON
const TEAM = JSON.parse(fs.readFileSync(TEAM_PATH, 'utf8'));

console.log(TEAM);

export class ShowdownClient {
    constructor(username, password, server = "ws://localhost.psim.us:8000/showdown/websocket") {
        this.username = username;
        this.password = password;
        this.server = server;
        this.ws = null;
        this.connected = false;
        this.battles = {}; // store ongoing battles
    }

    // Connect to server
    connect() {
        this.ws = new WebSocket(this.server);

        this.ws.on("open", () => {
            console.log("[Mirror Move] Connected to Showdown server.");
            this.connected = true;
        });

        this.ws.on("message", (data) => {
            const msg = data.toString();
            const lines = msg.split("\n").filter(Boolean);
            this.handleMessage(lines);
        });

        this.ws.on("close", () => {
            console.log("[Mirror Move] Disconnected from Showdown server.");
            this.connected = false;
        });

        this.ws.on("error", (err) => {
            console.error("[Mirror Move] WebSocket error:", err);
            this.connected = false;
        });
    }

    // Handle incoming messages
    async handleMessage(lines) {
        for (const line of lines) {
            // Login challstr
            if (line.startsWith("|challstr|")) {
                const challstr = line.split("|challstr|")[1];
                await this.login(challstr);

            // Successful login
            } else if (line.startsWith("|updateuser|")) {
                console.log("[Showdown] Logged in successfully as", this.username);
                this.joinLobby();
                this.autoChallenge("LynOkoth"); // replace with your username

            // New battle started
            } else if (line.startsWith("|update|") && line.includes("battle-")) {
                const battleId = line.split("battle-")[1].split("|")[0];
                if (!this.battles[battleId]) {
                    console.log(`[Mirror Move] Joined battle ${battleId}`);
                    this.battles[battleId] = {};
                }

            // Battle request (your turn)
            } else if (line.startsWith("|request|")) {
                const [_, battleId, requestJson] = line.split("|request|");
                this.handleBattleRequest(battleId, requestJson);

            // Turn info
            } else if (line.startsWith("|turn|")) {
                console.log("[Mirror Move] New turn:", line);

            // Battle ended
            } else if (line.startsWith("|win|")) {
                const winner = line.split("|win|")[1];
                console.log(`[Mirror Move] Battle ended. Winner: ${winner}`);

            // Incoming challenges
            } else if (line.startsWith("|updatechallenges|")) {
                const challenges = JSON.parse(line.split("|updatechallenges|")[1]);
                if (challenges.challengesFrom) {
                    for (const user in challenges.challengesFrom) {
                        console.log(`[Mirror Move] Accepting challenge from ${user}`);
                        this.sendMessage(`|/accept ${user}`);
                    }
                }
            }

            // Battle started, send team
            else if (line.startsWith("|start|")) {
                const battleId = line.split("|start|")[1];
                console.log(`[Mirror Move] Sending team for battle ${battleId}`);
                this.sendTeam(battleId);
            }
        }
    }

    // Login using challstr
    async login(challstr) {
        console.log("[Mirror Move] Logging in...");

        const res = await fetch("https://play.pokemonshowdown.com/api/login", {
            method: "POST",
            body: new URLSearchParams({
                act: "login",
                name: this.username,
                pass: this.password,
                challstr: challstr,
            }),
        });

        const text = await res.text();
        const json = JSON.parse(text.slice(1)); // remove leading |

        if (!json.assertion) {
            console.error("[Mirror Move] Login failed", json);
            return;
        }

        this.ws.send(`|/trn ${this.username},0,${json.assertion}`);
        console.log("[Mirror Move] Logged in as " + this.username);
    }

    // Send prebuilt team
    sendTeam(battleId) {
        const teamStr = team.map(p => {
            const moves = p.moves.join(",");
            return `${p.species}|${p.item}|${p.ability}|${moves}|${p.nature}|${p.level}`;
        }).join("\n");

        this.sendMessage(`|/team ${teamStr}`, battleId);
    }

    // Handle battle request (simple AI: random move)
    handleBattleRequest(battleId, requestJson) {
        try {
            const request = JSON.parse(requestJson);
            if (!request || !request.active) return;

            const moves = request.active[0].moves;
            if (moves && moves.length > 0) {
                const moveIndex = Math.floor(Math.random() * moves.length);
                const moveName = moves[moveIndex].id;
                this.sendMessage(`|/choose move ${moveIndex + 1}`, battleId);
                console.log(`[Mirror Move] Battle ${battleId}: Chose move ${moveName}`);
            }
        } catch (err) {
            console.error("[Mirror Move] Failed to parse battle request:", err);
        }
    }

    // Send a message (optionally to a specific battle)
    sendMessage(msg, battleId = null) {
        if (!this.connected) return;
        if (battleId) msg = `>${battleId}\n${msg}`;
        this.ws.send(msg);
    }

    // Join lobby
    joinLobby() {
        if (!this.connected) return;
        console.log("[Mirror Move] Joining the lobby...");
        this.sendMessage("|/join lobby");
    }

    // Auto-challenge specific user
    autoChallenge(user) {
        if (!this.connected) return;
        console.log(`[Mirror Move] Challenging user: ${user}`);
        this.sendMessage(`|/challenge ${user}`);
    }

    // Disconnect
    disconnect() {
        if (this.connected) this.ws.close();
    }
}
