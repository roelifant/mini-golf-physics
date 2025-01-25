import { Player } from "../game/Player";
import { MouseListener } from "../listeners/MouseListener";
import { Vector } from "../math/vector/Vector";
import { PixiManager } from "../pixi/PixiManager";
import { Scene } from "../pixi/Scene";

export class GameService {
    static #instance: GameService;

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() {
        this.players = [];
    }

    /**
     * The static getter that controls access to the singleton instance.
     *
     * This implementation allows you to extend the Singleton class while
     * keeping just one instance of each subclass around.
     */
    public static get instance(): GameService {
        if (!GameService.#instance) {
            GameService.#instance = new GameService();
        }

        return GameService.#instance;
    }

    public players: Array<Player>;

    public get scene(): Scene {
        return PixiManager.scene;
    }

    public get worldMousePosition(): Vector {
        const mousePosition = MouseListener.position;
        const canvasDimensions = new Vector(PixiManager.width/2,PixiManager.height/2);
        const zoom = this.scene.scale;

        return mousePosition.subtract(canvasDimensions).scale(1/zoom).add(this.scene.pan);
    }

    private playerColors: Array<number> = [
        0xf02929, // red
        0x2c62f5, // blue
        0xffc130, // yellow
        0x4db349, // green
        0xf084ce, // pink
        0x39e6d7, // cyan
        0xa54ac7, // purple
        0x634a36, // brown
        0x493663 // dark
    ];

    public setupPlayers(count: number): void {
        for (let i = 0; i < count; i++) {
            const color = this.playerColors.shift();
            if(!color) {
                throw new Error('Cannot have this many players');
            }
            this.players.push(new Player('Player '+i, color));
        }
    }
}