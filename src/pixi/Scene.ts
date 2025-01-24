import {PixiManager} from "./PixiManager.ts";
import {Viewport} from "pixi-viewport";
import {NoStageSceneError} from "./Errors.ts";
import {Transition} from "./Transition.ts";
import {ISceneAssets} from "./Types.ts";
import { Container } from "pixi.js";
import { Vector } from "../math/vector/Vector.ts";

export class Scene {

    /**
     * Overwrite the key property when extending this class
     */
    public key: string = 'default';

    /**
     * Overwrite with a scene transition object to show a transition when the scene is opened
     *
     * @returns {string}
     */
    public transition: Transition|undefined; // = new LoadTransition();

    /**
     * Is the scene still transitioning?
     */
    public transitioning: boolean = false;

    /**
     * Is the Scene active? = The scene is updating every frame and incrementing its sceneTime
     */
    public active: boolean = false;

    /**
     * The time since this scene first became active
     */
    public sceneTime: number = 0;

    /**
     * The time since the last animation frame
     */
    public deltaTime: number = 0;

    /**
     * The speed of the sceneTime
     */
    public speed: number = 1;

    /**
     * Is the scene alive? = The scene has been set up
     */
    public alive: boolean = false;

    /**
     * Is the scene loaded? = All needed assets for the scene are cached
     */
    public loaded: boolean = false;

    /**
     * Is the scene open? = The scene is visible to the user
     */
    public open: boolean = false;

    /**
     * get the pan of the stage
     */
    public get pan(): Vector {
        return new Vector(this.stage.center.x, this.stage.center.y);
    }

    /**
     * Make true if you want the 0,0 coordinate to be at the center of the screen
     */
    protected centered: boolean = false;

    /**
     * Fill this object with files to load them when the scene opens
     */
    protected load = {
        // key: 'path/to/file'
    };

    /**
     * The assets that were loaded for this scene
     */
    protected assets: ISceneAssets = {};

    /**
     * The stage for the scene. Use this to as the container to add pixi visuals to
     */
    protected get stage(): Viewport {
        if(!this.privateStage) {
            throw new NoStageSceneError();
        }
        return this.privateStage;
    }

    /**
     * Has the load bundle for this scene been added
     */
    private addedLoadBundle: boolean = false;

    /**
     * The actual stage object. Might be undefined at some phases
     */
    private privateStage: Viewport|undefined;

    /**
     * The key used for the assets bundle of this scene
     */
    private get bundleKey(): string {
        return 'scene.'+this.key;
    }

    /**
     * Start loading the assets for this scene in the background
     */
    public loadInBackground(): void {
        if(this.load){
            this.setLoadBundle();

            PixiManager.assets.backgroundLoadBundle(this.bundleKey);
        }
    }

    /**
     * Start the scene
     */
    public async start(): Promise<void> {

        if(!this.loaded) {
            if(this.transition){
                this.triggerTransition();
            }
            await this.loadAssets();
        } else {
            if(this.transition && !this.transition.loader){
                this.triggerTransition();
            }
        }

        if(this.alive){
            this.onResume();
        }

        if(!this.alive){
            if(!this.privateStage){
                this.setStage();
            }
            this.setup();
            if(!!this.transition && this.transitioning && this.transition.loader) {
                this.transition.end();
            }
            this.alive = true;
        }

        if(!this.privateStage) {
            throw new NoStageSceneError();
        }

        if(this.active){
            this.onReopen();
        }

        this.active = true;
        this.open = true;

        this.privateStage.visible = true;
    }

    /**
     * Overwrite this method to update your scene when it is active
     *
     * delta time = how many milliseconds since the last frame
     */
    public update(_deltaTime: number): void {
        // update your scene here
    }

    /**
     * Used to move the stage for screen resizes.
     *
     * Do not overwrite this method unless you know what you're doing
     */
    public internalResize(): void {
        if(!this.privateStage) {
            throw new NoStageSceneError();
        }

        let x;
        let y;

        if(this.centered){
            x = this.privateStage.center.x;
            y = this.privateStage.center.y;
        }

        this.privateStage.resize();

        if (
            this.centered &&
            x !== undefined &&
            y !== undefined
        ) {
            this.privateStage!.moveCenter(x,y);
        }

        this.resize();
    }

    /**
     * Close this scene, making it invisible to the user but keeping it active
     */
    public close(): void {
        if(!this.privateStage) {
            throw new NoStageSceneError();
        }

        this.onClose();
        this.privateStage.visible = false;
        this.open = false;
    }

    /**
     * Stop this scene, making it inactive (it will stop updating)
     */
    public stop(): void {
        this.close();
        this.onStop();
        this.active = false;
    }

    /**
     * End this scene, removing the stage
     */
    public end(clearCache: boolean = false): void {
        if(!this.privateStage) {
            throw new NoStageSceneError();
        }

        this.stop();
        this.onEnd();
        this.alive = false;
        this.sceneTime = 0;
        this.privateStage.destroy();
        this.privateStage = undefined;
        if(clearCache) {
            this.loaded = false;
            PixiManager.assets.unloadBundle(this.bundleKey);
        }
    }

    public add(object: Container) {
        this.stage.addChild(object);
    }

    /**
     * Overwrite this method to set up your scene after all assets were loaded
     */
    protected setup(): void {
        // set your scene here
    }

    /**
     * Overwrite this method to do things whenever a stopped scene is resumed
     */
    protected onResume(): void {
        // your code here
    }

    /**
     * Overwrite this method to do things whenever a closed scene is opened again
     */
    protected onReopen(): void {
        // your code here
    }

    /**
     * Overwrite this method to do things when the scene is closed
     */
    protected onClose(): void {
        // your code here
    }

    /**
     * Overwrite this method to do things when the scene is stopped
     */
    protected onStop(): void {
        // your code here
    }

    /**
     * Overwrite this method to do things when the scene is ended
     */
    protected onEnd(): void {
        // your code here
    }

    /**
     * Overwrite this to do stuff on a resize
     */
    protected resize(): void {
        // resize your scene
    }

    /**
     * Set the load bundle for this scene in the Pixi Assets class
     */
    private setLoadBundle(): void {
        if(!this.addedLoadBundle){
            PixiManager.assets.addBundle(this.bundleKey, this.load);
            this.addedLoadBundle = true;
        }
    }

    /**
     * load the assets for this scene (defined in the load object)
     */
    private async loadAssets(): Promise<void> {
        if(this.load){
            this.setLoadBundle();

            this.assets = await PixiManager.assets.loadBundle(this.bundleKey, progress => {
                if(!!this.transition) {
                    this.transition.progress = progress;
                    this.transition.onLoadProgress(progress);
                }
            });
        }
        this.loaded = true;
        if(!!this.transition && this.transitioning) {
            this.transition.onLoadFinish();
        }
    }

    /**
     * Set up the stage container for this Scene
     */
    private setStage(): void {
        this.privateStage = new Viewport({
            screenWidth: PixiManager.width,
            screenHeight: PixiManager.height,
            worldWidth: PixiManager.width,
            worldHeight: PixiManager.height,
            events: PixiManager.app.renderer.events,
        });

        PixiManager.sceneContainer.addChild(this.privateStage);

        if(this.centered){
            this.privateStage.moveCenter(0,0);
        }
    }

    /**
     * Trigger the transition linked in this Scene
     */
    private triggerTransition(): void {
        if(!!this.transition) {
            this.transition.internalSetup(this);
            this.transition.setup(this);
            this.transitioning = true;
        }
    }
}