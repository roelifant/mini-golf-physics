import { Vector } from "../math/vector/Vector";

export interface IMouseListenerClickEvent {
    position: Vector;
    downSince: number;
    downFor: number;
}

export class MouseListener {
    public static position: Vector = Vector.empty();
    public static down: boolean = false;
    public static downSince: number|null = null;
    public static downFor: number = 0;
    private static clickHandlers: Array<CallableFunction> = [];

    public static initialize(element: HTMLElement) {
        element.addEventListener('mousemove', (event: MouseEvent) => {
            MouseListener.position = new Vector(event.clientX, event.clientY);
        });
        element.addEventListener('mousedown', (event: MouseEvent) => {
            if(!MouseListener.down) {
                MouseListener.downSince = Date.now();
            }
            MouseListener.down = true;
            MouseListener.updateDownFor();
        });
        element.addEventListener('mouseup', (event: MouseEvent) => {
            MouseListener.down = false;
            MouseListener.updateDownFor();
        });
        element.addEventListener('click', (event: MouseEvent) => {
            MouseListener.down = false;
            for (const callback of MouseListener.clickHandlers) {
                callback(<IMouseListenerClickEvent>{
                    position: MouseListener.position.copy(),
                    downSince: MouseListener.downSince,
                    downFor: MouseListener.downFor,
                });
            }
            MouseListener.downSince = null;
            MouseListener.downFor = 0;
        });
    }

    public static registerClickHandler(callback: CallableFunction) {
        this.clickHandlers.push(callback);
    }

    public static clearClickHandlers() {
        MouseListener.clickHandlers = [];
    }

    private static updateDownFor() {
        if(MouseListener.downSince !== null) {
            MouseListener.downFor = Date.now() - MouseListener.downSince;
        }
    }
}