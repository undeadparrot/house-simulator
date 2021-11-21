import * as THREE from "three";
import { WorldGrid } from "./WorldGrid";
import { WorldTerrainRenderer } from "./WorldTerrainRenderer";
import { InteractionController } from "./InteractionController";
import {
  CLEAR_COLOR,
  RED,
  GREEN,
  BLUE,
  XPLUS,
  YPLUS,
  ZPLUS,
} from "./constants";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { AssetLoader } from "./AssetLoader";
export class GameState {
  loaded: boolean;
  grid: WorldGrid;
  assets: AssetLoader;
  interactions: InteractionController;
  activeBlock: number;
  /* threejs things */
  clock: THREE.Clock;
  scene: THREE.Scene;
  orthocam: THREE.OrthographicCamera;
  orthozoom: number;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  renderp: RenderPass;
  effectFXAA: ShaderPass;
  hitarrow: THREE.ArrowHelper;
  hitcage: THREE.Box3Helper;
  element: HTMLDivElement;
  terrainRenderer: WorldTerrainRenderer;
  constructor(width: number, height: number) {
    this.loaded = false;
    this.assets = new AssetLoader(this.onLoaded);

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    this.activeBlock = 1;

    this.orthocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.orthocam.position.x = 12;
    this.orthocam.position.y = 5;
    this.orthocam.position.z = 25;
    this.orthocam.rotation.set(-0.25, 0.4, 0.0);
    this.orthozoom = 9;

    /* the renderer */
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(CLEAR_COLOR);
    this.composer = new EffectComposer(this.renderer);
    this.renderp = new RenderPass(this.scene, this.orthocam);
    this.composer.addPass(this.renderp);

    this.effectFXAA = new ShaderPass(FXAAShader);
    this.effectFXAA.renderToScreen = true;
    this.effectFXAA.enabled = false;
    this.composer.addPass(this.effectFXAA);

    /* lighting */
    var ambientLight = new THREE.AmbientLight(0x33_44_55);
    this.scene.add(ambientLight);

    var light = new THREE.PointLight(0xffffff, 3, 50, 5);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    /* some debugging shapes */
    this.hitarrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(),
      0.5,
      RED,
      0.2,
      0.2
    );
    this.scene.add(this.hitarrow);
    this.hitcage = new THREE.Box3Helper(new THREE.Box3(), RED);
    this.scene.add(this.hitcage);

    const axes = new THREE.AxesHelper(1);
    this.scene.add(axes);
    axes.setColors(RED, GREEN, BLUE);
    axes.translateX(0.001);
    axes.translateY(0.001);

    const gridHelper = new THREE.GridHelper(16, 16);
    this.scene.add(gridHelper);

    /* the game stuff */
    this.grid = new WorldGrid(width, height);
    this.interactions = new InteractionController();

  }
  onLoaded = () => {
    this.loaded = true;
    this.terrainRenderer = new WorldTerrainRenderer(this.assets);
    this.scene.add(this.terrainRenderer.object3d);
    
    /* mount on the page */
    this.element = document.querySelector<HTMLDivElement>("#app")!;
    this.interactions.install(this.element);
    this.element.appendChild(this.renderer.domElement);
  }
  resizeWindow = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const orthoratio = window.innerWidth / window.innerHeight;
    this.orthocam.left = -1 * this.orthozoom * orthoratio;
    this.orthocam.right = this.orthozoom * orthoratio;
    this.orthocam.top = this.orthozoom;
    this.orthocam.bottom = -1 * this.orthozoom;
    this.orthocam.updateProjectionMatrix();

    this.composer.setSize(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );
    this.composer.setPixelRatio(window.devicePixelRatio);
    this.effectFXAA.uniforms["resolution"].value.set(
      (1 / window.innerWidth) * window.devicePixelRatio,
      (1 / window.innerHeight) * window.devicePixelRatio
    );
  };
  update = () => {
    if(this.loaded === false){
      return;
    }
    const delta = this.clock.getDelta();
    this.composer.render();
    // this.light.updateMatrix();
    this.terrainRenderer.update(this.grid);

    if (this.interactions.leftDown || this.interactions.leftClicked) {
      const x =
        (this.interactions.leftDownPos.x / this.element.clientWidth) * 2 - 1;
      const y =
        1 - (this.interactions.leftDownPos.y / this.element.clientHeight) * 2;
      const screenSpace = new THREE.Vector3(x, y, 0);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(screenSpace, this.orthocam);

      const hits = this.terrainRenderer.raycast(raycaster);
      const firstHit = hits[hits.length-1];
      // console.log("hits", hits);

      if (firstHit !== undefined) {
        const hitTileX = Math.floor(firstHit.point.x);
        const hitTileZ = Math.floor(firstHit.point.z);
        const hitTileHeight = this.grid.get(hitTileX, hitTileZ) || 0;
        this.grid.brush(new THREE.Vector2(hitTileX, hitTileZ), 3, 0.02);

        const hitTileBlPoint = new THREE.Vector3(hitTileX, hitTileHeight, hitTileZ);
        const hitTileTrPoint = hitTileBlPoint.clone().add(new THREE.Vector3(1, 0.1, 1));

        this.hitarrow.position.copy(firstHit.point);
        this.hitcage.box.setFromPoints([hitTileBlPoint, hitTileTrPoint]);
        if (firstHit.face) {
          const p0 = firstHit.point;
          const debugtext = document.querySelector<HTMLDivElement>(
            "#debugtext"
          )!;
          debugtext.innerHTML = `
        <pre>${p0.x.toFixed(2)} ${p0.y.toFixed(2)} ${p0.z.toFixed(2)}</pre>
        <pre>faceindex: ${firstHit.faceIndex} </pre>
        `;

        }
      }
    }
    if (this.interactions.shiftDown) {
      this.orthozoom = Math.min(
        Math.max(
          this.orthozoom + this.interactions.wheelDelta.y * 0.5 * delta,
          1
        ),
        50
      );
      this.resizeWindow();
    } else {
      this.orthocam.translateX(-this.interactions.wheelDelta.x * delta);
      this.orthocam.translateY(this.interactions.wheelDelta.y * delta);
    }
    this.interactions.update();
  };
}
