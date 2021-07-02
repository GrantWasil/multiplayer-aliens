const envConfig = require("dotenv").config();
const express = require("express")
const Ably = require("ably");
const p2 = require("p2");
const { func } = require("assert-plus");
const app = express();
const ABLY_API_KEY = process.env.ABLY_API_KEY;

const CANVAS_HEIGHT = 750;
const CANVAS_WIDTH = 1400;
const SHIP_PLATFORM = 718;
const PLAYER_VERTICAL_INCREMENT = 20;
const PLAYER_VERTICAL_MOVEMENT_UPDATE_INTERVAL = 1000;
const PLAYER_SCORE_INCREMENT = 5;
const P2_WORLD_TIME_STEP = 1 / 16;
const MIN_PLAYERS_TO_START_GAME = 3;
const GAME_TICKER_MS = 100;

let peopleAccessingTheWebsite = 0;
let players = {};
let playerChannels = {};
let shipX = Math.floor((Math.random() * 1370 + 30) * 1000) / 1000;
let shipY = SHIP_PLATFORM;
let avatarColors = ["green", "cyan", "yellow"];
let avatarTypes = ["A", "B", "C"];
let gameOn = false;
let alivePlayers = 0;
let totalPlayers = 0;
let gameRoom;
let deadPlayerCh;
let gameTickerOn = false;
let bulletTimer = 0;
let shipBody;
let world;
let shipVelocityTimer = 0;
let killerBulletId = "";
let copyOfShipBody = {
  position: "",
  velocity: "",
};

const realtime = Ably.Realtime({
    key: ABLY_API_KEY,
    echoMessages: false,
});

// create a uniqueID to asssign to clients on auth
const uniqueId = function() {
    return "id-" + totalPlayers + Math.random().toString(36).substr(2, 16);
};

app.use(express.static("js"));

app.get("/auth", (req, res) => {
    const tokenParams = { clientId: uniqueId() };
    realtime.auth.createTokenRequest(tokenParams, function(err, tokenRequest) {
        if (err) {
            res.status(500).send("Error requesting token: " + JSON.stringify(err));
        } else {
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify(tokenRequest));
        }
    });
});

app.get("/", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
    if (++peopleAccessingTheWebsite > MIN_PLAYERS_TO_START_GAME) {
        res.sendFile(__dirname + "/views/gameRoomFull.html");
    } else {
        res.sendFile(__dirname + "/views/intro.html");
    }
});

app.get("/gameplay", (req, res) => {
    res.sendFile(__dirname, "/views/index.html");
})

app.get("/winner", (req, res) => {
    res.sendFile(__dirname, "/views/winnder.html");
})

app.get("/gameover", (req, res) => {
    res.sendFile(__dirname, "/views/gameover.html");
})

const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});

realtime.connection.once("connected", () => {
    gameRoom = realtime.channels.get("game-room");
    deadPlayerCh = realtime.channels.get("dead-player");
    gameRoom.precense.subscribe("enter", (player) => {
        let newPlayerId;
        let newPlayerData;
        alivePlayers++;
        totalPlayers++;

        if (totalPlayers == 1) {
            gameTickerOn = true;
            startGameTicker();
        }

        newPlayerId = player.clientId;
        playerChannels[newPlayerId] = realtime.channels.get("clientChannel-" + player.clientId);

        newPlayerObject = {
            id: newPlayerId,
            x: Math.floor((Math.random() * 1370 + 30) * 1000) / 1000,
            y: 20,
            invaderAvatarType: avatarTypes[randomAvatarSelector()],
            invaderAvatarColor: avatarColors[randomAvatarSelector()],
            score: 0,
            nickname: player.data,
            isAlive: true,
        };
        players[newPlayerId] = newPlayerObject;
        if (totalPlayers === MIN_PLAYERS_TO_START_GAME) {
            startShipAndBullets();
        }
        subscribeToPlayerInput(playerChannels[newPlayerId], newPlayerId);
    });
    gameRoom.precense.subscribe("leave", (player) => {
        let leavingPlayer = player.clientId;
        alivePlayers--;
        totalPlayers--;
        delete players[leavingPlayer]
        if (totalPlayers <= 0){
            resetServerState();
        }
    });
    deadPlayerCh.subscribe("dead-notif", (msg) => {
        players[msg.data.deadPlayerId].isAlive = false;
        killerBulletId = msg.data.killerBulletId;
        alivePlayers--;
        if (alivePlayers == 0) {
            setTimeout(() => {
                finishGame("");
            }, 1000);
        }
    });
})

