import {Texture} from "pixi.js";

export type CurrentSceneBehavior = 'close'|'stop'|'end'|'clear';

export interface ISceneAssets {
    [key: string]: Texture
}

export interface IPixiStartConfig {
    canvas: HTMLCanvasElement,
    elementToResizeTo?: HTMLElement,
}