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
	const child_process = __webpack_require__(4);
	const lobby_server_1 = __webpack_require__(5);
	var app = express();
	var server = http.createServer(app);
	app.use(express.static(path.resolve(__dirname, '../')));
	app.get('/', function (req, res) {
	    res.sendFile(path.resolve(__dirname, '../index.html'));
	});
	server.listen(3000, function () {
	    console.log('listening on *:3000');
	});
	for (let i in [0, 1, 2, 3]) {
	    child_process.fork("#{__dirname}/backendgame.js");
	}
	new lobby_server_1.LobbyServer(server);


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

	module.exports = require("child_process");

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const game_server_1 = __webpack_require__(6);
	const SocketIO = __webpack_require__(13);
	const game_1 = __webpack_require__(7);
	const GAME_START_TIME = 5000;
	class LobbyServer {
	    constructor(server) {
	        this.server = server;
	        this.io = SocketIO(this.server);
	        this.refreshLobby();
	        this.io.on('connection', this.onConnection.bind(this));
	    }
	    onConnection(socket) {
	        this.players.push(socket);
	        socket.on('disconnect', () => this.onDisconnection(this.players.length - 1));
	        console.log("Players in lobby: ", this.players.length);
	        this.resetTimer();
	        if (this.players.length > game_1.Game.settings.maxPlayers) {
	            // Assuming we won't go from max-1 players to max+1 players
	            console.log("CRITICAL ERROR: too many players");
	        }
	        else if (this.players.length == game_1.Game.settings.maxPlayers) {
	            this.startGame();
	        }
	        else if (this.players.length >= game_1.Game.settings.minPlayers) {
	            this.gameStartTimer = setTimeout(this.startGame.bind(this), GAME_START_TIME);
	        }
	    }
	    onDisconnection(playerNum) {
	        this.players.splice(playerNum, 1);
	        if (this.players.length < game_1.Game.settings.minPlayers) {
	            if (this.gameStartTimer != -1) {
	                clearTimeout(this.gameStartTimer);
	            }
	        }
	    }
	    resetTimer() {
	        if (this.gameStartTimer != -1) {
	            clearTimeout(this.gameStartTimer);
	        }
	        this.gameStartTimer = -1;
	    }
	    refreshLobby() {
	        this.resetTimer();
	        this.players = [];
	    }
	    startGame() {
	        // Start new game
	        new game_server_1.GameServer(this.players);
	        this.refreshLobby();
	    }
	}
	exports.LobbyServer = LobbyServer;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const game_1 = __webpack_require__(7);
	const TICKS_PER_SECOND = 60;
	class GameServer {
	    constructor(sockets) {
	        this.game = game_1.Game.init();
	        this.frameBuffer = [];
	        this.disconnects = [];
	        this.lastTick = Date.now();
	        this.sockets = sockets;
	        for (var socket of this.sockets) {
	            let player = game_1.Game.addPlayer(this.game);
	            socket.on('new frames', this.acceptFrames.bind(this));
	            socket.on('disconnect', () => this.onDisconnection(player.id));
	            socket.emit('start game', {
	                playerId: player.id,
	                gameState: this.game,
	            });
	        }
	        this.tick();
	    }
	    tick() {
	        let { game, frameBuffer, disconnects, lastTick } = this;
	        this.frameBuffer = [];
	        this.disconnects = [];
	        let delta = Date.now() - lastTick;
	        this.lastTick += delta;
	        // Handle client disconnect
	        disconnects.forEach(id => game_1.Game.removePlayer(game, id));
	        let events = game_1.Game.applyInputs(game, frameBuffer);
	        events = events.concat(game_1.Game.update(game, delta));
	        game_1.Game.resolveEvents(game, events);
	        this.sendState();
	        setTimeout(this.tick.bind(this), (1 / TICKS_PER_SECOND) * 1000);
	    }
	    onDisconnection(playerId) {
	        this.disconnects.push(playerId);
	    }
	    acceptFrames(frames) {
	        this.frameBuffer = this.frameBuffer.concat(frames);
	    }
	    sendState() {
	        for (var socket of this.sockets) {
	            socket.emit('state update', this.game);
	        }
	    }
	}
	exports.GameServer = GameServer;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const player_1 = __webpack_require__(8);
	const bullet_1 = __webpack_require__(12);
	;
	;
	class Game {
	    static init(overrides = {}) {
	        return Object.assign({
	            settings: { minPlayers: Game.settings.minPlayers,
	                maxPlayers: Game.settings.maxPlayers },
	            world: { width: 640, height: 480 },
	            entities: { players: {}, bullets: {} }
	        }, overrides);
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
	                if (!entities[id].alive) {
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
	        let { players, bullets } = game.entities;
	        events.forEach(event => {
	            let sender = players[event.initiator] || bullets[event.initiator] || null;
	            let receiver = players[event.receptor] || bullets[event.receptor] || null;
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
	                            bullets[bullet.id] = bullet;
	                            break;
	                    }
	                    break;
	            }
	        });
	    }
	    static addPlayer(state) {
	        let player = player_1.Player.init();
	        player.pos.x = state.world.width / 2;
	        player.pos.y = state.world.height / 2;
	        state.entities.players[player.id] = player;
	        return player;
	    }
	    static removePlayer(state, playerId) {
	        delete state.entities.players[playerId];
	    }
	}
	exports.Game = Game;
	Game.settings = { minPlayers: 2, maxPlayers: 4 };


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const entity_1 = __webpack_require__(9);
	const event_1 = __webpack_require__(10);
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
	        player.pos.x += inputVel.x;
	        player.pos.y += inputVel.y;
	        let events = [];
	        // TODO: Investigate whether this Date.now business messes up with server
	        if (input.fired && player.lastFire + player.gunCooldown < Date.now()) {
	            player.lastFire = Date.now();
	            events.push(event_1.EventFactory.createEvent('SPAWN_BULLET', player.id, null));
	        }
	        return events;
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const event_1 = __webpack_require__(10);
	const vector_1 = __webpack_require__(11);
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
	                events.push(event_1.EventFactory.createEvent('COLLISION', entity.id, other.id));
	            }
	        });
	        return events;
	    }
	    static colliding(a, b) {
	        return vector_1.Vec.mag(vector_1.Vec.subtract(a.pos, b.pos)) < a.radius + b.radius;
	    }
	    static interact(entity, other, state) {
	        return;
	    }
	}
	exports.Entity = Entity;


/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	class EventFactory {
	    static createEvent(type, initiator, receptor) {
	        return Object.assign({
	            type,
	            initiator,
	            receptor
	        });
	    }
	}
	exports.EventFactory = EventFactory;


/***/ },
/* 11 */
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const entity_1 = __webpack_require__(9);
	const player_1 = __webpack_require__(8);
	const vector_1 = __webpack_require__(11);
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
	                if (other.id !== bullet.source) {
	                    player_1.Player.takeDamage(other, bullet.damage);
	                    bullet.alive = false;
	                }
	                break;
	        }
	    }
	    static spawnFrom(entity) {
	        let base = Bullet.init();
	        base.source = entity.id;
	        base.pos = { x: entity.pos.x, y: entity.pos.y };
	        base.vel = vector_1.Vec.mul(vector_1.Vec.direction(entity.orientation), BULLET_SPEED);
	        return base;
	    }
	}
	exports.Bullet = Bullet;


/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ }
/******/ ]);
//# sourceMappingURL=backendhost.js.map