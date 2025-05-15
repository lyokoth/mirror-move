const WebSocket = require('ws');
const axios = require('axios');
const { SHOWDOWN_SERVER, USERNAME, PASSWORD, FORMAT } = require('./config');
const { makeBattleMove } = require('./battleAI');

const ws = new WebSocket(SHOWDOWN_SERVER);

function startShowdownConnection() {
    ws.on('open', () => {
        console.log("✅ Connected to Pokémon Showdown!");
        ws.send('|/cmd rooms');
    });

    ws.on('message', (data) => {
        const message = data.toString().trim();
        console.log("📥 Received:", message);

        if (message.startsWith('|challstr|')) {
            const challstr = message.split('|')[2] + '|' + message.split('|')[3];
            loginToShowdown(challstr);
        }

        if (message.includes('|updateuser|') && message.includes(USERNAME)) {
            console.log(`✅ Logged in as ${USERNAME}`);
        }

        if (message.includes('|request|')) {
            makeBattleMove(ws, message);
        }
    });
}

function loginToShowdown(challstr) {
    const loginURL = 'https://play.pokemonshowdown.com/action.php';

    if (PASSWORD) {
        axios.post(loginURL, {
            act: 'login',
            name: USERNAME,
            pass: PASSWORD,
            challstr: challstr
        }).then(res => {
            const assertion = res.data.split('"assertion":"')[1].split('"')[0];
            ws.send(`|/trn ${USERNAME},0,${assertion}`);
        }).catch(err => console.error("❌ Login failed:", err));
    } else {
        ws.send(`|/trn ${USERNAME},0`);
    }
}

function searchForRandomBattle() {
    console.log("🔍 Searching for a Gen 9 Random Battle...");
    ws.send(`|/search ${BATTLE_FORMAT}`);
}

module.exports = { startShowdownConnection, searchForRandomBattle };
