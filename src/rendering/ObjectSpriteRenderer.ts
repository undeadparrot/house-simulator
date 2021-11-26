import * as THREE from "three";
import { AssetLoader } from "../AssetLoader";

const FLOATS_PER_VERT_POSITION = 3;
const FLOATS_PER_VERT_UV = 2;
const VERTS_PER_TRIANGLE = 3;

// function makeMaterial(): THREE.Material {
//     const material = new THREE.ShaderMaterial({
//         // vertexShader: `
//         // void main()
//         // {
//         //     vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
//         //     gl_Position = projectionMatrix * modelViewPosition;
//         // }
//         // `,
//         fragmentShader: `
//         void main()
//         {
//             gl_FragColor = vec4(0.1,0.2,0.3, 1.0);
//             gl_FragDepth = 0.01;
//         }
//         `,
//         // extensions: {
//         //     fragDepth: true
//         // }
//     });
//     return material;
// }

export class ObjectSpriteRenderer {
  public object3d: THREE.Object3D;
  _group: THREE.Group;
  _texture: THREE.DataTexture;
  _textureDepth: THREE.DataTexture;
  _mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
  _positionBuffer: Float32Array;
  _uvBuffer: Float32Array;
  _positionAttribute: THREE.BufferAttribute;
  _uvAttribute: THREE.BufferAttribute;
  constructor(assetLoader: AssetLoader) {
    this._group = new THREE.Group();
    this._texture = assetLoader.cube_colour;
    this._textureDepth = assetLoader.cube_depth;

    /* for crisp pixellated textures */
    // this._texture.magFilter = THREE.NearestFilter;
    // this._texture.minFilter = THREE.NearestFilter;

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({
      name: "FunnyDepthMaterial",
      map: this._texture,
    });
    // const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
    material.onBeforeCompile = (shader) => {
      console.log({ shader });
      shader.uniforms["map_depth"] = { value: this._textureDepth };
      shader.fragmentShader = shader.fragmentShader
        .replace(
          `#include <common>`,
          `#include <common>
              uniform sampler2D map_depth;`
        )
        .replace(
          `#include <fog_fragment>`,
          `#include <fog_fragment>
                vec4 texelMapDepth = texture2D( map_depth, vUv );
                texelMapDepth = mapTexelToLinear( texelMapDepth );
                gl_FragDepth = 0.1 * texelMapDepth.g;
            `
        );
    };
    this._mesh = new THREE.Mesh(geometry, material);
    this._group.add(this._mesh);
    this.object3d = this._group;
    this.resizeBuffersForQuads(1);
  }

  private resizeBuffersForQuads(quads: number) {
    const tris = quads * 2;
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
  public update = () => {
    const positions = this._positionBuffer;
    const uvs = this._uvBuffer;

    const texture = {
      tl: new THREE.Vector2(0, 1),
      tr: new THREE.Vector2(1, 1),
      bl: new THREE.Vector2(0, 0),
      br: new THREE.Vector2(1, 0),
    };

    let tris = 0;
    let i = 0;
    let j = 0;

    const x = 5;
    const y = 5;
    const z = 0.0;
    const spritew = 1;
    const spriteh = 1;

    positions[i++] = x;
    positions[i++] = z;
    positions[i++] = y;
    uvs[j++] = texture.bl.x;
    uvs[j++] = texture.bl.y;

    positions[i++] = x + spritew;
    positions[i++] = z;
    positions[i++] = y - spritew;
    uvs[j++] = texture.br.x;
    uvs[j++] = texture.br.y;

    positions[i++] = x;
    positions[i++] = z + spriteh;
    positions[i++] = y;
    uvs[j++] = texture.tl.x;
    uvs[j++] = texture.tl.y;

    positions[i++] = x;
    positions[i++] = z + spriteh;
    positions[i++] = y;
    uvs[j++] = texture.tl.x;
    uvs[j++] = texture.tl.y;

    positions[i++] = x + spritew;
    positions[i++] = z;
    positions[i++] = y - spritew;
    uvs[j++] = texture.br.x;
    uvs[j++] = texture.br.y;

    positions[i++] = x + spritew;
    positions[i++] = z + spriteh;
    positions[i++] = y - spritew;
    uvs[j++] = texture.tr.x;
    uvs[j++] = texture.tr.y;

    this._positionAttribute.needsUpdate = true;
    this._uvAttribute.needsUpdate = true;
    this._mesh.geometry.computeVertexNormals();
    this._mesh.geometry.computeBoundingBox();
    this._mesh.geometry.computeBoundingSphere();
  };
}
