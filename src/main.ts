import { MouseListener } from './listeners/MouseListener';
import { PixiManager } from './pixi/PixiManager';
import { MiniGolfScene } from './scenes/MinigolfScene';
import './style.css'

async function startUp() {
  const canvas = <HTMLCanvasElement>document.querySelector('#game-canvas');

  await PixiManager.init({canvas});

  PixiManager.registerScenes([
      new MiniGolfScene(),
  ]);

  MouseListener.initialize(canvas);

  await PixiManager.openScene('minigolf');
  window.addEventListener('resize', PixiManager.resize);
}

startUp();