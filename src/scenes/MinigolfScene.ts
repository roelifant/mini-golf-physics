import { Container } from "pixi.js";
import { IGameObject } from "../contracts/Objects";
import { Vector } from "../math/Vector";
import { Ball } from "../objects/Ball";
import { Wall } from "../objects/Wall";
import { Scene } from "../pixi/Scene";
import { CollisionService } from "../services/CollisionService";
import { ICircle, IRectangle, Shape } from "../contracts/Shapes";

export class MiniGolfScene extends Scene {
    public key = 'minigolf';
    public centered = true;
    public balls: Array<Ball> = [];

    public setup() {

        const horizontalWallShape = <IRectangle>{
            type: Shape.RECTANGLE,
            width: 1000,
            height: 100
        };
        const verticalWallShape = <IRectangle>{
            type: Shape.RECTANGLE,
            width: 100,
            height: 1000
        }
        const circleWallShape = <ICircle>{
            type: Shape.CIRCLE,
            radius: 50
        }
        
        this.addGameObjects([
            new Wall(horizontalWallShape, new Vector(0, 350), this.randomWobble()),
            new Wall(horizontalWallShape, new Vector(0, -350), this.randomWobble()),
            new Wall(verticalWallShape, new Vector(-550, 0), this.randomWobble()),
            new Wall(verticalWallShape, new Vector(550, 0), this.randomWobble()),

            new Wall(circleWallShape, new Vector(400, 0), this.randomSpin()),
            new Wall(circleWallShape, new Vector(-400, 0), this.randomSpin()),
            new Wall(circleWallShape, new Vector(0, 200), this.randomSpin()),
            new Wall(circleWallShape, new Vector(0, -200), this.randomSpin()),

            new Wall(circleWallShape, new Vector(250, 150), this.randomSpin()),
            new Wall(circleWallShape, new Vector(250, -150), this.randomSpin()),
            new Wall(circleWallShape, new Vector(-250, 150), this.randomSpin()),
            new Wall(circleWallShape, new Vector(-250, -150), this.randomSpin()),
        ])
        const ball = new Ball(this, 0, 0, 25);
        this.addGameObject(ball);
        this.balls.push(ball);
    }

    public update(deltaTime: number) {
        for (const ball of this.balls) {
            ball.update(deltaTime);
        }
        CollisionService.instance.update();
    }

    private randomWobble(): number {
        return Vector.utils.degreesToRadians((Math.random() * 10)-5);
    }

    private randomSpin(): number {
        return Vector.utils.degreesToRadians((Math.random() * 360)-180);
    }

    private addGameObjects(objects: Array<IGameObject>, container: Container|null = null) : void
    {
        for (const object of objects) {
            this.addGameObject(object, container);
        }
    }

    private addGameObject(object: IGameObject, container: Container|null = null): void {
        if(!!container) {
            container.addChild(object.visuals);
            return;
        }
        this.stage.addChild(object.visuals);

    }
}