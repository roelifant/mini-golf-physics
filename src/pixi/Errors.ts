/**
 * This error occurs whenever a stage object is accessed by a scene before it is set up
 */
export class NoStageSceneError extends Error {
    constructor(message: string = 'There is no stage to be manipulated by the scene at this phase') {
        super(message);
        Object.setPrototypeOf(this, NoStageSceneError.prototype);
    }
}

/**
 * This error occurs when the pixi manager tries to open a scene that was not registered
 */
export class OpenUnregisteredScenePixiManagerError extends Error {
    constructor(message: string = 'Manager tried to open a scene that was not registered') {
        super(message);
        Object.setPrototypeOf(this, OpenUnregisteredScenePixiManagerError.prototype);
    }
}

/**
 * This error occurs when the pixi manager does an action it cannot do before initialising
 */
export class UninitialisedPixiManagerError extends Error {
    constructor(message: string = 'PixiManager needs to be initialised first') {
        super(message);
        Object.setPrototypeOf(this, UninitialisedPixiManagerError.prototype);
    }
}

/**
 * This error occurs when a transition tries to manipulate a scene, when there was no scene linked to it
 */
export class NoSceneTransitionError extends Error {
    constructor(message: string = 'There is no scene to be manipulated by the transition at this phase') {
        super(message);
        Object.setPrototypeOf(this, NoSceneTransitionError.prototype);
    }
}

/**
 * This error occurs whenever a stage object is accessed by a transition before it is set up
 */
export class NoStageTransitionError extends Error {
    constructor(message: string = 'There is no stage to be manipulated by the transition at this phase') {
        super(message);
        Object.setPrototypeOf(this, NoStageTransitionError.prototype);
    }
}