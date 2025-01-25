import { Container, Graphics } from "pixi.js";
import { Vector } from "../math/vector/Vector";
import { ICollider, ICollisionData } from "./Colliders";

export interface IGameObject {
    visuals: Container|Graphics,
    position: Vector,
    angle: number,
    collider?: ICollider,

    isActive(): this is IActiveGameObject,
    isTrigger(): this is ITriggerGameObject,
}

export interface ITriggerGameObject extends IGameObject {
    onCollision(collider: ICollider, data: ICollisionData): void,
}

export interface IActiveGameObject extends IGameObject {
    update(deltaTime: number): void,
}