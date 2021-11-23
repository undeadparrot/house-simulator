import * as THREE from "three";
import { WorldGrid } from "./WorldGrid";
import { ObjectSpriteRenderer } from "./ObjectSpriteRenderer"
import { WorldTerrainRenderer } from "./WorldTerrainRenderer"
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
import { degToRad } from "three/src/math/MathUtils";
import { PieMenuManager } from "./pie-menu/PieMenuManager";
import { pie1, pie2, pie3 } from "./pie-menu/pie-menu-definitions";
export class GameState {
  loaded: boolean;
  grid: WorldGrid;
  assets: AssetLoader;
  interactions: InteractionController;
  activeBlock: number;
  /* threejs things */
  clock: THREE.Clock;
  scene: THREE.Scene;
  cameraPan: THREE.Vector2;
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
  objectSpriteRenderer: ObjectSpriteRenderer;
  axes: THREE.AxesHelper;
  perspectiveCamera: THREE.PerspectiveCamera;
  piemans: PieMenuManager;
  constructor(width: number, height: number) {
    this.loaded = false;
    this.assets = new AssetLoader(this.onLoaded);

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    this.activeBlock = 1;
    
    this.cameraPan = new THREE.Vector2(5,5);
    this.orthocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50);
    this.orthocam.position.set(0,0,0);
    // this.orthocam.translateOnAxis(new THREE.Vector3(1,1,1), 2)
    // this.orthocam.rotation.set(Math.PI*0.15,Math.PI*0.25,0, 'YXZ');
    this.orthocam.rotateY(degToRad(45));
    this.orthocam.rotateX(-degToRad(30));
    
    this.orthocam.translateOnAxis(new THREE.Vector3(0,0,1), 10);

      
    const cameraHelper = new THREE.CameraHelper(this.orthocam);
    this.cameraHelper = cameraHelper;
    this.scene.add(cameraHelper);
    this.perspectiveCamera = new THREE.PerspectiveCamera();
    this.perspectiveCamera.position.setZ(50);

    this.orthozoom = 9;

    /* the renderer */
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(CLEAR_COLOR);
    this.renderer.autoClear = false;
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
      new THREE.Vector3(0, -1, 0),
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
    this.axes = axes;
    axes.position.set(0,0.1,0);
    this.scene.add(axes);
    axes.setColors(RED, GREEN, BLUE);
    axes.translateX(0.001);
    axes.translateY(0.001);

    const gridHelper = new THREE.GridHelper(16, 16);
    gridHelper.position.set(0,0,0);
    this.scene.add(gridHelper);

    /* the game stuff */
    this.grid = new WorldGrid(width, height);
    for(let i = 4; i<7; i++){
      for(let j = 4; j<8; j++){
      
        this.grid.data[i][j] = 0.5;
      }
    }
    this.interactions = new InteractionController();
    this.piemans = new PieMenuManager([pie1, pie2, pie3]);

  }
  onLoaded = () => {
    this.loaded = true;
    this.terrainRenderer = new WorldTerrainRenderer(this.assets);
    this.scene.add(this.terrainRenderer.object3d);
    this.objectSpriteRenderer = new ObjectSpriteRenderer(this.assets);
    this.scene.add(this.objectSpriteRenderer.object3d);
    
    /* mount on the page */
    this.element = document.querySelector<HTMLDivElement>("#app")!;
    this.interactions.install(document);
    this.piemans.install(document);
    this.element.appendChild(this.renderer.domElement);
  }
  resizeWindow = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const orthoratio = window.innerWidth / window.innerHeight;
    this.orthocam.left = this.cameraPan.x + (-1 * 1 * orthoratio);
    this.orthocam.right = this.cameraPan.x + (1 * orthoratio);
    this.orthocam.top = this.cameraPan.y + (1);
    this.orthocam.bottom = this.cameraPan.y + (-1 * 1);
    this.orthocam.zoom = 1/this.orthozoom;
    this.orthocam.updateProjectionMatrix();
    this.cameraHelper.update();

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
    this.renderer.clear();
    // this.composer.render();
    this.renderer.setViewport(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
    this.renderer.render(this.scene, this.orthocam);
    // this.light.updateMatrix();
    this.terrainRenderer.update(this.grid);
    this.objectSpriteRenderer.update();

    this.piemans.update(delta);
      

    this.renderer.setViewport(0, 0, 256, 256);
    this.renderer.clearDepth();
    this.renderer.render(this.scene, this.perspectiveCamera);

    if (this.interactions.leftDown || this.interactions.leftClicked) {
      const x =
        (this.interactions.leftDownPos.x / this.element.clientWidth)  - 1;
      const y =
          (0 - (this.interactions.leftDownPos.y / this.element.clientHeight))  ;
      const screenSpace = new THREE.Vector3(x, y, 0);
      const raycaster = new THREE.Raycaster();
      this.orthocam.updateProjectionMatrix()
      this.orthocam.updateMatrixWorld()
      raycaster.setFromCamera(screenSpace, this.orthocam);
      const debugtext = document.querySelector<HTMLDivElement>(
        "#debugtext"
      )!;
        debugtext.innerHTML = `
      <pre>${screenSpace.x.toFixed(2)} ${screenSpace.y.toFixed(2)} ${screenSpace.z.toFixed(2)}</pre>
      `;

      const hits = this.terrainRenderer.raycast(raycaster);
      const firstHit = hits[hits.length-1];
      // console.log("hits", hits);

      if (firstHit !== undefined) {
        const hitTileX = Math.floor(firstHit.point.x);
        const hitTileZ = Math.floor(firstHit.point.z);
        const hitTileHeight = this.grid.get(hitTileX, hitTileZ) || 0;
        this.grid.brush(new THREE.Vector2(hitTileX, hitTileZ), 3, 0.05);

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
          <pre>${screenSpace.x.toFixed(2)} ${screenSpace.y.toFixed(2)} ${screenSpace.z.toFixed(2)}</pre>
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
      this.cameraPan.add(new THREE.Vector2(-this.interactions.wheelDelta.x * delta, this.interactions.wheelDelta.y * delta));
      this.resizeWindow();
    }
    this.interactions.update();
  };
}
