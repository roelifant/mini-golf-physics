import { IActiveGameObject } from "../contracts/Objects";
import { DefinedShape } from "../contracts/Shapes";
import { MathUtils } from "../math/MathUtils";
import { Vector } from "../math/vector/Vector";
import { Wall } from "./Wall";

export class BreakableWall extends Wall implements IActiveGameObject {
    private hitpoints: number;
    private fullHitpoints: number;
    private fullAlpha: number;
    private currentAlpha: number;

    constructor(shape: DefinedShape, position: Vector, angle: number, hitpoints: number = 1) {
        super(shape, position, angle);
        this.fullAlpha = .5;
        this.currentAlpha = this.fullAlpha;
        this.visuals.alpha = this.fullAlpha;
        this.fullHitpoints = hitpoints;
        this.hitpoints = this.fullHitpoints;
        this.collider?.addTag('breakable');
    }

    public isActive(): this is IActiveGameObject {
        return true;
    }

    public hit(color: number) {
        if(this.hitpoints <= 0) {
            return;
        }

        this.hitpoints--;
        const percentage = this.hitpoints / this.fullHitpoints;
        this.currentAlpha = this.fullAlpha * percentage;
        this.visuals.alpha = 1;
        this.visuals.tint = color;

        if(this.hitpoints <= 0) {
            this.visuals.alpha = 0;
            setTimeout(() => this.collider?.destroy(), 0);
        }
    }

    public update() {
        if (this.visuals.tint === 0xffffff && this.visuals.alpha === this.currentAlpha) {
            return;
        }

        const steps = 10;

        const alphaDiff = Math.abs(this.visuals.alpha - this.currentAlpha);
        
        this.visuals.alpha -= alphaDiff / (steps-1);
        if(this.visuals.alpha < this.currentAlpha) {
            this.visuals.alpha = this.currentAlpha;
        }
        const hsl = MathUtils.convertHexToHSL(this.visuals.tint);
        let l = hsl.l;

        const diff = 100 - l;

        if (l < 100) {
            l += diff / steps;
        }

        if (l > 100){
            l = 100;
        }

        this.visuals.tint = MathUtils.convertHSLToHex(hsl.h, hsl.s, l);
    }
}