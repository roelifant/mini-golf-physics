import { Body, Response, System } from "detect-collisions";
import { ICollider } from "../contracts/Colliders";

export class CollisionService {
    static #instance: CollisionService;

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() {
        this.system = new System();
    }

    /**
     * The static getter that controls access to the singleton instance.
     *
     * This implementation allows you to extend the Singleton class while
     * keeping just one instance of each subclass around.
     */
    public static get instance(): CollisionService {
        if (!CollisionService.#instance) {
            CollisionService.#instance = new CollisionService();
        }

        return CollisionService.#instance;
    }

    private system: System;

    public registerBody(body: Body) {
        this.system.insert(body);
    }

    public removeBody(body: Body) {
        this.system.remove(body);
    }

    public update() {
        this.system.checkAll((response: Response) => {
            const { a: bodyA, b: bodyB, aInB, bInA, overlap, overlapN, overlapV } = response;

            const colliderA = bodyA?.userData?.collider;
            const colliderB = bodyB?.userData?.collider;

            if(!!colliderA && !!colliderB) {
                (<ICollider>colliderA).handleCollision(<ICollider>colliderB, {
                    insideOther: aInB,
                    insideThis: bInA,
                    overlap: overlap,
                    overlapN: overlapN,
                    overlapV: overlapV
                });
            }
        });
    }
    
}