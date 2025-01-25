import { ILevelBreakableWallObject, ILevelDefinition, ILevelObject, ILevelShapeObject, LevelSize } from "../contracts/Levels";

export class Level {
    public definition: ILevelDefinition;

    constructor(name: string, size: LevelSize, contents: Array<ILevelObject|ILevelShapeObject|ILevelBreakableWallObject>) {
        this.definition = {
            name,
            size,
            contents
        };
    }

    private mirror() {
        // TODO: mirror the map definition
    }

    private rotate() {
        // TODO: rotate the map definition in a random direction
    }
}