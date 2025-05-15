const Pokemon = require("./pokemon");

class Battle {
    constructor(battleID, player1, player2) {
        this.battleID = battleID;
        this.player1 = player1;
        this.player2 = player2;

        this.pokemon = {};
        this.turns = [];
        this.currentTurn = 0;
        this.isOver = false;

        this.hazardsSet = {
            "p1": {
                "stealthrock": false,
                "spikes": false,
                "toxicspikes": false,
                "stickyweb": false,
            },
            "p2": {
                "stealthrock": false,
                "spikes": false,
                "toxicspikes": false,
                "stickyweb": false,
            }
        };

        this.history = [];
        this.currentWeather = "";
        this.currentTerrain = "";
        this.replay = [];
        this.winner = "";
        this.loser = "";
        this.forfeiter = "";

        this.p1a = new Pokemon("");
        this.p1b = new Pokemon("");
        this.p2a = new Pokemon("");
        this.p2b = new Pokemon("");
    }

    static numBattles = 0;
    static numActiveBattles = 0;
    static battleHistory = [];
    static battleHistoryLimit = 100;

    static incrementBattles(battleLink) {
        Battle.numBattles++;
        Battle.numActiveBattles++;
        Battle.battleHistory.push(battleLink);
        if (Battle.battleHistory.length > Battle.battleHistoryLimit) {
            Battle.battleHistory.shift();
        }
    }

    static decrementBattles(battleLink) {
        Battle.numActiveBattles--;
        Battle.battleHistory = Battle.battleHistory.filter(b => b !== battleLink);
    }

    addHazard(side, hazard, hazardType) {
        if (side && this.hazardsSet[side]) {
            this.hazardsSet[side][hazard] = hazardType;
        }
    }

    endHazard(side, hazard) {
        if (side && this.hazardsSet[side]) {
            this.hazardsSet[side][hazard] = undefined;
        }
    }

    setWeather(weather) {
        this.currentWeather = weather;
    }
}

module.exports = Battle;
