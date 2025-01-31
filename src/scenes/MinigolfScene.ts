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
import { Ripple } from "../objects/Ripple";
import { Point } from "../objects/Point";
import { Hole } from "../objects/Hole";

export class MiniGolfScene extends Scene {
    public key = 'minigolf';
    public centered = true;

    public get currentPlayer(): Player {
        return GameService.instance.players[this.turn-1];
    }

    private level: Level;
    private floorContainer = new Container();
    private holeContainer = new Container();
    private pointContainer = new Container();
    private ballContainer = new Container();
    private wallContainer = new Container();
    private breakableWallContainer = new Container();
    private effectsContainer = new Container();
    private arrowContainer = new Container();
    private turn: number;
    private round: number;
    private currentSpawn: number = 0;
    private waitingForTurnToEnd: boolean = false;
    private gameObjects: Array<IGameObject> = [];
    private ripples: Array<Ripple> = [];
    private points: Array<Point> = [];
    private balls: Array<Ball> = [];
    private spawns: Array<Vector> = [];

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
        this.add(this.holeContainer);
        this.add(this.pointContainer);
        this.add(this.ballContainer);
        this.add(this.breakableWallContainer);
        this.add(this.wallContainer);
        this.add(this.effectsContainer);
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
        for(const object of this.gameObjects) {
            if(object.isActive()) {
                object.update(deltaTime);
            }
        }
        CollisionService.instance.update();

        if(this.waitingForTurnToEnd) {
            let moving = false;
            for (const ball of this.balls) {
                if(ball.momentum.length > 0) {
                    moving = true;
                }
            }

            if(!moving) {
                this.waitingForTurnToEnd = false;
                this.endTurn();
            }
        }

        // clear ripples
        this.ripples = this.ripples.filter(ripple => {
            if(ripple.finished) {
                this.gameObjects = this.gameObjects.filter(object => object !== ripple);
                return false;
            }

            return true;
        });
    }

    public triggerRipple(position: Vector, color: number) {
        const ripple = new Ripple(position, color);
        this.ripples.push(ripple);
        this.addGameObject(ripple, this.effectsContainer);
    }

    private addGameObject(object: IGameObject, container: Container | null = null): void {
        this.gameObjects.push(object);
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
                this.addGameObject(new Floor(
                    floorDefinition.shape,
                    Vector.fromPoint(floorDefinition.position),
                    floorDefinition.angle ?? 0
                ), this.floorContainer)
                continue;
            }

            if (object.type === LevelObjectType.WALL) {
                const wallDefinition = <ILevelShapeObject>object;
                this.addGameObject(new Wall(
                    wallDefinition.shape,
                    Vector.fromPoint(wallDefinition.position),
                    wallDefinition.angle ?? 0
                ), this.wallContainer)
                continue;
            }

            if (object.type === LevelObjectType.BREAKABLE_WALL) {
                const wallDefinition = <ILevelBreakableWallObject>object;
                this.addGameObject(new BreakableWall(
                    wallDefinition.shape,
                    Vector.fromPoint(wallDefinition.position),
                    wallDefinition.angle ?? 0,
                    wallDefinition.hitpoints
                ), this.breakableWallContainer)
                continue;
            }

            if (object.type === LevelObjectType.POINT) {
                const point = new Point(Vector.fromPoint(object.position));
                this.addGameObject(point, this.pointContainer);
                this.points.push(point);
                continue;
            }

            if (object.type === LevelObjectType.SPAWN) {
                this.spawns.push(Vector.fromPoint(object.position));
                continue;
            }

            if (object.type === LevelObjectType.HOLE) {
                this.addGameObject(new Hole(Vector.fromPoint(object.position), 2), this.holeContainer);
            }
        }
    }

    private setupBallForPlayer(player: Player) {
        const ball = new Ball(this, this.spawns[this.currentSpawn].copy(), 20, player.color);
        player.assignBall(ball);
        this.addGameObject(ball, this.ballContainer);
        this.arrowContainer.addChild(ball.arrowContainer);
        this.balls.push(ball);

        this.currentSpawn++;
        if(this.currentSpawn > this.spawns.length-1) {
            this.currentSpawn = 0;
        }
    }

    public waitForTurnToEnd() {
        this.waitingForTurnToEnd = true;
    }

    private endTurn() {
        for (const ball of this.balls) {
            ball.hit = false;
        }
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
    }
}