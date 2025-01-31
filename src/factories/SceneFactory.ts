import { Level } from "../game/Level";
import { testLevel } from "../levels/TestLevel";
import { MiniGolfScene } from "../scenes/MinigolfScene";

export class SceneFactory {
    public static levels =[
        testLevel,
    ]

    public static generateScenes(count: number, randomized: boolean = true): Array<MiniGolfScene> {
        let levels: Array<Level> = [];
        const scenes: Array<MiniGolfScene> = [];

        for (let i = 0; i < count; i++) {
            if(levels.length === 0) {
                levels = SceneFactory.getFilteredLevelList();
            }
            const randomLevelPick = levels[Math.floor(levels.length*Math.random())];
            const index = levels.indexOf(randomLevelPick);
            levels.splice(index, 1);

            const newLevel = randomLevelPick.copy();

            if(randomized) {
                newLevel.randomize();
            }
            scenes.push(new MiniGolfScene(newLevel, 'scene_'+i));
        }

        return scenes;
    }

    private static getFilteredLevelList(): Array<Level> {
        // TODO filter list based on criteria
        return [...SceneFactory.levels];
    }
}