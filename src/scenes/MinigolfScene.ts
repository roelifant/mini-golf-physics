import { Vector } from "../math/Vector";
import { Ball } from "../objects/Ball";
import { Wall } from "../objects/Wall";
import { Scene } from "../pixi/Scene";
import { CollisionService } from "../services/CollisionService";

export class MiniGolfScene extends Scene {
    public key = 'minigolf';
    public centered = true;
    public balls: Array<Ball> = [];

    public setup() {

        const wallBottom = new Wall(this, 0, 300, 1000, 100, this.randomWobble());
        const wallTop = new Wall(this, 0, -350, 1000, 100, this.randomWobble());
        const wallLeft = new Wall(this, -500, 0, 100, 1000, this.randomWobble());
        const wallRight = new Wall(this, 500, 0, 100, 1000, this.randomWobble());
        const ball = new Ball(this, 0, 0, 25);
        this.balls.push(ball);
    }

    public update(deltaTime: number) {
        for (const ball of this.balls) {
            ball.update(deltaTime);
        }
        CollisionService.instance.update();
    }

    private randomWobble(): number {
        return Vector.utils.degreesToRadians((Math.random() * 10)-5);
    }
}