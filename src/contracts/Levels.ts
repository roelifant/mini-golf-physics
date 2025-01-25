import { Vector } from "../math/vector/Vector";
import { DefinedShape } from "./Shapes";

export enum LevelObjectType {
    WALL = 'wall',
    BREAKABLE_WALL = 'breakable-wall',
    FLOOR = 'floor',
    SPAWN = 'spawn',
}

export enum LevelSize {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
}

export interface ILevelObject {
    type: LevelObjectType
    position: Vector
    angle?: number
}

export interface ILevelShapeObject extends ILevelObject {
    type: LevelObjectType.WALL|LevelObjectType.BREAKABLE_WALL|LevelObjectType.FLOOR
    shape: DefinedShape
}

export interface ILevelBreakableWallObject extends ILevelShapeObject {
    type: LevelObjectType.BREAKABLE_WALL,
    hitpoints?: number
}

export interface ILevelDefinition {
    name: string,
    size: LevelSize
    contents: Array<ILevelObject|ILevelShapeObject|ILevelBreakableWallObject>
}