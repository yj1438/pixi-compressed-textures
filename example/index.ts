import * as PIXI from 'pixi.js';
import { Spine } from 'pixi-spine';

console.log('hello world!');

// ---
const canvasElement = document.getElementById('game-canvas') as HTMLCanvasElement;
canvasElement.style.width = '100vw';
canvasElement.style.height = '100vh';

const app = new PIXI.Application({
  view: canvasElement,
  width: 750,
  height: 1624,
  autoStart: true,
});

document.body.appendChild(app.view);

//
const rootContainer = new PIXI.Container();
app.stage.addChild(rootContainer);

// spine
const spineAssets = {
  json: 'spine/spineboy-pro.json',
}

/**
 * 1. 普通 spine 加载
 *  - json 和 atlas 必须文件在同一目录下，默认会在同目录同名去请求 atlas 文件
 */
const loader = new PIXI.Loader();
loader.add({
  url: spineAssets.json,
});
loader.load(function(_loader, resources) {
  const spineData = resources[spineAssets.json].spineData;
  const spine = new Spine(spineData as any);
  spine.position.set(375, 700);
  spine.state.setAnimation(0, 'run', true);
  rootContainer.addChild(spine);
});

