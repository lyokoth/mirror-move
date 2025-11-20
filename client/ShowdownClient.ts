import WebSocket from "ws";
import fetch from "node-fetch";
import { URLSearchParams } from "url";

export class ShowdownClient {
    private ws!: WebSocket;
    private username: string;
    private password: string;
    private server: string;
    private connected: boolean = false;

    constructor(username: string, password: string, server: string) {
        this.username = username;
        this.password = password;
        this.server = server;
    }

    public connect(server: string = "ws://sim3.psim.us:8000/showdown/websocket") {
        this.ws = new WebSocket(server);

        this.ws.on("open", () => {
            console.log("[Mirror Move] Connected to Showdown server.");
            this.connected = true;

        });
        this.ws.on("message", (data: WebSocket.Data) => {
            const msg = data.toString();
            this.handleMessage(msg);

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

    private async handleMessage(msg: string) {
        const lines = msg.split("\n");
        console.log("[Showdown] Received message:", lines);

        //handling login and challstr
        if (msg.startsWith("|challstr|")) {
            const challstr = lines.split("|challstr|")[1];
            this.login(challstr);
        }
        //handling battle messages
        if (msg.startsWith("/battle")) {{
            this.handleBattleMessage(msg);
        
        }}
    }
    
    private async login(challstr: string) {
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
    const jsonStr = text.substring(1);
    const json = JSON.parse(jsonStr);

    if (!json.assertion) {
        console.error("[Mirror Move] Login failed:", json);
        return;
    }

    const assertion = json.assertion;
    this.ws.send(`|/trn ${this.username},0,${assertion}`);
    console.log("[Mirror Move] Logged in as " + this.username + ".");
    
}

    private handleBattleMessage(msg: string) {
        // TODO: parse battle messages, send moves, call AI
        const lines = msg.split("\n");
        const battleId = lines[0].split("/battle-")[1];
        console.log(`[Mirror Move] Battle message for ${battleId}:`, lines);
    }

    public sendMessage(msg: string) {
        if (this.connected) {
            this.ws.send(msg);
        }
    }

    public disconnect() {
        if (this.connected) {
            this.ws.close();
        }
    }
}
