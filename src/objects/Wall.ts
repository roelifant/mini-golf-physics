import { Container, ContainerChild, Graphics } from "pixi.js";
import { ICollider } from "../contracts/Colliders";
import { IActiveGameObject, IGameObject } from "../contracts/Objects";
import { Vector } from "../math/Vector";
import { Scene } from "../pixi/Scene";
import { Collider } from "../colliders/Collider";
import { Shape } from "../contracts/Shapes";

export class Wall implements IGameObject {
    public visuals: Container<ContainerChild> | Graphics;
    public position: Vector;
    public collider?: ICollider | undefined;
    public angle: number;
    
    constructor (scene: Scene, x: number, y: number, width: number, height: number, angle: number) {
        this.visuals = (new Graphics())
        .rect(0, 0, width, height)
        .fill(0xffffff);
        this.visuals.pivot.x = width/2;
        this.visuals.pivot.y = height/2;
        this.visuals.rotation = angle;
        scene.add(this.visuals);

        this.visuals.position.x = x;
        this.visuals.position.y = y;

        this.position = new Vector(x, y);
        this.angle = angle;

        const shape = {
            type: Shape.RECTANGLE,
            width: width,
            height: height
        }
        this.collider = new Collider(this, shape, this.position, angle, ['wall']);
    }

    public isActive(): this is IActiveGameObject
    {
        return false;
    }
}