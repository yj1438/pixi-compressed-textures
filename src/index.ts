import type { Renderer } from "pixi.js";
import * as PIXI from "pixi.js";
import { detectExtensions } from "./CompressedTextureManager";
import { extensionChooser } from "./extensionChooser";
import { ExtensionFixer } from "./extensionFixer";
import { ImageParser, RegisterCompressedExtensions } from "./ImageParser";

export { RegisterCompressedExtensions }; 

export function init(renderer: Renderer) {
  RegisterCompressedExtensions('dds', 'crn', 'pvr', 'etc1', 'astc', 'astc.ktx', 'ktx');
  PIXI.Loader.registerPlugin(ImageParser);
  PIXI.Loader.registerPlugin(ExtensionFixer);
  const extensions = detectExtensions(renderer);
  PIXI.Loader.registerPlugin({ pre: extensionChooser(extensions) });
}
