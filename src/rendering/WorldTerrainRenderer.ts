import * as THREE from "three";
import { AssetLoader } from "../AssetLoader";
import { WorldGrid } from "../WorldGrid";

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
    const material = new THREE.MeshBasicMaterial({map: this._texture});
    // const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
    // material.onBeforeCompile = shader => console.log({shader});
    //   shader.fragmentShader = shader.fragmentShader.replace(
    //     `#include <fog_fragment>`,
    //     `#include <fog_fragment>
    // gl_FragColor.rgb = gl_FrontFacing ? vec3(0,1,0) : vec3(1, 0, 0);
    // `
    //   );
    // }
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
    
    this._positionAttribute = new THREE.BufferAttribute(
      this._positionBuffer,
      FLOATS_PER_VERT_POSITION
    );
    this._mesh.geometry.setAttribute("position", this._positionAttribute);
    this._uvAttribute = new THREE.BufferAttribute(
      this._uvBuffer,
      FLOATS_PER_VERT_UV
    );
    this._mesh.geometry.setAttribute("uv", this._uvAttribute);

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
    const positions = this._positionBuffer;
    const uvs = this._uvBuffer;
    for (let y = 0; y < world.h-1; y++) {
        for (let x = 0; x < world.w-1; x++) {
            const tlHeight = world.get(x,y)!;
            const trHeight = world.get(x+1,y)!;
            const blHeight = world.get(x,y+1)!;
            const brHeight = world.get(x+1,y+1)!;

            const texture = {tl: new THREE.Vector2(0,1), tr: new THREE.Vector2(1,1),bl: new THREE.Vector2(0,0), br: new THREE.Vector2(1,0)}

            /* Top Left */
            positions[i++] = x;
            positions[i++] = tlHeight;
            positions[i++] = y;
            uvs[j++] = texture.tl.x;
            uvs[j++] = texture.tl.y;
            
            /* Bottom Left */
            positions[i++] = x;
            positions[i++] = blHeight;
            positions[i++] = y+1;
            uvs[j++] = texture.bl.x;
            uvs[j++] = texture.bl.y;
            tris++;

            /* Top Right */
            positions[i++] = x+1;
            positions[i++] = trHeight;
            positions[i++] = y;
            uvs[j++] = texture.tr.x;
            uvs[j++] = texture.tr.y;

            
            /* Bottom Right */
            positions[i++] = x+1;
            positions[i++] = brHeight;
            positions[i++] = y+1;
            uvs[j++] = texture.br.x;
            uvs[j++] = texture.br.y;

            /* Top Right */
            positions[i++] = x+1;
            positions[i++] = trHeight;
            positions[i++] = y;
            uvs[j++] = texture.tr.x;
            uvs[j++] = texture.tr.y;
            tris++;

            /* Bottom Left */
            positions[i++] = x;
            positions[i++] = blHeight;
            positions[i++] = y+1;
            uvs[j++] = texture.bl.x;
            uvs[j++] = texture.bl.y;
            }
        }
        this._positionAttribute.needsUpdate = true;
        this._uvAttribute.needsUpdate = true;
        this._mesh.geometry.computeVertexNormals();
        this._mesh.geometry.computeBoundingBox();
        this._mesh.geometry.computeBoundingSphere();
    }
    raycast = (raycaster: THREE.Raycaster) => {
      const intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[] = [];
      this._mesh.raycast(raycaster, intersects);
      return intersects;
    };
}

//#region corners
const xz = new THREE.Vector3(0,0,0);
const Xz = new THREE.Vector3(1,0,0);
const xZ = new THREE.Vector3(0,0,1);
const XZ = new THREE.Vector3(1,0,1);
//#endregion corners
