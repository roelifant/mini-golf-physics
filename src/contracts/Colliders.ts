import { Vector } from "../math/vector/Vector";
import { IPoint } from "../math/vector/VectorInterfaces";
import { IGameObject } from "./Objects";
import { IShape } from "./Shapes";

export interface ICollider {
    shape: IShape,
    owner: IGameObject,
    tags: Array<string>,
    isStatic: boolean,

    hasTag(tag: string): boolean,
    setPosition(position: Vector): void,
    setAngle(angle: number): void,
    destroy(): void,
    handleCollision(collider: ICollider, data: ICollisionData): void
}

export interface ICollisionData {
    insideOther: boolean,
    insideThis: boolean,
    overlap: number,
    overlapN: IPoint,
    overlapV: IPoint
}