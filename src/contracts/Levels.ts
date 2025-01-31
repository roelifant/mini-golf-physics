import { IPoint } from "../math/vector/VectorInterfaces";
import { DefinedShape } from "./Shapes";

export enum LevelObjectType {
    WALL = 'wall',
    BREAKABLE_WALL = 'breakable-wall',
    FLOOR = 'floor',
    POINT = 'point',
    SPAWN = 'spawn',
}

export enum LevelSize {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
}

export interface ILevelObject {
    type: LevelObjectType
    position: IPoint
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

export type LevelContents = Array<ILevelObject|ILevelShapeObject|ILevelBreakableWallObject>;

export interface ILevelDefinition {
    name: string,
    size: LevelSize
    contents: LevelContents
}