import { Ball } from "../objects/Ball";

export class Player {
    public name: string;
    public color: number;
    public points: number;
    public ball?: Ball;

    constructor(name: string, color: number) {
        this.name = name;
        this.color = color;
        this.points = 0;
    }
}