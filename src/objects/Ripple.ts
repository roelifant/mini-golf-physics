import { Graphics } from "pixi.js";
import { IActiveGameObject, ITriggerGameObject } from "../contracts/Objects";
import { Vector } from "../math/vector/Vector";
import { GameService } from "../services/GameService";

export class Ripple implements IActiveGameObject{
    public visuals: Graphics = new Graphics();
    public position: Vector;
    public angle: number = 0;
    public color: number;
    public maxDuration: number = 700;
    public startTime: number = 0;
    public finished: boolean = false;

    constructor(position: Vector, color: number) {
        this.position = position;
        this.color = color;
        this.startTime = GameService.instance.scene?.sceneTime ?? 0;
    }

    public update(_deltaTime: number): void {
        if(this.finished) return;
        const ellapsedTime = GameService.instance.scene?.sceneTime - this.startTime;
        if(ellapsedTime > this.maxDuration) {
            this.finished = true;
            this.visuals.clear();
            this.visuals.destroy();
            return;
        }
        
        const size = 1 + (ellapsedTime/2);
        const progressionPercentage = ellapsedTime / this.maxDuration;
        const width = 15 - (progressionPercentage*15);
        const opacity = 1 - (progressionPercentage * 0.8);
        this.visuals
            .clear()
            .circle(this.position.x, this.position.y, size)
            .stroke({
                color: this.color,
                width: width
            });
        this.visuals.alpha = opacity;
    }

    public isActive(): this is IActiveGameObject {
        return true;
    }

    public isTrigger(): this is ITriggerGameObject {
        return false;
    }
}