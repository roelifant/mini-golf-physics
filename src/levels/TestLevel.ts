import { LevelObjectType, LevelSize } from "../contracts/Levels";
import { MathUtils } from "../math/MathUtils";
import { Level } from "../game/Level";
import { ShapeFactory } from "../factories/ShapeFactory";

const horizontalWallShape = ShapeFactory.createRectangle(1200, 100);
const verticalWallShape = ShapeFactory.createRectangle(100, 900);
const curvedConcaveWallShape = ShapeFactory.createCurvablePolygon([
    { x: 80, y: 100, control: false },
    { x: -50, y: 100, control: false },
    { x: -50, y: -100, control: false },
    { x: 80, y: -100, control: false },
    { x: 35, y: -75, control: true },
    { x: 35, y: -25, control: true },
    { x: 35, y: 0, control: false },
    { x: 35, y: 25, control: true },
    { x: 35, y: 50, control: true },
], 2);

export const testLevel = new Level('test', LevelSize.SMALL, [
    {
        type: LevelObjectType.FLOOR,
        shape: ShapeFactory.createRectangle(1100, 700),
        position: {x: 0, y: 0}
    },
    {
        type: LevelObjectType.WALL,
        shape: horizontalWallShape,
        position: {x: 0, y: 350}
    },
    {
        type: LevelObjectType.WALL,
        shape: horizontalWallShape,
        position: {x: 0, y: -350}
    },
    {
        type: LevelObjectType.WALL,
        shape: verticalWallShape,
        position: {x: -550, y: 50}
    },
    {
        type: LevelObjectType.WALL,
        shape: verticalWallShape,
        position: {x: 550, y: -50}
    },
    {
        type: LevelObjectType.WALL,
        shape: curvedConcaveWallShape,
        position: {x: -500, y: -300},
        angle: MathUtils.degreesToRadians(45)
    },
    {
        type: LevelObjectType.WALL,
        shape: curvedConcaveWallShape,
        position: {x: 500, y: -300},
        angle: MathUtils.degreesToRadians(90+45)
    },
    {
        type: LevelObjectType.WALL,
        shape: curvedConcaveWallShape,
        position: {x: -500, y: 300},
        angle: MathUtils.degreesToRadians(-45)
    },
    {
        type: LevelObjectType.WALL,
        shape: curvedConcaveWallShape,
        position: {x: 500, y: 300},
        angle: MathUtils.degreesToRadians(-90-45)
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: ShapeFactory.getPreset('square'),
        position: {x: 400, y: 0},
        hitpoints: 3
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: ShapeFactory.createEllipse(30, 80),
        position: {x: -400, y: 0},
        hitpoints: 3
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: ShapeFactory.getPreset('octagon'),
        position: {x: 0, y: 200},
        hitpoints: 3
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: ShapeFactory.createRectangle(20, 60),
        position: {x: -100, y: 100},
        angle: MathUtils.degreesToRadians(30),
        hitpoints: 2
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: ShapeFactory.createRectangle(20, 60),
        position: {x: 100, y: -100},
        angle: MathUtils.degreesToRadians(180),
        hitpoints: 2
    },
    {
        type: LevelObjectType.BREAKABLE_WALL,
        shape: ShapeFactory.getPreset('star'),
        position: {x: 0, y: -200},
        hitpoints: 3
    },
    {
        type: LevelObjectType.SPAWN,
        position: {x: 0, y: 0},
    },
    {
        type: LevelObjectType.POINT,
        position: {x: 300, y: 0}
    },
    {
        type: LevelObjectType.POINT,
        position: {x: -300, y: 0}
    },
    {
        type: LevelObjectType.POINT,
        position: {x: -220, y: -120}
    },
    {
        type: LevelObjectType.POINT,
        position: {x: 220, y: -120}
    },
    {
        type: LevelObjectType.POINT,
        position: {x: 220, y: 120}
    },
    {
        type: LevelObjectType.POINT,
        position: {x: -220, y: 120}
    }
]);