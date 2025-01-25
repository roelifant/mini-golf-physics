import { DefinedShape } from "../contracts/Shapes";
import { Vector } from "../math/vector/Vector";
import { Wall } from "./Wall";

export class BreakableWall extends Wall {
    private hitpoints: number;
    private fullHitpoints: number;
    private fullAlpha: number;

    constructor(shape: DefinedShape, position: Vector, angle: number, hitpoints: number = 1) {
        super(shape, position, angle);
        this.fullAlpha = .5;
        this.visuals.alpha = this.fullAlpha;
        this.fullHitpoints = hitpoints;
        this.hitpoints = this.fullHitpoints;
        this.collider?.addTag('breakable');
    }

    public hit() {
        if(this.hitpoints <= 0) {
            return;
        }

        this.hitpoints--;
        const percentage = this.hitpoints / this.fullHitpoints;
        this.visuals.alpha = this.fullAlpha * percentage;
        if(this.hitpoints <= 0) {
            this.visuals.alpha = 0;
            setTimeout(() => this.collider?.destroy(), 0);
        }
    }
}