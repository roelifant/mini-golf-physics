import { ILevelDefinition, LevelContents, LevelSize } from "../contracts/Levels";
import { MathUtils } from "../math/MathUtils";
import { Vector } from "../math/vector/Vector";

export class Level {
    public definition: ILevelDefinition;

    constructor(name: string, size: LevelSize, contents: LevelContents) {
        this.definition = {
            name,
            size,
            contents
        };
        const randomAngle = Math.random() * 360;
        this.rotate(MathUtils.degreesToRadians(randomAngle));
    }

    private mirror() {
        // TODO: mirror the map definition
    }

    private rotate(radians: number) {
        const origin = new Vector(0, 0);
        const newContents: LevelContents = [];
        const contents = JSON.parse(JSON.stringify(this.definition.contents));
        for (const content of contents) {
            content.position = Vector.fromPoint(content.position).rotateAroundAnchor(radians,origin).toPoint();
            if(!content.angle) {
                content.angle = 0;
            }
            content.angle += radians;
            newContents.push(content);
        }
        this.definition.contents = newContents;
    }
}