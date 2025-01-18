import {Application, Assets, AssetsClass, Container, ContainerChild, Ticker} from "pixi.js";
import {Scene} from "./Scene.ts";
import {CurrentSceneBehavior, IPixiStartConfig} from "./Types.ts";
import {OpenUnregisteredScenePixiManagerError, UninitialisedPixiManagerError} from "./Errors.ts";

/**
 * A pixi manager singleton to manage everything pixi
 *
 * It should manage:
 * - starting and stopping the pixi app
 * - scene management
 * - a global ticker that runs independent of any scene
 */
export class PixiManager {
    /**
     * The Pixi app
     */
    public static app: Application;

    /**
     * The current scene
     */
    public static scene: Scene;

    /**
     * The Pixi Assets class
     */
    public static assets: AssetsClass = Assets;

    /**
     * The containerin the Pixi stage that holds all scenes
     */
    public static sceneContainer: Container<ContainerChild> = new Container();

    /**
     * The canvas width
     */
    public static get width(): number {
        if(!PixiManager.initialized) {
            throw new UninitialisedPixiManagerError();
        }
        return PixiManager.canvas.clientWidth;
    }

    /**
     * The canvas height
     */
    public static get height(): number {
        if(!PixiManager.initialized) {
            throw new UninitialisedPixiManagerError();
        }
        return PixiManager.canvas.clientHeight;
    }

    /**
     * The top level Pixi stage
     */
    public static get stage(): Container<ContainerChild> {
        return PixiManager.app.stage;
    }

    /**
     * The registered scenes
     */
    private static scenes: Array<Scene> = [];

    /**
     * Has the Pixi Manager been initialized correctly with init()
     */
    private static initialized: boolean = false;

    /**
     * The HTML canvas element being used for rendering
     */
    private static canvas: HTMLCanvasElement;

    /**
     * The global ticker used by the PixiManager
     */
    private static ticker: Ticker = Ticker.shared;

    /**
     * Initializes the Pixi Manager
     */
    public static async init(PixiOrConfig: Application|IPixiStartConfig): Promise<void> {
        if(!(PixiOrConfig instanceof Application)){
            console.log('starting pixi...');
            await PixiManager.startPixi(PixiOrConfig);
            console.log('started pixi');
        } else {
            PixiManager.app = PixiOrConfig;
        }

        PixiManager.canvas = PixiManager.app.canvas;

        // add scenes container to stage
        PixiManager.stage.addChild(PixiManager.sceneContainer);

        // update scenes
        this.ticker.add(() => this.scenes.forEach(scene => {
            const time = this.ticker.elapsedMS;
            if(scene.transition && scene.transitioning){
                scene.transition.transitionTime += time;
                scene.transition.deltaTime = time;
                scene.transition.update(scene.transition.deltaTime);
            }
            if(scene.active) {
                scene.sceneTime += time * scene.speed;
                scene.deltaTime = time * scene.speed;
                scene.update(scene.deltaTime);
            }
        }));

        PixiManager.initialized = true;
    }

    /**
     * Add a scene to the manager's scene list
     */
    public static registerScene(scene: Scene): void {
        PixiManager.scenes.push(scene);
    }

    /**
     * Add multiple scenes to the manager's scene list
     */
    public static registerScenes(sceneArray: Array<Scene>): void {
        sceneArray.forEach(scene => PixiManager.registerScene(scene));
    }

    /**
     * Get a scene by its key
     */
    public static getSceneByKey(key: string): Scene {
        const scene = PixiManager.scenes.find(scene => scene.key === key);

        if(typeof scene === 'undefined'){
            throw new OpenUnregisteredScenePixiManagerError();
        }

        return scene;
    }

