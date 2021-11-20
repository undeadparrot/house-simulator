import * as THREE from "three";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

import tileset from "./assets/tileset.png";

export class AssetLoader {
    
  private _textureLoader: THREE.TextureLoader;
  private _gltfLoader: GLTFLoader;
  
  private _onLoaded: () => void;

  // public testCube!: GLTF;
  public tileset!: THREE.DataTexture;
  
  constructor( onLoaded: ()=>void ){
      
    this._textureLoader = new THREE.TextureLoader();
    this._gltfLoader = new GLTFLoader();
    this._onLoaded = onLoaded;
    
    THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
        console.log(loaded, total, url);
        if(loaded == total){
          this._onLoaded();
        }
    }

    this.tileset = this._textureLoader.load(tileset);
    // this._gltfLoader.load(testcube, gltf => {this.testCube = gltf;})

  }
  


}
