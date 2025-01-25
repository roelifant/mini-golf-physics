import { LevelObjectType, LevelSize } from "../contracts/Levels";
import { ICircle, ICurveablePolygon, IEllipse, IPolygon, IRectangle, Shape } from "../contracts/Shapes";
import { MathUtils } from "../math/MathUtils";
import { Vector } from "../math/vector/Vector";
import { IPoint } from "../math/vector/VectorInterfaces";
import { Level } from "./Level";

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
        { x: 0, y: -80 },
        { x: 80, y: 50 },
        { x: -80, y: 50 },
    ]
}
const concaveWallShape = <IPolygon>{
    type: Shape.POLYGON,
    points: [
        { x: -50, y: -100 },
        { x: 80, y: -100 },
        { x: 70, y: -75 },
        { x: 55, y: -50 },
        { x: 40, y: -25 },
        { x: 35, y: 0 },
        { x: 40, y: 25 },
        { x: 55, y: 50 },
        { x: 70, y: 75 },
        { x: 80, y: 100 },
        { x: -50, y: 100 },
    ]
}
concaveWallShape.points.forEach((point: IPoint) => {
    point.x *= 1.5;
    point.y *= 1.5;
});

const curvedConcaveWallShape = <ICurveablePolygon>{
    type: Shape.CURVABLEPOLYGON,
    points: [
        { x: 80, y: 100, control: false },
        { x: -50, y: 100, control: false },
        { x: -50, y: -100, control: false },
        { x: 80, y: -100, control: false },
        { x: 35, y: -75, control: true },
        { x: 35, y: -25, control: true },
        { x: 35, y: 0, control: false },
        { x: 35, y: 25, control: true },
        { x: 35, y: 50, control: true },
    ]
}
curvedConcaveWallShape.points.forEach((point: IPoint) => {
    point.x *= 2;
    point.y *= 2;
});

export const testLevel = new Level('test', LevelSize.SMALL, [
    {
        type: LevelObjectType.FLOOR,
        shape: <IRectangle>{
            type: Shape.RECTANGLE,
            width: 1100,
            height: 700
        },
        position: new Vector(0, 0)
    },
    {
        type: LevelObjectType.WALL,
        shape: horizontalWallShape,
        position: new Vector(0, 350)
    },
    {
        type: LevelObjectType.WALL,
        shape: horizontalWallShape,
        position: new Vector(0, -350)
    },
    {
        type: LevelObjectType.WALL,
        shape: verticalWallShape,
        position: new Vector(-550, 0)
    },
    {
        type: LevelObjectType.WALL,
        shape: verticalWallShape,
        position: new Vector(550, 0)
    },
    {
        type: LevelObjectType.WALL,
        shape: curvedConcaveWallShape,
        position: new Vector(-500, -300),
        angle: MathUtils.degreesToRadians(45)
    },
    {
        type: LevelObjectType.WALL,
        shape: curvedConcaveWallShape,
        position: new Vector(500, -300),
        angle: MathUtils.degreesToRadians(90+45)
    },
    {
        type: LevelObjectType.WALL,
        shape: curvedConcaveWallShape,
        position: new Vector(-500, 300),
        angle: MathUtils.degreesToRadians(-45)
    },
    {
        type: LevelObjectType.WALL,
        shape: curvedConcaveWallShape,
        position: new Vector(500, 300),
        angle: MathUtils.degreesToRadians(-90-45)
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: circleWallShape,
        position: new Vector(400, 0),
        hitpoints: 3
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: ellipseWallShape,
        position: new Vector(-400, 0),
        hitpoints: 3
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: triangleWallShape,
        position: new Vector(0, 200),
        hitpoints: 3
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: circleWallShape,
        position: new Vector(0, -200),
        hitpoints: 3
    },
    {
        type: LevelObjectType.SPAWN,
        position: new Vector(0, 0),
    },
]);