function startGameTicker() {
    let tickInterval = setInterval(() => {
        if (!gameTickerOn) {
            clearInterval(tickInterval);
        } else {
            bulletOrBlank = "";
            bulletTimer += GAME_TICKER_MS;
            if (bulletTimer >= GAME_TICKER_MS * 5) {
                bulletTimer = 0;
                bulletOrBlank = {
                    y: SHIP_PLATFORM,
                    id: "bulletId-" + Math.floor((Math.random() * 2000 + 50) * 1000) / 1000,
                };
            }
            if (shipBody) {
                copyOfShipBody = shipBody;
            }
            gameRoom.publish("game-state", {
                players: players,
                playerCount: totalPlayers,
                shipBody: copyOfShipBody.position,
                bulletOrBlank: bulletOrBlank,
                gameOn: gameOn,
                killerBullet: killerBulletId,
            });
        }
    }, GAME_TICKER_MS);
}

function subscribeToPlayerInput(channelInstance, playerId) {
    channelInstance.subscribe("pos", (msg) => {
        if (msg.data.keyPressed == "left") {
            if (players[playerId].x - 20 < 20) {
                players[playerId].x = 20;
            } else {
                players[playerId].x -= 20;
            }
        } else if (msg.data.keyPressed == "right") {
            if (players[playerId].x + 20 > 1380) {
                players[playerId].x = 1380;
            } else {
                players[playerId].x += 20;
            }
        }
    });
}

function startDownardMovement(playerId) {
    let interval = setInterval(() => {
        if (players[playerId] && players[playerId].isAlive) {
            players[playerId].y += PLAYER_VERTICAL_INCREMENT;
            players[playerId].score += PLAYER_SCORE_INCREMENT;

            if (players[playerId].y > SHIP_PLATFORM) {
                finishGame(playerId);
                clearInterval(interval);
            }
        } else {
            clearInterval(interval);
        }
    }, PLAYER_VERTICAL_MOVEMENT_UPDATE_INTERVAL);
}

function finishGame(playerId) {
    let firstRunnerUpname = "";
    let secondRunnerUpName = "";
    let winnerName = "Nobody";
    let leftoverPlayers = new Array();
    for (let item in players) {
        leftoverPlayers.push({
            nickname: players[item].nickname,
            socre: players[item].score,
        });
    }

    leftoverPlayers.sort((a, b) => {
        return b.score - a.score;
    })
    if (playerId == "") {
        if (leftoverPlayers.length >= 3) {
            firstRunnerUpname = leftoverPlayers[0].nickname;
            secondRunnerUpName = leftoverPlayers[1].nickname;
        } else if (leftoverPlayers == 2) {
            firstRunnerUpname = leftoverPlayers[0].nickname;
        }
    } else {
        winnerName = players[playerId].nickname;
        if (leftoverPlayers.length >= 3) {
            firstRunnerUpname = leftoverPlayers[1].nickname;
            secondRunnerUpName = leftoverPlayers[2].nickname;
        } else if (leftoverPlayers == 2) {
            firstRunnerUpname = leftoverPlayers[1].nickname;
        }
    }

    gameRoom.publish("game-over", {
        winner: winnerName,
        firstRunnerUp: firstRunnerUpname,
        secondRunnerUp: secondRunnerUpName,
        totalPlayers: totalPlayers,
    });

    resetServerState();
}

function resetServerState() {}

function startShipAndBullets() {}

function startMovingPhysicsWorld() {}

function calcRandomVelocity() {}

function randomAvatarSelector() {}