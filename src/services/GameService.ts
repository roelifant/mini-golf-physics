import { PixiManager } from "../pixi/PixiManager";
import { Scene } from "../pixi/Scene";

export class GameService {
    static #instance: GameService;

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() { }

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

    public get scene(): Scene {
        return PixiManager.scene;
    }
}