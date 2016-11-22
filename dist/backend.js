/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const express = __webpack_require__(1);
	const path = __webpack_require__(2);
	const http = __webpack_require__(3);
	const process = __webpack_require__(4);
	const lobby_server_1 = __webpack_require__(5);
	const game_server_1 = __webpack_require__(15);
	var app = express();
	var server = http.createServer(app);
	app.use(express.static(path.resolve(__dirname, '../')));
	app.get('/', function (req, res) {
	    res.sendFile(path.resolve(__dirname, '../index.html'));
	});
	server.listen(process.env.PORT || 3000, function () {
	    console.log('Port given by process.env variable: ', process.env.PORT);
	    console.log('Listening on port ', process.env.PORT || 3000);
	});
	let lobby = new lobby_server_1.LobbyServer(server, app, new game_server_1.GameServer(server));
	app.get('/join', (req, res) => lobby.joinRandom(req, res));
	app.get('/createprivate', (req, res) => lobby.createPrivate(req, res));
	app.get(/game\/.+/, function (req, res) {
	    res.sendFile(path.resolve(__dirname, '../index.html'));
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("process");

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const game_1 = __webpack_require__(6);
	const server_interface_1 = __webpack_require__(14);
	class LobbyServer {
	    constructor(server, app, gameServer) {
	        this.gameStartTimer = null; // Timeout id
	        this.playersInRandLobby = 0; // Number of players sitting in random lobby
	        this.app = app;
	        this.server = server;
	        this.gameServer = gameServer;
	        this.refreshRandGame();
	    }
	    // Returns new lobby's hashcode
	    createNewLobby() {
	        const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
	        let code = "";
	        for (let i = 0; i < server_interface_1.GAME_CODE_LENGTH; i++) {
	            code += alphabet[Math.floor(Math.random() * alphabet.length)];
	        }
	        return code;
	    }
	    joinRandom(req, res) {
	        this.playersInRandLobby += 1;
	        console.log("Players waiting for random game to start: ", this.playersInRandLobby);
	        this.resetTimer();
	        res.setHeader('Content-Type', 'application/json');
	        res.send({ gameCode: this.currentRandLobby });
	        if (this.playersInRandLobby === game_1.Game.settings.maxPlayers) {
	            this.refreshRandGame();
	        }
	        else if (this.playersInRandLobby >= game_1.Game.settings.minPlayers) {
	            this.gameStartTimer = setTimeout(this.startRandGamePrematurely.bind(this), server_interface_1.GAME_LOBBY_COUNTDOWN);
	        }
	    }
	    createPrivate(req, res) {
	        res.setHeader('Content-Type', 'application/json');
	        res.send({ gameCode: this.createNewLobby() });
	    }
	    resetTimer() {
	        if (this.gameStartTimer !== null) {
	            clearTimeout(this.gameStartTimer);
	        }
	        this.gameStartTimer = null;
	    }
	    refreshRandGame() {
	        this.resetTimer();
	        this.currentRandLobby = this.createNewLobby();
	        this.playersInRandLobby = 0;
	    }
	    startRandGamePrematurely() {
	        this.playersInRandLobby = this.gameServer.startGame(this.currentRandLobby);
	        if (this.playersInRandLobby >= game_1.Game.settings.minPlayers) {
	            this.refreshRandGame();
	        }
	    }
	}
	exports.LobbyServer = LobbyServer;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const player_1 = __webpack_require__(7);
	const bullet_1 = __webpack_require__(11);
	const entity_1 = __webpack_require__(8);
	const wall_1 = __webpack_require__(12);
	const _ = __webpack_require__(13);
	;
	;
	exports.WorldSize = { width: 960, height: 720 };
	const defaultMap = wall_1.MapCatalog[0].walls.concat(wall_1.BorderWalls(exports.WorldSize)).reduce((prev, wallData) => {
	    const wallEntity = wall_1.Wall.init(wallData);
	    prev[wallEntity.id] = wallEntity;
	    return prev;
	}, {});
	class Game {
	    static init(overrides = {}) {
	        let defaults = {
	            settings: { minPlayers: Game.settings.minPlayers,
	                maxPlayers: Game.settings.maxPlayers },
	            world: exports.WorldSize,
	            entities: { players: {}, bullets: {}, walls: defaultMap },
	            isFinished: false,
	            winner: null,
	        };
	        return Object.assign(defaults, overrides);
	    }
	    // Current issue is that the state that the parts base their
	    // information of is changing as they're all running, so behavior
	    // might change based on the order of iteration, which is bad.
	    // Immutability is the only way to fix this
	    static update(game, delta) {
	        let { players, bullets } = game.entities;
	        let events = [];
	        Object.keys(game.entities).forEach(entityType => {
	            let entities = game.entities[entityType];
	            Object.keys(entities).forEach(id => {
	                if (!entities[id].alive && entityType !== 'players') {
	                    delete entities[id];
	                }
	            });
	        });
	        // Consider putting all entities together
	        events = Object.keys(players).reduce((events, playerId) => {
	            return events.concat(player_1.Player.update(players[playerId], delta, game));
	        }, events);
	        events = Object.keys(bullets).reduce((events, bulletId) => {
	            return events.concat(bullet_1.Bullet.update(bullets[bulletId], delta, game));
	        }, events);
	        return events;
	    }
	    static applyInputs(state, inputs) {
	        const players = state.entities.players;
	        var events = [];
	        inputs.forEach(input => {
	            if (!players[input.playerId]) {
	                return;
	            }
	            events = events.concat(player_1.Player.applyInput(players[input.playerId], input, state));
	        });
	        return events;
	    }
	    static resolveEvents(game, events) {
	        let allEntities = Object.keys(game.entities).reduce((list, key) => {
	            Object.assign(list, game.entities[key]);
	            return list;
	        }, {});
	        let { walls, players } = game.entities;
	        events.forEach(event => {
	            let sender = allEntities[event.initiator];
	            let receiver = allEntities[event.receptor];
	            switch (event.type) {
	                case 'COLLISION':
	                    switch (sender.type) {
	                        case 'player':
	                            player_1.Player.collideWith(sender, receiver, game);
	                            break;
	                        case 'bullet':
	                            bullet_1.Bullet.collideWith(sender, receiver, game);
	                            break;
	                    }
	                    break;
	                case 'SPAWN_BULLET':
	                    switch (sender.type) {
	                        case 'player':
	                            let bullet = bullet_1.Bullet.spawnFrom(sender);
	                            game.entities.bullets[bullet.id] = bullet;
	                            break;
	                    }
	                    break;
	                case 'MOVEMENT':
	                    if (sender) {
	                        let movementData = event.data;
	                        player_1.Player.move(sender, movementData.xVel, movementData.yVel);
	                        let foundCollision = !!_.find(walls, wall => entity_1.Entity.colliding(sender, wall))
	                            || !!_.find(players, (player, playerId) => entity_1.Entity.colliding(sender, player) && sender.id !== playerId);
	                        if (foundCollision) {
	                            player_1.Player.move(sender, movementData.xVel * -1, movementData.yVel * -1);
	                        }
	                    }
	                    break;
	            }
	        });
	    }
	    static setIsFinished(game) {
	        game.isFinished = !!game.winner || _.size(_.filter(game.entities.players, p => p.alive)) <= 1;
	        if (game.isFinished) {
	            game.winner = game.winner || _.get(_.find(game.entities.players, p => p.alive), 'id', null);
	        }
	    }
	    static getWinner(game) {
	        return game.winner;
	    }
	    static addPlayer(game) {
	        let player = player_1.Player.init();
	        let count = 0;
	        if (game.entities.players) {
	            count = Object.keys(game.entities.players).length;
	        }
	        player.pos = wall_1.MapCatalog[0].startPositions[count];
	        game.entities.players[player.id] = player;
	        return player;
	    }
	    static removePlayer(game, playerId) {
	        delete game.entities.players[playerId];
	    }
	}
	exports.Game = Game;
	Game.settings = { minPlayers: 2, maxPlayers: 4 };


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const entity_1 = __webpack_require__(8);
	const event_1 = __webpack_require__(9);
	exports.GUNPOINT_OFFSETS = {
	    center: { x: 9, y: 9 },
	    distance: { x: 17, y: 10 },
	};
	const INPUT_VEL = 200;
	class Player extends entity_1.Entity {
	    static init(overrides = {}) {
	        return Object.assign(super.init(), {
	            health: 10,
	            gunCooldown: 200,
	            lastFire: 0,
	            type: 'player',
	        }, overrides);
	    }
	    static update(player, delta, game) {
	        return super.update(player, delta, game);
	    }
	    static applyInput(player, input, game) {
	        if (input.playerId !== player.id) {
	            return;
	        }
	        // Controls
	        const step = (input.duration / 1000) * INPUT_VEL;
	        const inputVel = { x: 0, y: 0 };
	        if (input.up) {
	            inputVel.y -= step;
	        }
	        if (input.down) {
	            inputVel.y += step;
	        }
	        if (input.left) {
	            inputVel.x -= step;
	        }
	        if (input.right) {
	            inputVel.x += step;
	        }
	        player.orientation = input.angle;
	        // Movement are events to allow for collision
	        let events = [];
	        if (input.up || input.down || input.left || input.right) {
	            events.push(event_1.EventFactory.createEvent('MOVEMENT', player.id, null, {
	                xVel: inputVel.x,
	                yVel: inputVel.y,
	            }));
	        }
	        // TODO: Investigate whether this Date.now business messes up with server
	        if (input.fired && player.lastFire + player.gunCooldown < Date.now()) {
	            player.lastFire = Date.now();
	            events.push(event_1.EventFactory.createEvent('SPAWN_BULLET', player.id, null));
	        }
	        return events;
	    }
	    static move(player, xvel, yvel) {
	        if (player) {
	            player.pos.x += xvel;
	            player.pos.y += yvel;
	        }
	    }
	    static takeDamage(player, dmg) {
	        player.health = player.health - dmg;
	        if (player.health < 0) {
	            player.alive = false;
	        }
	    }
	    static collideWith(player, other, game) {
	        return;
	    }
	}
	exports.Player = Player;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const event_1 = __webpack_require__(9);
	const vector_1 = __webpack_require__(10);
	;
	let lastId = 0;
	class Entity {
	    static init(overrides = {}) {
	        return Object.assign({
	            pos: { x: 640, y: 320 },
	            vel: { x: 0, y: 0 },
	            accel: { x: 0, y: 0 },
	            orientation: 0,
	            radius: 10,
	            alive: true,
	            id: ("" + lastId++),
	        }, overrides);
	    }
	    static getEntities(game) {
	        return Object.keys(game.entities).reduce((fullList, entityType) => {
	            let entities = game.entities[entityType];
	            return fullList.concat(Object.keys(entities).map(e => entities[e]));
	        }, []);
	    }
	    // TODO: Make this able to keep players running if they were running
	    // We need player input to be able to be inputted normally, but extrapolated when only simulated?
	    static update(entity, delta, game) {
	        entity.vel = vector_1.Vec.add(entity.vel, entity.accel);
	        entity.pos = vector_1.Vec.add(entity.pos, vector_1.Vec.mul(entity.vel, delta / 1000));
	        let events = [];
	        Entity.getEntities(game).forEach((other) => {
	            if (other.id !== entity.id && Entity.colliding(entity, other)) {
	                events.push(event_1.EventFactory.createEvent('COLLISION', entity.id, other.id, {}));
	            }
	        });
	        return events;
	    }
	    static colliding(a, b) {
	        let extraResult = false;
	        if (b.type === 'wall') {
	            let other = a;
	            let wall = b;
	            if (other.pos.x > wall.pos.x && other.pos.x < wall.pos.x + wall.width &&
	                other.pos.y > wall.pos.y && other.pos.y < wall.pos.y + wall.height) {
	                extraResult = true;
	            }
	            if (other.pos.x > wall.pos.x && other.pos.x < wall.pos.x &&
	                (other.pos.y + other.radius > wall.pos.y && other.pos.y + other.radius < wall.pos.y + wall.height ||
	                    other.pos.y - other.radius > wall.pos.y && other.pos.y - other.radius < wall.pos.y + wall.height)) {
	                extraResult = true;
	            }
	            if (other.pos.y > wall.pos.y && other.pos.y < wall.pos.y &&
	                (other.pos.x + other.radius > wall.pos.x && other.pos.x + other.radius < wall.pos.x + wall.width ||
	                    other.pos.x - other.radius > wall.pos.x && other.pos.x - other.radius < wall.pos.x + wall.width)) {
	                extraResult = true;
	            }
	            return extraResult;
	        }
	        return vector_1.Vec.mag(vector_1.Vec.subtract(a.pos, b.pos)) < a.radius + b.radius;
	    }
	    static interact(entity, other, state) {
	        return;
	    }
	}
	exports.Entity = Entity;


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	class EventFactory {
	    static createEvent(type, initiator, receptor, data = {}) {
	        return Object.assign({
	            type,
	            initiator,
	            receptor,
	            data: data,
	        });
	    }
	}
	exports.EventFactory = EventFactory;


/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	// TODO: Move this out probably
	class Vec {
	    static add(a, b) {
	        return { x: a.x + b.x, y: a.y + b.y };
	    }
	    static create(x, y) {
	        return { x, y };
	    }
	    static subtract(a, b) {
	        return Vec.add(a, { x: -b.x, y: -b.y });
	    }
	    static mul(v, scale) {
	        return { x: v.x * scale, y: v.y * scale };
	    }
	    static mag(v) {
	        return Math.sqrt(v.x * v.x + v.y * v.y);
	    }
	    static direction(angle) {
	        return { x: Math.cos(angle), y: Math.sin(angle) };
	    }
	}
	exports.Vec = Vec;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const entity_1 = __webpack_require__(8);
	const player_1 = __webpack_require__(7);
	const vector_1 = __webpack_require__(10);
	;
	const BULLET_SPEED = 300;
	class Bullet extends entity_1.Entity {
	    static init(overrides = {}) {
	        return Object.assign(super.init(), {
	            damage: 15,
	            source: null,
	            alive: true,
	            type: 'bullet',
	        }, overrides);
	    }
	    static update(bullet, delta, game) {
	        if (bullet.pos.x < 0 - bullet.radius
	            || bullet.pos.x > game.world.width + bullet.radius
	            || bullet.pos.y < 0 - bullet.radius
	            || bullet.pos.y > game.world.height + bullet.radius) {
	            bullet.alive = false;
	        }
	        return super.update(bullet, delta, game);
	    }
	    static collideWith(bullet, other, state) {
	        switch (other.type) {
	            case 'player':
	                other = other;
	                if (other.id !== bullet.source && bullet.alive) {
	                    player_1.Player.takeDamage(other, bullet.damage);
	                    bullet.alive = false;
	                }
	                break;
	            case 'wall':
	                bullet.alive = false;
	                break;
	        }
	    }
	    static spawnFrom(entity) {
	        let base = Bullet.init();
	        base.source = entity.id;
	        let directionVector = vector_1.Vec.direction(entity.orientation);
	        let { center, distance } = player_1.GUNPOINT_OFFSETS;
	        base.pos = {
	            x: entity.pos.x + distance.x * directionVector.x - distance.y * directionVector.y - center.x,
	            y: entity.pos.y + distance.y * directionVector.y + distance.y * directionVector.x - center.y,
	        };
	        base.vel = vector_1.Vec.mul(directionVector, BULLET_SPEED);
	        return base;
	    }
	}
	exports.Bullet = Bullet;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const entity_1 = __webpack_require__(8);
	(function (WallSprite) {
	    WallSprite[WallSprite["BUNKER_1x2_1"] = 0] = "BUNKER_1x2_1";
	    WallSprite[WallSprite["BUNKER_2x1_1"] = 1] = "BUNKER_2x1_1";
	    WallSprite[WallSprite["BUNKER_2x1_2"] = 2] = "BUNKER_2x1_2";
	    WallSprite[WallSprite["BUNKER_2x2_1"] = 3] = "BUNKER_2x2_1";
	})(exports.WallSprite || (exports.WallSprite = {}));
	var WallSprite = exports.WallSprite;
	;
	class Wall extends entity_1.Entity {
	    static init(overrides = {}) {
	        return Object.assign(super.init(), {
	            width: 200,
	            height: 200,
	            sprite: 'bunker_2x2_1',
	            type: 'wall',
	        }, overrides);
	    }
	    static update(wall, delta, game) {
	        let events = [];
	        return events;
	    }
	    static collideWith(wall, other, game) {
	        return;
	    }
	}
	exports.Wall = Wall;
	// List of maps, stores the minimal amount of data needed so that
	// this could be moved into a JSON file to backup maps
	exports.MapCatalog = [{
	        walls: [
	            { pos: { x: 380, y: 260 }, width: 200, height: 200, sprite: WallSprite.BUNKER_2x2_1 },
	            { pos: { x: 170, y: 145 }, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_1 },
	            { pos: { x: 205, y: 470 }, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1 },
	            { pos: { x: 650, y: 505 }, width: 140, height: 70, sprite: WallSprite.BUNKER_2x1_2 },
	            { pos: { x: 685, y: 110 }, width: 70, height: 140, sprite: WallSprite.BUNKER_1x2_1 },
	        ],
	        startPositions: [
	            { x: 30, y: 30 },
	            { x: 930, y: 30 },
	            { x: 30, y: 690 },
	            { x: 930, y: 690 },
	        ]
	    }];
	function BorderWalls(worldsize) {
	    return [
	        { pos: { x: 0, y: worldsize.height }, width: 960, height: 50, sprite: WallSprite.BUNKER_2x1_2 },
	        { pos: { x: 0, y: -50 }, width: 960, height: 50, sprite: WallSprite.BUNKER_2x1_2 },
	        { pos: { x: -50, y: 0 }, width: 50, height: 720, sprite: WallSprite.BUNKER_2x1_2 },
	        { pos: { x: worldsize.width, y: 0 }, width: 50, height: 720, sprite: WallSprite.BUNKER_2x1_2 },
	    ];
	}
	exports.BorderWalls = BorderWalls;


/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	exports.GAME_LOBBY_COUNTDOWN = 5000;
	exports.SEND_STATE_UPDATE = "state update";
	exports.NEW_PLAYER_JOINED = "new player";
	exports.START_GAME = "start game";
	exports.GAME_CODE_LENGTH = 5;
	;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const game_1 = __webpack_require__(6);
	const SocketIO = __webpack_require__(16);
	const _ = __webpack_require__(13);
	const server_interface_1 = __webpack_require__(14);
	const client_interface_1 = __webpack_require__(17);
	const TICKS_PER_SECOND = 60;
	const DEV_DELAY = 0; // Delays the updates sent to clients to simulate slower connections
	class GameServer {
	    constructor(server) {
	        this.activeGames = new Map(); // String is unique hash given by lobby-server
	        this.io = SocketIO(server);
	        this.io.on('connection', this.onConnection.bind(this));
	    }
	    startGame(gameCode) {
	        return this.activeGames.get(gameCode).startGame();
	    }
	    onConnection(socket) {
	        const gameCode = socket.handshake.query.gamecode;
	        if (!(this.activeGames.get(gameCode))) {
	            this.activeGames.set(gameCode, new GameInstance(() => this.onGameFinished(gameCode)));
	        }
	        this.activeGames.get(gameCode).addPlayer(socket);
	    }
	    onGameFinished(gameCode) {
	        this.activeGames.delete(gameCode);
	    }
	}
	exports.GameServer = GameServer;
	class GameInstance {
	    constructor(gameFinishedCallback) {
	        this.sockets = [];
	        this.disconnects = [];
	        this.playerSockets = new Map();
	        this.lastTick = 0;
	        // Keeps track of the timestamp of the latest input that the server has applied for each player
	        this.lastUpdateTimestamps = new Map();
	        // The unprocessed inputs for each player
	        this.frameBuffers = {};
	        this.gameFinishedCallback = gameFinishedCallback;
	        this.game = game_1.Game.init();
	        this.lastTick = Date.now();
	    }
	    addPlayer(socket) {
	        this.sockets.push(socket);
	        socket.on('disconnect', () => this.onDisconnection(socket));
	        if (this.sockets.length === game_1.Game.settings.maxPlayers) {
	            this.startGame();
	        }
	        for (let s of this.sockets) {
	            s.emit(server_interface_1.NEW_PLAYER_JOINED, this.sockets.length);
	        }
	    }
	    startGame() {
	        if (this.sockets.length >= game_1.Game.settings.minPlayers) {
	            for (var socket of this.sockets) {
	                let player = game_1.Game.addPlayer(this.game);
	                socket.on(client_interface_1.SEND_FRAMES, (frames) => this.acceptFrames(frames, player.id));
	                socket.on('disconnect', () => this.onInGameDisconnection(player.id));
	                socket.emit(server_interface_1.START_GAME, {
	                    playerId: player.id,
	                    gameState: this.game,
	                });
	                this.playerSockets.set(player.id, socket);
	            }
	            this.tick();
	        }
	        else {
	            // Can't start a game with < min players
	            for (let s of this.sockets) {
	                s.emit(server_interface_1.NEW_PLAYER_JOINED, this.sockets.length);
	            }
	        }
	        return this.sockets.length;
	    }
	    onDisconnection(socket) {
	        this.sockets.splice(this.sockets.indexOf(socket), 1);
	        for (let s of this.sockets) {
	            s.emit(server_interface_1.NEW_PLAYER_JOINED, this.sockets.length);
	        }
	    }
	    onInGameDisconnection(playerId) {
	        if (this.sockets.length <= 1) {
	            this.gameFinishedCallback();
	        }
	        this.disconnects.push(playerId);
	    }
	    tick() {
	        let { game, frameBuffers, disconnects, lastTick } = this;
	        let delta = Date.now() - lastTick;
	        this.lastTick += delta;
	        // Handle client disconnect
	        disconnects.forEach(id => game_1.Game.removePlayer(game, id));
	        // Update the "most recent update" timestamp for each player to
	        // inform it of how delayed its server payload is
	        _.forIn(frameBuffers, (frames, playerId) => this.lastUpdateTimestamps.set(this.playerSockets.get(playerId), _.last(frames).timestamp));
	        let frames = _.flatten(_.values(frameBuffers));
	        let events = game_1.Game.applyInputs(game, frames);
	        events = events.concat(game_1.Game.update(game, delta));
	        game_1.Game.resolveEvents(game, events);
	        this.sendState();
	        this.frameBuffers = {};
	        this.disconnects = [];
	        if (this.sockets.length > 0) {
	            // Don't call tick again if nobody is in the game anymore
	            setTimeout(this.tick.bind(this), (1 / TICKS_PER_SECOND) * 1000);
	        }
	    }
	    acceptFrames(frames, playerId) {
	        this.frameBuffers[playerId] = (this.frameBuffers[playerId] || []).concat(frames);
	    }
	    sendState() {
	        this.sockets.forEach((socket) => {
	            const payload = {
	                game: _.cloneDeep(this.game),
	                timestamp: this.lastUpdateTimestamps.get(socket) || 0,
	            };
	            setTimeout(() => {
	                socket.emit(server_interface_1.SEND_STATE_UPDATE, payload);
	            }, DEV_DELAY);
	        });
	    }
	}


/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";
	exports.SEND_FRAMES = "new frames";


/***/ }
/******/ ]);
//# sourceMappingURL=backend.js.map