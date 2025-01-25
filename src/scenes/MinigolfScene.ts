import { Container } from "pixi.js";
import { IGameObject } from "../contracts/Objects";
import { Vector } from "../math/vector/Vector";
import { Ball } from "../objects/Ball";
import { Wall } from "../objects/Wall";
import { Scene } from "../pixi/Scene";
import { CollisionService } from "../services/CollisionService";
import { Floor } from "../objects/Floor";
import { IMouseListenerClickEvent, MouseListener } from "../listeners/MouseListener";
import { GameService } from "../services/GameService";
import { BreakableWall } from "../objects/BreakableWall";
import { Level } from "../game/Level";
import { ILevelBreakableWallObject, ILevelShapeObject, LevelObjectType } from "../contracts/Levels";
import { Player } from "../game/Player";

export class MiniGolfScene extends Scene {
    public key = 'minigolf';
    public centered = true;

    public get currentPlayer(): Player {
        return GameService.instance.players[this.turn-1];
    }

    private balls: Array<Ball> = [];
    private level: Level;
    private floorContainer = new Container();
    private ballContainer = new Container();
    private wallContainer = new Container();
    private breakableWallContainer = new Container();
    private arrowContainer = new Container();
    private spawns: Array<Vector> = [];
    private turn: number;
    private round: number;
    private currentSpawn: number = 0;

    constructor(level: Level) {
        super();
        this.level = level;
        this.turn = 0;
        this.round = 0;
    }

    public setup() {
        // enable zoom
        this.stage
            .wheel({
                smooth: 8
            })
            .clampZoom({
                minScale: 0.3,
                maxScale: 2.5,
            });

        // set up
        this.add(this.floorContainer);
        this.add(this.ballContainer);
        this.add(this.breakableWallContainer);
        this.add(this.wallContainer);
        this.add(this.arrowContainer);
        this.buildLevel();

        // controls
        MouseListener.registerClickHandler((event: IMouseListenerClickEvent) => {
            const ball = this.currentPlayer.ball;
            if(!ball) {
                return;
            }
            if (ball.canLaunch) {
                ball.launch(GameService.instance.worldMousePosition, Date.now() - event.downSince);
            }
        });

        this.endTurn();
    }

    public update(deltaTime: number) {
        for (const ball of this.balls) {
            ball.update(deltaTime);
        }
        CollisionService.instance.update();
    }

    private addGameObject(object: IGameObject, container: Container | null = null): void {
        if (!!container) {
            container.addChild(object.visuals);
            return;
        }
        this.stage.addChild(object.visuals);
    }

    private buildLevel() {
        for (const object of this.level.definition.contents) {
            if (object.type === LevelObjectType.FLOOR) {
                const floorDefinition = <ILevelShapeObject>object;
                this.addGameObject(new Floor(floorDefinition.shape, floorDefinition.position, floorDefinition.angle ?? 0), this.floorContainer)
                continue;
            }

            if (object.type === LevelObjectType.WALL) {
                const wallDefinition = <ILevelShapeObject>object;
                this.addGameObject(new Wall(wallDefinition.shape, wallDefinition.position, wallDefinition.angle ?? 0), this.wallContainer)
                continue;
            }

            if (object.type === LevelObjectType.BREAKABLE_WALL) {
                const wallDefinition = <ILevelBreakableWallObject>object;
                this.addGameObject(new BreakableWall(wallDefinition.shape, wallDefinition.position, wallDefinition.angle ?? 0, wallDefinition.hitpoints), this.breakableWallContainer)
                continue;
            }

            if (object.type === LevelObjectType.SPAWN) {
                this.spawns.push(object.position);
            }
        }
    }

    private setupBallForPlayer(player: Player) {
        const ball = new Ball(this, this.spawns[this.currentSpawn].copy(), 20, player.color);
        player.ball = ball;
        this.addGameObject(ball, this.ballContainer);
        this.arrowContainer.addChild(ball.arrowContainer);
        this.balls.push(ball);

        this.currentSpawn++;
        if(this.currentSpawn > this.spawns.length-1) {
            this.currentSpawn = 0;
        }
    }

    public endTurn() {
        this.turn++;
        if(this.turn > GameService.instance.players.length) {
            this.turn = 1;
            this.round++;
        }
        this.startTurn();
    }

    public startTurn() {
        // check if the current player has a ball
        const player = this.currentPlayer;
        let ball = this.currentPlayer.ball;
        if(!ball) {
            this.setupBallForPlayer(player);
            ball = this.currentPlayer.ball;
        }
        if(!ball) {
            throw new Error('there is no ball');
        }
        ball.control();
        console.log('control');
    }
}