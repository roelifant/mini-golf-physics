import { IPoint } from "../math/vector/VectorInterfaces";

export type DefinedShape = ICircle | IEllipse | IRectangle | IPolygon | ICurveablePolygon;

export enum Shape {
    CIRCLE = 'circle',
    ELLIPSE = 'ellipse',
    RECTANGLE = 'rectangle',
    POLYGON = 'polygon',
    CURVABLEPOLYGON = 'curvablepolygon',
}

export interface IShape {
    type: Shape,
}

export interface ICircle extends IShape {
    type: Shape.CIRCLE,
    radius: number,
}

export interface IEllipse extends IShape {
    type: Shape.ELLIPSE,
    radius: {
        x: number,
        y: number,
    },
}

export interface IRectangle extends IShape {
    type: Shape.RECTANGLE,
    width: number,
    height: number,
}

export interface IPolygonPoint extends IPoint {
    z: undefined,
}

export interface IPolygon extends IShape {
    type: Shape.POLYGON,
    points: Array<IPolygonPoint>,
}

export interface ICurveablePoint extends IPolygonPoint {
    control?: boolean,
}

export interface ICurveablePolygon extends IShape {
    type: Shape.CURVABLEPOLYGON,
    points: Array<ICurveablePoint>;
}