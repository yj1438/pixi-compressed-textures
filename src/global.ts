import { CompressedImage } from "./CompressedImage";

declare module 'pixi.js' {

  interface GLTexture {
    compressed?: boolean;
  }

  interface TextureSystem {
    initCompressed?(): void;

    registerCompressedLoader?(loader: any): void;

    compressedExtensions?: any;
  }

  interface LoaderResource {
    _defaultUrlChoice?: string;
    _defaultUrl?: string;
    _baseUrl?: string;
    compressedImage?: CompressedImage;
    isCompressedImage?: boolean;
  }

  interface IResourceMetadata {
    useCompressedTexture?: boolean,
    choice?: Array<string>,
  }
}

declare global {
  
  const BASIS: any;

  class BasisFile {
    constructor(buffer : Uint8Array);
    getNumImages(): number;
    getNumLevels(): number;
    getImageWidth(imageId: number, level:number): number;
    getImageHeight(imageId: number, level:number): number;
    getHasAlpha(): boolean;
    startTranscoding(): boolean;
    getImageTranscodedSizeInBytes(imageId : number, level: number, basisFormat: number): number;
    transcodeImage(dstBuff: Uint8Array, imageId: number, level: number, basisFormat: number, pvrtcWrapAddressing: boolean, getAlphaForOpaqueFormats: boolean): number
  }

  interface Window {
    CRN_Module: {
      HEAPU8: Uint8Array;

      _free(src: number): void

      _crn_get_width(src: number, size: number): number;

      _crn_get_height(src: number, size: number): number;

      _crn_get_levels(src: number, size: number): number;

      _crn_get_dxt_format(src: number, size: number): number;

      _crn_get_uncompressed_size(src: number, size: number, stuff: number): number;

      _malloc(size: number): number;

      _crn_decompress(src: number, srcSize: number, dst: number, dstSize: number, stuff: number): void;
    }
  }
}