import { VectorAngleEnum } from "./VectorEnums"

export interface IPoint {
    x: number,
    y: number,
    z?: number
}

export interface IVectorConfig {
    angles: VectorAngleEnum
}