import {Container, ContainerChild} from "pixi.js";
import {PixiManager} from "./PixiManager.ts";
import {Scene} from "./Scene.ts";
import {NoSceneTransitionError, NoStageTransitionError} from "./Errors.ts";

export class Transition {

    /**
     * Overwrite to turn this transition into a pure loading transition. This means that:
     * - the transition does not run if the scene is already loaded
     * - the transition finishes automatically when the scene is loaded.
     */
    public loader: boolean = false;

    /**
     * The current asset loading progress (number between 0 and 1)
     */
    public progress: number = 0;

    /**
     * Time this transition has been running
     */
    public transitionTime: number = 0;

    /**
     * Time difference since the last frame
     */
    public deltaTime: number = 0;

    /**
     * The scene that is being transitioned into
     */
    protected scene: Scene|undefined;

    /**
     * Overwrite this to center the transition stage
     */
    protected centered: boolean = false;

    protected get stage(): Container<ContainerChild> {
        if(!this.privateStage) {
            throw new NoStageTransitionError();
        }
        return this.privateStage;
    }

    /**
     * The internal stage object (a Pixi Container)
     */
    private privateStage: Container<ContainerChild>|undefined;

    /**
     * Overwrite to fill the stage before loading
     *
     * @param _scene
     */
    public setup(_scene: Scene): void {
        // setup loading scene here
    }

    /**
     * Overwrite to update things on render frame
     */
    public update(_deltaTime: number): void {
        // update the loading scene here
    }

    /**
     * Overwrite to do stuff any time load progress is made
     *
     * progress is a number between 0 and 1
     */
    public onLoadProgress(_progress: number): void {
        // update the loading scene here
    }

    /**
     * Overwrite to do stuff when the loading is finished
     */
    public onLoadFinish(): void {
        // update the loading scene or end the transition manually
    }

    /**
     * Method for the scene class to set up the transition
     *
     * Do not overwrite unless you know what you're doing
     */
    public internalSetup(scene: Scene): void {
        this.scene = scene;
        this.transitionTime = 0;

        this.privateStage = new Container();
        PixiManager.stage.addChild(this.privateStage);

        if(this.centered){
            this.privateStage.x = PixiManager.width / 2;
            this.privateStage.y = PixiManager.height / 2;
        }
    }

    /**
     * Ends the transition
     */
    public end(): void {
        if(!this.privateStage) {
            throw new NoStageTransitionError();
        }

        this.privateStage.destroy();
        this.privateStage = undefined;
        if(!this.scene) {
            throw new NoSceneTransitionError();
        }
        this.scene.transitioning = false;
    }

}