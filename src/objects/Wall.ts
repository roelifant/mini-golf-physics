import { Vector } from "../math/vector/Vector";
import { Collider } from "../game/Collider";
import { StaticShapeObject } from "./StaticShapeObject";
import { DefinedShape } from "../contracts/Shapes";

export class Wall extends StaticShapeObject {
    constructor (shape: DefinedShape, position: Vector, angle: number) {
        super(shape, position, angle, 0xffffff);
        this.collider = new Collider(this, shape, this.position, angle, ['wall']);
    }
}