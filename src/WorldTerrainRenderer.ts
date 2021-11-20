import * as THREE from "three";
import { AssetLoader } from "./AssetLoader";
import { GREEN } from "./constants";
import { WorldGrid } from "./WorldGrid";

const FLOATS_PER_VERT_POSITION = 3;
const FLOATS_PER_VERT_UV = 2;
const VERTS_PER_TRIANGLE = 3;

export class WorldTerrainRenderer {
  public object3d: THREE.Object3D;
  private _group: THREE.Group;
  private _texture: THREE.DataTexture;
  private _mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  private _positionBuffer!: Float32Array;
  private _uvBuffer!: Float32Array;
  private _positionAttribute!: THREE.BufferAttribute;
  private _uvAttribute!: THREE.BufferAttribute;
  constructor(assetLoader: AssetLoader) {
    this._group = new THREE.Group();

    this._texture = assetLoader.tileset;

    /* for crisp pixellated textures */
    this._texture.magFilter = THREE.NearestFilter;
    this._texture.minFilter = THREE.NearestFilter;

    const geom = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({color:GREEN});//MeshStandardMaterial( { map: this._texture });
    this._mesh = new THREE.Mesh(geom, material);
    this._group.add(this._mesh);

    this.object3d = this._group;

    this.resizeBuffers(1);
  }
  private resizeBuffers(tris: number) {
    const new_positionBuffer = new Float32Array(
      tris * VERTS_PER_TRIANGLE * FLOATS_PER_VERT_POSITION
    );
    for (let i in this._positionBuffer) {
      new_positionBuffer[i] = this._positionBuffer[i];
    }
    this._positionBuffer = new_positionBuffer;

    const new_uvBuffer = new Float32Array(
      tris * VERTS_PER_TRIANGLE * FLOATS_PER_VERT_UV
    );
    for (let i in this._uvBuffer) {
      new_uvBuffer[i] = this._uvBuffer[i];
    }
    this._uvBuffer = new_uvBuffer;

    const new_indexBuffer = new Array(
      tris*VERTS_PER_TRIANGLE
    );
    const current_indexBuffer = this._mesh.geometry.getIndex()?.array || [];
    for (let i in current_indexBuffer) {
      new_indexBuffer[i] = current_indexBuffer[i];
    }

    this._mesh.geometry.setIndex(new_indexBuffer);
    
    this._positionAttribute = new THREE.BufferAttribute(
      this._positionBuffer,
      FLOATS_PER_VERT_POSITION
    );
    this._mesh.geometry.setAttribute("position", this._positionAttribute);
    this._uvAttribute = new THREE.BufferAttribute(
      this._uvBuffer,
      FLOATS_PER_VERT_UV
    );
    // this._mesh.geometry.setAttribute("uv", this._uvAttribute);

    this._mesh.geometry.setDrawRange(0, tris * VERTS_PER_TRIANGLE);
  }
  public update = (world: WorldGrid) => {
    const trianglesCount = world.w * world.h * 2;
    const currentSize =
      this._positionAttribute.array.length /
      FLOATS_PER_VERT_POSITION /
      VERTS_PER_TRIANGLE;
    if (trianglesCount > currentSize) {
        console.log("resizing to ", trianglesCount);
      this.resizeBuffers(trianglesCount);
    }
    
    let tris = 0;
    let i = 0;
    let j = 0;
    let k = 0;
    const positions = this._positionBuffer;
    const uvs = this._uvBuffer;
    const indexes = this._mesh.geometry.getIndex().array;
    for (let y = 0; y < world.h; y++) {
        for (let x = 0; x < world.w; x++) {
            const height = world.get(x,y)!;
            positions[i++] = x;
            positions[i++] = x*0.1;
            positions[i++] = y;
            uvs[j++] = x;
            uvs[j++] = y;
      }
    }
    for (let y = 0; y < world.h-1; y++) {
        for (let x = 0; x < world.w-1; x++) {
            const yw = world.w * y;
            indexes[k++] = yw + x;
            indexes[k++] = yw + x + world.w;
            indexes[k++] = yw + x + 1;
        
            indexes[k++] = yw + x + 1;
            indexes[k++] = yw + x + world.w;
            indexes[k++] = yw + x + world.w + 1;
          
        }
      }
  };
}

//#region corners
const xz = new THREE.Vector3(0,0,0);
const Xz = new THREE.Vector3(1,0,0);
const xZ = new THREE.Vector3(0,0,1);
const XZ = new THREE.Vector3(1,0,1);
//#endregion corners
