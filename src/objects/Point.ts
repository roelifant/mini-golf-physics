import { IActiveGameObject } from "../contracts/Objects";
import { ShapeFactory } from "../factories/ShapeFactory";
import { Collider } from "../game/Collider";
import { Player } from "../game/Player";
import { Vector } from "../math/vector/Vector";
import { StaticShapeObject } from "./StaticShapeObject";
import { GameService } from "../services/GameService";
import { MiniGolfScene } from "../scenes/MinigolfScene";

export class Point extends StaticShapeObject implements IActiveGameObject {
    public owner: Player|null;

    public get claimed(): boolean {
        return !!this.owner;
    }

    constructor (position: Vector,) {
        const starShape = ShapeFactory.getPreset('star', 0.3);
        super(starShape, position, 0);
        this.collider = new Collider(this, starShape, this.position, 0, ['point']);
        this.owner = null;
    }

    public update(deltaTime: number): void {
        if(!this.claimed) {
            return; 
        }

        this.angle += deltaTime/1000;
        this.visuals.rotation = this.angle;
        this.collider?.setAngle(this.angle);
    }

    public isActive(): this is IActiveGameObject {
        return true;
    }

    public hit(player: Player) {
        if(this.owner?.name === player.name) {
            return;
        }
        this.claim(player);
    }

    public claim(player: Player) {
        if(this.claimed) {
            this.owner!.points--;
        }
        this.owner = player;
        this.owner.points++;
        this.color = player.color;
        this.visuals.tint = this.color;
        (<MiniGolfScene>GameService.instance.scene)
            .triggerRipple(this.position.copy(), player.color);
    }
}