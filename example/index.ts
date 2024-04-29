import * as PIXI from 'pixi.js';
import { Spine } from 'pixi-spine';
import { init } from '../src/index';

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

init(app.renderer as PIXI.Renderer);

document.body.appendChild(app.view);

//
const rootContainer = new PIXI.Container();
app.stage.addChild(rootContainer);

// sprite
// const ktxUrl: string = 'spine/spineboy-pro.ktx';
// const loader1 = new PIXI.Loader();
// loader1.add({
//   url: ktxUrl,
//   metadata: {
//     alphaMode: 1,
//     useCompressedTexture: true,
//     // choice: ['.ktx'],
//   }
// });
// loader1.load(function(loader, resources) {
//   const sprite = new PIXI.Sprite(resources[ktxUrl].texture);
//   sprite.position.set(375, 812);
//   sprite.anchor.set(0.5);
//   rootContainer.addChild(sprite);
// });

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
  metadata: {
    // 这里的 choice 优先级从后往前，所以 .astc.ktx 会被优先选择
    imageMetadata: { useCompressedTexture: true, choice: [".png", ".ktx", ".astc.ktx"] },
  }
});
loader.load(function(_loader, resources) {
  const spineData = resources[spineAssets.json].spineData;
  const spine = new Spine(spineData as any);
  spine.position.set(375, 700);
  spine.state.setAnimation(0, 'run', true);
  rootContainer.addChild(spine);
});