    /**
     * Set a new scene
     */
    public static async setScene(sceneKey: string, currentSceneBehavior: CurrentSceneBehavior = 'stop') {
        const scene = PixiManager.getSceneByKey(sceneKey);

        await scene.start();

        if(!!PixiManager.scene && PixiManager.scene.loaded){
            if(currentSceneBehavior === 'close'){
                PixiManager.scene.close();
            }
            if(currentSceneBehavior === 'stop'){
                PixiManager.scene.stop();
            }
            if(currentSceneBehavior === 'end'){
                PixiManager.scene.end();
            }
            if(currentSceneBehavior === 'clear'){
                PixiManager.scene.end(true);
            }
        }

        PixiManager.scene = scene;
    }

    /**
     * open a new scene by the scene key. The previously opened scene will be closed and moved to the background
     */
    public static async openScene(sceneKey: string): Promise<void> {
        await PixiManager.setScene(sceneKey, 'close');
    }

    /**
     * Switch the current scene by the scene key. The previously opened scene will be stopped
     */
    public static async switchScene(sceneKey: string): Promise<void> {
        await PixiManager.setScene(sceneKey, 'stop');
    }

    /**
     * Change the current scene by the scene key. The previously opened scene will be ended
     */
    public static async changeScene(sceneKey: string, clear: boolean = false): Promise<void> {
        let currentSceneBehavior = 'end';
        if(clear){
            currentSceneBehavior = 'clear';
        }
        await PixiManager.setScene(sceneKey, <CurrentSceneBehavior>currentSceneBehavior);
    }

    /**
     * End the scene, then open it again
     */
    public static async restartScene(sceneKey: string, clear: boolean = false): Promise<void> {
        PixiManager.endScene(sceneKey, clear);
        await PixiManager.openScene(sceneKey);
    }

    /**
     * End a specific scene by key
     */
    public static endScene(sceneKey: string, clear: boolean = false): void {
        const scene = PixiManager.getSceneByKey(sceneKey);

        if(!scene.alive && (!clear || (clear && scene.loaded))){
            console.warn('Scene could not be ended because it was already dead');
            return;
        }

        scene.end(clear);
    }

    /**
     * open one scene, and end all other scenes
     *
     * @param sceneKey
     * @param clear
     */
    public static async onlyScene(sceneKey: string, clear: boolean = false): Promise<void> {

        await PixiManager.changeScene(sceneKey, clear);

        PixiManager.scenes
            .filter(scene => scene.key !== sceneKey)
            .forEach(scene => scene.end(clear));
    }

    /**
     * Stop a specific scene by key
     */
    public static stopScene(sceneKey: string): void {
        const scene = PixiManager.getSceneByKey(sceneKey);

        if(!scene.active){
            console.debug('Scene could not be stopped because it was already inactive');
            return;
        }

        scene.stop();
    }

    /**
     * Close a specific scene by key
     */
    public static closeScene(sceneKey: string): void {
        const scene = PixiManager.getSceneByKey(sceneKey);

        if(!scene.open){
            console.debug('Scene could not be closed because it was already closed');
            return;
        }

        scene.close();
    }

    /**
     * Trigger a resize on all scenes that are alive
     */
    public static resize(): void {
        PixiManager.scenes
            .filter(scene => scene.alive)
            .forEach(scene => scene.internalResize());
    }

    /**
     * Start loading a scene in the background
     */
    public static backgroundLoadScene(sceneKey: string): void {
        const scene = PixiManager.getSceneByKey(sceneKey);

        scene.loadInBackground();
    }

    /**
     * Start Pixi. Optionally provide a canvas element, and an element the app should resize to (html body by default).
     */
    private static async startPixi(config: IPixiStartConfig): Promise<unknown>
    {
        return new Promise(async (resolve): Promise<void> => {
            const app = new Application();

            await app.init({
                resolution: window.devicePixelRatio || 1,
                resizeTo: config.elementToResizeTo ?? document.querySelector('body')!,
                autoDensity: true,
                canvas: config.canvas,
                backgroundColor: 0xffffff
            });

            PixiManager.app = app;

            resolve(PixiManager.app);
        });
    }
}