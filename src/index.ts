import type { Renderer } from "pixi.js";
import { Loader } from "pixi.js";
import { detectExtensions } from "./CompressedTextureManager";
import { extensionChooser } from "./extensionChooser";
import { ExtensionFixer } from "./extensionFixer";
import { ImageParser, RegisterCompressedExtensions } from "./ImageParser";

export { RegisterCompressedExtensions }; 

export function init(renderer: Renderer) {
  RegisterCompressedExtensions('dds', 'crn', 'pvr', 'etc1', 'astc', 'astc.ktx', 'ktx');
  Loader.registerPlugin(ImageParser);
  Loader.registerPlugin(ExtensionFixer);
  const extensions = detectExtensions(renderer);
  Loader.registerPlugin({ pre: extensionChooser(extensions) });
}
