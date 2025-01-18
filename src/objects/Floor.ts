import { DefinedShape } from "../contracts/Shapes";
import { Vector } from "../math/vector/Vector";
import { StaticShapeObject } from "./StaticShapeObject";

export class Floor extends StaticShapeObject {
    constructor(shape: DefinedShape, position: Vector, angle: number) {
        super(shape, position, angle, 0xababab);
    }
}