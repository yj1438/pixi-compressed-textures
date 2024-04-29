import * as PIXI from 'pixi.js';
import { CompressedImage } from './CompressedImage';

export const TEXTURE_EXTENSIONS: string[] = [];

export function RegisterCompressedExtensions(...exts: string[]) {
    for (let e in exts) {
        if (TEXTURE_EXTENSIONS.indexOf(exts[e]) < 0) {
            TEXTURE_EXTENSIONS.push(exts[e]);
            PIXI.LoaderResource.setExtensionXhrType(exts[e], PIXI.LoaderResource.XHR_RESPONSE_TYPE.BUFFER);
        }
    }
}

export class ImageParser {
    static use(this: PIXI.Loader, resource: PIXI.LoaderResource, next: () => any) {

        const url = resource.url;
        const idx = url.lastIndexOf('.');
        const amper = url.lastIndexOf('?');
        const ext = url.substring(idx + 1, amper > 0 ? amper : url.length);

        if (TEXTURE_EXTENSIONS.indexOf(ext) < 0) {
            next();
            return;
        }

        if (!resource.data) {
            throw new Error("compressedImageParser middleware for PixiJS v5 must be specified in loader.use()" +
                " and must have resource.data when completed");
        }
        if (resource.compressedImage) {
            // ImageParser was added twice! ignore it.
            next();
            return;
        }
        resource.compressedImage = new CompressedImage(resource.url);
        resource.compressedImage.loadFromArrayBuffer(resource.data, ext === 'crn');
        resource.isCompressedImage = true;
        resource.texture = fromResource(resource.compressedImage, resource.url, resource.name);
        next();
    }
}

function fromResource(resource: PIXI.Resource, imageUrl: string, name: string) {
    const baseTexture = new PIXI.BaseTexture(resource, {
        scaleMode: PIXI.settings.SCALE_MODE,
        resolution: PIXI.utils.getResolutionOfUrl(imageUrl),
    });

    const texture = new PIXI.Texture(baseTexture);

    // No name, use imageUrl instead
    if (!name) {
        name = imageUrl;
    }

    // lets also add the frame to pixi's global cache for 'fromLoader' function
    PIXI.BaseTexture.addToCache(texture.baseTexture, name);
    PIXI.Texture.addToCache(texture, name);

    // also add references by url if they are different.
    if (name !== imageUrl) {
        PIXI.BaseTexture.addToCache(texture.baseTexture, imageUrl);
        PIXI.Texture.addToCache(texture, imageUrl);
    }

    return texture;
}

