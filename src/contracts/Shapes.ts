import { IPoint } from "../math/VectorInterfaces";

export type DefinedShape = ICircle|IEllipse|IRectangle|IPolygon;

export enum Shape {
    CIRCLE = 'circle',
    ELLIPSE = 'ellipse',
    RECTANGLE = 'rectangle',
    POLYGON = 'polygon',
}

export interface IShape {
    type: Shape,
}

export interface ICircle extends IShape{
    type: Shape.CIRCLE,
    radius: number,
}

export interface IEllipse extends IShape{
    type: Shape.ELLIPSE,
    radius: {
        x: number,
        y: number,
    },
}

export interface IRectangle extends IShape{
    type: Shape.RECTANGLE,
    width: number,
    height: number,
}

export interface IPolygon extends IShape{
    type: Shape.POLYGON,
    points: Array<IPoint>,
}