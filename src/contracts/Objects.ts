import { Container, Graphics } from "pixi.js";
import { Vector } from "../math/Vector";
import { ICollider, ICollisionData } from "./Colliders";

export interface IGameObject {
    visuals: Container|Graphics,
    position: Vector,
    angle: number,
    collider?: ICollider,

    isActive(): this is IActiveGameObject
}

export interface IActiveGameObject extends IGameObject {
    update(deltaTime: number): void,
    onCollision(collider: ICollider, data: ICollisionData): void,
}