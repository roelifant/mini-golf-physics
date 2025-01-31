import { Container, ContainerChild, Graphics } from "pixi.js";
import { ICollider } from "../contracts/Colliders";
import { IActiveGameObject, ITriggerGameObject } from "../contracts/Objects";
import { Vector } from "../math/vector/Vector";
import { Collider } from "../game/Collider";
import { IPolygon, Shape } from "../contracts/Shapes";
import { ShapeFactory } from "../factories/ShapeFactory";
import { GameService } from "../services/GameService";
import { Player } from "../game/Player";
import { MiniGolfScene } from "../scenes/MinigolfScene";

export class Hole implements IActiveGameObject {
    public visuals: Container<ContainerChild> = new Container();
    public position: Vector;
    public angle: number;
    public collider: ICollider;
    
    private starCount: number;
    private stars: Array<Graphics>;
    private claimed: boolean = false;

    constructor(position: Vector, stars: number = 2) {
        this.starCount = stars;
        this.position = position;
        this.angle = 0;
        const holeRadius = 30;
        const holeVisual = (new Graphics())
            .circle(position.x, position.y, holeRadius)
            .fill(0x000000);
        this.visuals.addChild(holeVisual);
        this.stars = [];
        const starShape = <IPolygon>ShapeFactory.getPreset('star', 0.2);
        for (let i = 0; i < stars; i++) {
            const star = (new Graphics())
                .poly(starShape.points)
                .fill(0xffffff);
            star.tint = 0x6b6a6a;
            this.stars.push(star);
            this.visuals.addChild(star);
        }
        const holeShape = {
            type: Shape.CIRCLE,
            radius: holeRadius,
        }
        this.collider = new Collider(this, holeShape, this.position, this.angle, ['hole']);
    }
    
    public isActive(): this is IActiveGameObject {
        return true;
    }

    public isTrigger(): this is ITriggerGameObject {
        return false;
    }
    
    public update(): void {
        const time = GameService.instance.scene?.sceneTime;
        const stepSize = 360 / this.starCount;
        let currentStepSize = stepSize + (time/10);
        for (let i = 0; i < this.starCount; i++) {
            const star = this.stars[i];
            const position = Vector
                .fromAngle(Vector.utils.degreesToRadians(currentStepSize))
                .normalize()
                .scale(45)
                .add(this.position);
            star.position.x = position.x;
            star.position.y = position.y;
            currentStepSize += stepSize;
        }
    }

    public claim(player: Player) {
        if(this.claimed) {
            return;
        }
        this.claimed = true;
        player.points += this.starCount;
        for (const star of this.stars) {
            (<MiniGolfScene>GameService.instance.scene)
                .triggerRipple(new Vector(star.position.x, star.position.y), player.color);
            star.tint = player.color;
        }
    }
}