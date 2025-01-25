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
import { Level } from "../levels/Level";
import { ILevelBreakableWallObject, ILevelShapeObject, LevelObjectType } from "../contracts/Levels";

export class MiniGolfScene extends Scene {
    public key = 'minigolf';
    public centered = true;

    private balls: Array<Ball> = [];
    private level: Level;
    private floorContainer = new Container();
    private ballContainer = new Container();
    private wallContainer = new Container();
    private breakableWallContainer = new Container();
    private arrowContainer = new Container();
    private spawns: Array<Vector> = [];

    constructor(level: Level) {
        super();
        this.level = level;
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

        const ball = new Ball(this, this.spawns[0].copy(), 20);
        this.addGameObject(ball, this.ballContainer);
        this.arrowContainer.addChild(ball.arrowContainer);
        this.balls.push(ball);

        MouseListener.registerClickHandler((event: IMouseListenerClickEvent) => {
            const ball = this.balls[0];
            if (ball.canLaunch) {
                ball.launch(GameService.instance.worldMousePosition, Date.now() - event.downSince);
            }
        });
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
}