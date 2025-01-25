import { Container } from "pixi.js";
import { IGameObject } from "../contracts/Objects";
import { Vector } from "../math/vector/Vector";
import { Ball } from "../objects/Ball";
import { Wall } from "../objects/Wall";
import { Scene } from "../pixi/Scene";
import { CollisionService } from "../services/CollisionService";
import { ICircle, ICurveablePolygon, IEllipse, IPolygon, IRectangle, Shape } from "../contracts/Shapes";
import { Floor } from "../objects/Floor";
import { IPoint } from "../math/vector/VectorInterfaces";
import { IMouseListenerClickEvent, MouseListener } from "../listeners/MouseListener";
import { GameService } from "../services/GameService";
import { BreakableWall } from "../objects/BreakableWall";

export class MiniGolfScene extends Scene {
    public key = 'minigolf';
    public centered = true;
    private balls: Array<Ball> = [];

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

        const floorContainer = new Container();
        const ballContainer = new Container();
        const wallContainer = new Container();
        const arrowContainer = new Container();
        this.add(floorContainer);
        this.add(ballContainer);
        this.add(wallContainer);
        this.add(arrowContainer);

        const floorShape = <IRectangle>{
            type: Shape.RECTANGLE,
            width: 1100,
            height: 700
        };

        this.addGameObject(new Floor(floorShape, new Vector(0,0), 0), floorContainer);

        const horizontalWallShape = <IRectangle>{
            type: Shape.RECTANGLE,
            width: 1200,
            height: 100
        };
        const verticalWallShape = <IRectangle>{
            type: Shape.RECTANGLE,
            width: 100,
            height: 900
        }
        const circleWallShape = <ICircle>{
            type: Shape.CIRCLE,
            radius: 50
        }
        const ellipseWallShape = <IEllipse>{
            type: Shape.ELLIPSE,
            radius: {
                x: 30,
                y: 80
            }
        }
        const triangleWallShape = <IPolygon>{
            type: Shape.POLYGON,
            points: [
                {x: 0, y: -80},
                {x: 80, y: 50},
                {x: -80, y: 50},
            ]
        }
        const concaveWallShape = <IPolygon>{
            type: Shape.POLYGON,
            points: [
                {x: -50, y: -100},
                {x: 80, y: -100},
                {x: 70, y: -75},
                {x: 55, y: -50},
                {x: 40, y: -25},
                {x: 35, y: 0},
                {x: 40, y: 25},
                {x: 55, y: 50},
                {x: 70, y: 75},
                {x: 80, y: 100},
                {x: -50, y: 100},
            ]
        }
        concaveWallShape.points.forEach((point: IPoint) => {
            point.x *= 1.5;
            point.y *= 1.5;
        });

        const curvedConcaveWallShape = <ICurveablePolygon>{
            type: Shape.CURVABLEPOLYGON,
            points: [
                {x: 80, y: 100, control: false},
                {x: -50, y: 100, control: false},
                {x: -50, y: -100, control: false},
                {x: 80, y: -100, control: false},
                {x: 35, y: -75, control: true},
                {x: 35, y: -25, control: true},
                {x: 35, y: 0, control: false},
                {x: 35, y: 25, control: true},
                {x: 35, y: 50, control: true},
            ]
        }
        curvedConcaveWallShape.points.forEach((point: IPoint) => {
            point.x *= 2;
            point.y *= 2;
        });
        
        this.addGameObjects([
            new Wall(horizontalWallShape, new Vector(0, 350), this.randomWobble()),
            new Wall(horizontalWallShape, new Vector(0, -350), this.randomWobble()),
            new Wall(verticalWallShape, new Vector(-550, 0), this.randomWobble()),
            new Wall(verticalWallShape, new Vector(550, 0), this.randomWobble()),

            new BreakableWall(circleWallShape, new Vector(400, 0), this.randomSpin(), 3),
            new BreakableWall(ellipseWallShape, new Vector(-400, 0), this.randomSpin(), 3),
            new BreakableWall(triangleWallShape, new Vector(0, 200), this.randomSpin(), 3),
            new BreakableWall(circleWallShape, new Vector(0, -200), this.randomSpin(), 3),

            new Wall(curvedConcaveWallShape, new Vector(-500, -300), Vector.utils.degreesToRadians(45)),
            new Wall(curvedConcaveWallShape, new Vector(500, -300), Vector.utils.degreesToRadians(90+45)),
            new Wall(curvedConcaveWallShape, new Vector(-500, 300), Vector.utils.degreesToRadians(-45)),
            new Wall(curvedConcaveWallShape, new Vector(500, 300), Vector.utils.degreesToRadians(-90-45)),

        ], wallContainer);
        const ball = new Ball(this, 0, 0, 20);
        this.addGameObject(ball, ballContainer);
        arrowContainer.addChild(ball.arrowContainer);
        this.balls.push(ball);

        MouseListener.registerClickHandler((event: IMouseListenerClickEvent) => {
            const ball = this.balls[0];
            if(ball.canLaunch) {
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