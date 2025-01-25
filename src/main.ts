import { testLevel } from './levels/TestLevel';
import { MouseListener } from './listeners/MouseListener';
import { PixiManager } from './pixi/PixiManager';
import { MiniGolfScene } from './scenes/MinigolfScene';
import { GameService } from './services/GameService';
import './style.css'

async function startUp() {
  const body = <HTMLBodyElement>document.querySelector('body');
  const canvas = <HTMLCanvasElement>document.querySelector('#game-canvas');

  await PixiManager.init({
    canvas,
    elementToResizeTo: body
  });

  GameService.instance.setupPlayers(4);

  PixiManager.registerScenes([
      new MiniGolfScene(testLevel),
  ]);

  MouseListener.initialize(canvas);

  await PixiManager.openScene('minigolf');
  window.addEventListener('resize', PixiManager.resize);
}

startUp();