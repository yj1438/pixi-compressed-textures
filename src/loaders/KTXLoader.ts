import { CompressedImage } from '../CompressedImage';
import { AbstractInternalLoader } from './AbstractInteranlLoader';

const KTX_HEADER_LENGTH = 12 + 13 * 4;

// DXT formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1; // eslint-disable-line no-unused-vars
const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

// ATC formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_atc/
const COMPRESSED_RGB_ATC_WEBGL = 0x8C92;
const COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 0x8C93;
const COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 0x87EE;

//ASTC formats
//https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;
const COMPRESSED_RGBA_ASTC_5x4_KHR = 0x93B1;
const COMPRESSED_RGBA_ASTC_5x5_KHR = 0x93B2;
const COMPRESSED_RGBA_ASTC_6x5_KHR = 0x93B3;
const COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4;
const COMPRESSED_RGBA_ASTC_8x5_KHR = 0x93B5;
const COMPRESSED_RGBA_ASTC_8x6_KHR = 0x93B6;
const COMPRESSED_RGBA_ASTC_8x8_KHR = 0x93B7;
const COMPRESSED_RGBA_ASTC_10x5_KHR = 0x93B8;
const COMPRESSED_RGBA_ASTC_10x6_KHR = 0x93B9;
const COMPRESSED_RGBA_ASTC_10x8_KHR = 0x93BA;
const COMPRESSED_RGBA_ASTC_10x10_KHR = 0x93BB;
const COMPRESSED_RGBA_ASTC_12x10_KHR = 0x93BC;
const COMPRESSED_RGBA_ASTC_12x12_KHR = 0x93BD;

/*
No support for SRGB formats
- no way how to determine RGB vs SRGB from ASTC file
*/
const COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 0x93D0;
const COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 0x93D1;
const COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 0x93D2;
const COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 0x93D3;
const COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 0x93D4;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 0x93D5;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 0x93D6;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 0x93D7;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 0x93D8;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 0x93D9;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 0x93DA;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 0x93DB;
const COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 0x93DC;
const COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 0x93DD;

// PVR formats, from: http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_pvrtc/
const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
const COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01;
const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
const COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03;
// ETC1 format, from:  http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_etc1/
const COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;

export class KTXLoader extends AbstractInternalLoader {
  public static type = "KTX";

  constructor(_image: CompressedImage) {
    super(_image);
  }

  load(arrayBuffer: ArrayBuffer) {
    const dataSize = Uint32Array.BYTES_PER_ELEMENT;
    const headerDataView = new DataView(arrayBuffer, 12, 13 * dataSize);
    const endianness = headerDataView.getUint32(0, true);
    const littleEndian = endianness === 0x04030201;
    const internalFormat = headerDataView.getUint32(4 * dataSize, littleEndian);
    this._format = internalFormat;
    const width = headerDataView.getUint32(6 * dataSize, littleEndian);
    const height = headerDataView.getUint32(7 * dataSize, littleEndian);
    const levels = headerDataView.getUint32(11 * dataSize, littleEndian);
    const dataOffset = KTX_HEADER_LENGTH + headerDataView.getUint32(12 * dataSize, littleEndian);
    const imageSize = new Int32Array(arrayBuffer, dataOffset, 1)[0];
    const dxtData = new Uint8Array(arrayBuffer, dataOffset + 4, imageSize);
    const dest = this._image;

    return dest.init(dest.src, dxtData, 'KTX', width, height, levels, internalFormat);
  }

  static test(arrayBuffer: ArrayBuffer) {
    const identifier = new Uint8Array(arrayBuffer, 0, 12);

    return !(
      identifier[0] !== 0xab ||
      identifier[1] !== 0x4b ||
      identifier[2] !== 0x54 ||
      identifier[3] !== 0x58 ||
      identifier[4] !== 0x20 ||
      identifier[5] !== 0x31 ||
      identifier[6] !== 0x31 ||
      identifier[7] !== 0xbb ||
      identifier[8] !== 0x0d ||
      identifier[9] !== 0x0a ||
      identifier[10] !== 0x1a ||
      identifier[11] !== 0x0a
    );
  }

  levelBufferSize(width: number, height: number, mipLevel?: number) {
    switch (this._format) {
      case COMPRESSED_RGB_S3TC_DXT1_EXT:
      case COMPRESSED_RGB_ATC_WEBGL:
      case COMPRESSED_RGB_ETC1_WEBGL:
        return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;

      case COMPRESSED_RGBA_S3TC_DXT3_EXT:
      case COMPRESSED_RGBA_S3TC_DXT5_EXT:
      case COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL:
      case COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL:
        return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;

      case COMPRESSED_RGB_PVRTC_4BPPV1_IMG:
      case COMPRESSED_RGBA_PVRTC_4BPPV1_IMG:
        return Math.floor((Math.max(width, 8) * Math.max(height, 8) * 4 + 7) / 8);

      case COMPRESSED_RGB_PVRTC_2BPPV1_IMG:
      case COMPRESSED_RGBA_PVRTC_2BPPV1_IMG:
        return Math.floor((Math.max(width, 16) * Math.max(height, 8) * 2 + 7) / 8);

      //ASTC formats, https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
      case COMPRESSED_RGBA_ASTC_4x4_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
      case COMPRESSED_RGBA_ASTC_5x4_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:
        return Math.floor((width + 4) / 5) * Math.floor((height + 3) / 4) * 16;
      case COMPRESSED_RGBA_ASTC_5x5_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:
        return Math.floor((width + 4) / 5) * Math.floor((height + 4) / 5) * 16;
      case COMPRESSED_RGBA_ASTC_6x5_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:
        return Math.floor((width + 5) / 6) * Math.floor((height + 4) / 5) * 16;
      case COMPRESSED_RGBA_ASTC_6x6_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:
        return Math.floor((width + 5) / 6) * Math.floor((height + 5) / 6) * 16;
      case COMPRESSED_RGBA_ASTC_8x5_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:
        return Math.floor((width + 7) / 8) * Math.floor((height + 4) / 5) * 16;
      case COMPRESSED_RGBA_ASTC_8x6_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:
        return Math.floor((width + 7) / 8) * Math.floor((height + 5) / 6) * 16;
      case COMPRESSED_RGBA_ASTC_8x8_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:
        return Math.floor((width + 7) / 8) * Math.floor((height + 7) / 8) * 16;
      case COMPRESSED_RGBA_ASTC_10x5_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:
        return Math.floor((width + 9) / 10) * Math.floor((height + 4) / 5) * 16;
      case COMPRESSED_RGBA_ASTC_10x6_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:
        return Math.floor((width + 9) / 10) * Math.floor((height + 5) / 6) * 16;
      case COMPRESSED_RGBA_ASTC_10x8_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:
        return Math.floor((width + 9) / 10) * Math.floor((height + 7) / 8) * 16;
      case COMPRESSED_RGBA_ASTC_10x10_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:
        return Math.floor((width + 9) / 10) * Math.floor((height + 9) / 10) * 16;
      case COMPRESSED_RGBA_ASTC_12x10_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:
        return Math.floor((width + 11) / 12) * Math.floor((height + 9) / 10) * 16;
      case COMPRESSED_RGBA_ASTC_12x12_KHR:
      case COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:
        return Math.floor((width + 11) / 12) * Math.floor((height + 11) / 12) * 16;

      default:
        return 0;
    }
  };

  free() {
    //@ts-ignore
    this._image = null;
  }
}
