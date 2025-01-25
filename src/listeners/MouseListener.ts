import { Vector } from "../math/vector/Vector";

export interface IMouseListenerClickEvent {
    position: Vector;
    downSince: number;
}

export class MouseListener {
    public static position: Vector = Vector.empty();
    public static down: boolean = false;
    public static downSince: number|null = null;
    private static clickHandlers: Array<CallableFunction> = [];

    public static initialize(element: HTMLElement) {
        element.addEventListener('mousemove', (event: MouseEvent) => {
            MouseListener.position = new Vector(event.clientX, event.clientY);
        });
        element.addEventListener('mousedown', () => {
            if(!MouseListener.down) {
                MouseListener.downSince = Date.now();
            }
            MouseListener.down = true;
        });
        element.addEventListener('mouseup', () => {
            MouseListener.down = false;
        });
        element.addEventListener('click', () => {
            MouseListener.down = false;
            for (const callback of MouseListener.clickHandlers) {
                callback(<IMouseListenerClickEvent>{
                    position: MouseListener.position.copy(),
                    downSince: MouseListener.downSince,
                });
            }
            MouseListener.downSince = null;
        });
    }

    public static registerClickHandler(callback: CallableFunction) {
        this.clickHandlers.push(callback);
    }

    public static clearClickHandlers() {
        MouseListener.clickHandlers = [];
    }
}