import { ILevelDefinition, ILevelShapeObject, LevelContents, LevelSize } from "../contracts/Levels";
import { ICurveablePoint, Shape } from "../contracts/Shapes";
import { MathUtils } from "../math/MathUtils";
import { Vector } from "../math/vector/Vector";

export class Level {
    public definition: ILevelDefinition;

    constructor(name: string, size: LevelSize, contents: LevelContents) {
        this.definition = {
            name,
            size,
            contents
        };
        const rng = Math.random();
        if(rng < 0.66) {
            if(rng < 0.33) {
                this.mirror('y');
            } else {
                this.mirror('x');
            }
        }
        const angles = [
            0,
            90,
            180,
            180+90
        ]
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];
        this.rotate(MathUtils.degreesToRadians(randomAngle));
    }

    private mirror(axis: 'x'|'y') {
        const newContents: LevelContents = [];
        const contents = <LevelContents>JSON.parse(JSON.stringify(this.definition.contents));
        for (const content of contents) {
            const originalPosition = Vector.fromPoint(content.position);
            let newPosition = originalPosition.reflectOverPoint(new Vector(0, originalPosition.y));
            if(axis === 'y') {
                newPosition = originalPosition.reflectOverPoint(new Vector(originalPosition.x, 0));
            }
            content.position = newPosition.toPoint();
            if(!content.angle) {
                content.angle = 0;
            }
            if(content.hasOwnProperty('shape')) {
                const shape = (<ILevelShapeObject>content).shape;
                if(shape.type === Shape.POLYGON || shape.type === Shape.CURVABLEPOLYGON) {
                    const newPoints: Array<ICurveablePoint> = []
                    for (const point of shape.points) {
                        let control = false;
                        if(point.hasOwnProperty('control') && !!(<ICurveablePoint>point).control) {
                            control = true;
                        }
                        let newPointPosition = Vector.fromPoint(point).add(originalPosition).reflectOverPoint(new Vector(0, point.y));
                        if(axis === 'y') {
                            newPointPosition = Vector.fromPoint(point).add(originalPosition).reflectOverPoint(new Vector(point.x, 0));
                        }
                        newPointPosition = newPointPosition.add(originalPosition);
                        const newPoint = <ICurveablePoint>newPointPosition.toPoint();
                        newPoint.control = control;
                        console.log(newPoint);
                        newPoints.push(newPoint);
                    }
                    shape.points = <Array<ICurveablePoint>>newPoints;
                }
                content.angle = -content.angle;
            }
            newContents.push(content);
        }
        this.definition.contents = newContents;
    }

    private rotate(radians: number) {
        const origin = Vector.empty();
        const newContents: LevelContents = [];
        const contents = JSON.parse(JSON.stringify(this.definition.contents));
        for (const content of contents) {
            content.position = Vector.fromPoint(content.position).rotateAroundAnchor(radians,origin).toPoint();
            if(!content.angle) {
                content.angle = 0;
            }
            content.angle += radians;
            newContents.push(content);
        }
        this.definition.contents = newContents;
    }
}