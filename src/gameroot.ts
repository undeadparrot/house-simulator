import { PieTool } from './tools/PieTool';
import { PanningTool } from './tools/PanningTool';
import * as THREE from "three";
import { WorldGrid } from "./WorldGrid";
import { ObjectSpriteRenderer } from "./rendering/ObjectSpriteRenderer"
import { WorldTerrainRenderer } from "./rendering/WorldTerrainRenderer"
import { InteractionController } from "./InteractionController";
import {
  CLEAR_COLOR,
  RED,
  GREEN,
  BLUE,
  XPLUS,
  YPLUS,
  ZPLUS,
  TOOL_DONE,
  TOOL_CLOSING,
  GameTool,
} from "./constants";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { AssetLoader } from "./AssetLoader";
import { degToRad } from "three/src/math/MathUtils";
import { PieMenuManager } from "./pie-menu/PieMenuManager";
import {Hud} from "./Hud";
import {IdleTool} from "./tools/IdleTool";
import { bootstrapPieMenus, pie1, pie2, pie3, pieTerrainTools } from "./pie-menu/pie-menu-definitions";

const IDLE_TOOL = new IdleTool();

export class GameRoot {
  loaded: boolean;
  hud: Hud;
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
  activeTool: GameTool;
  cameraHelper: THREE.CameraHelper;
  closingTools: GameTool[];
  nextActiveTool?: GameTool;
  constructor(width: number, height: number) {
    this.loaded = false;
    this.assets = new AssetLoader(this.onLoaded);
    this.hud = new Hud(15);
    this.activeTool = IDLE_TOOL;
    this.closingTools = [];

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

    this.orthozoom = 0.25;

    /* the renderer */
    this.renderer = new THREE.WebGLRenderer();
    var WW = window.innerWidth;
    var HH = window.innerHeight;
    this.renderer.setSize( WW, HH );        
    this.renderer.setClearColor(CLEAR_COLOR);
    this.renderer.autoClear = false;
    this.composer = new EffectComposer(this.renderer);
    this.renderp = new RenderPass(this.scene, this.orthocam);
    this.composer.addPass(this.renderp);

    // this.effectFXAA = new ShaderPass(FXAAShader);
    // this.effectFXAA.renderToScreen = true;
    // this.effectFXAA.enabled = false;
    // this.composer.addPass(this.effectFXAA);


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
    this.piemans = new PieMenuManager([pie1, pie2, pie3, pieTerrainTools]);

  }
  onLoaded = () => {
    this.loaded = true;
    this.terrainRenderer = new WorldTerrainRenderer(this.assets);
    this.scene.add(this.terrainRenderer.object3d);
    this.objectSpriteRenderer = new ObjectSpriteRenderer(this.assets);
    this.scene.add(this.objectSpriteRenderer.object3d);
    bootstrapPieMenus(this);
    
    /* mount on the page */
    this.element = document.querySelector<HTMLDivElement>("#app")!;
    this.interactions.install(document);
    this.piemans.install(document);
    this.element.appendChild(this.renderer.domElement);
  }
  resizeWindow = () => {
    // renderer.render( this.scene, this.camera );
    // const innerWidth = window.innerWidth;
    // const innerHeight = window.innerHeight;
    // const pixelRatio = window.devicePixelRatio;
    // this.renderer.setPixelRatio(pixelRatio);
    // // this.composer.setPixelRatio(pixelRatio);
    // // this.composer.setSize(innerWidth, innerHeight);
    // // this.renderer.setViewport(0,0,innerWidth, innerHeight)
    // this.renderer.setSize(innerWidth, innerHeight);

    const orthoratio = innerWidth / innerHeight;
    const offsetX = orthoratio;
    const offsetY = (this.cameraPan.y + this.orthozoom);
    this.orthocam.left = this.cameraPan.x + -1*orthoratio;// + this.cameraPan.x; 
    this.orthocam.right = this.cameraPan.x + orthoratio;// + this.cameraPan.x; 
    this.orthocam.top = this.cameraPan.y + -1 ;
    this.orthocam.bottom = this.cameraPan.y + 1 ;
    this.orthocam.zoom = this.orthozoom;
    this.orthocam.updateProjectionMatrix();
    this.cameraHelper.update();
    
  };
  update = () => {
    if(this.loaded === false){
      return;
    }
    const delta = this.clock.getDelta();
    this.hud.setActiveTool([this.activeTool.getName(), ...this.closingTools.map(tool => tool.getName())].join("\n"));
    if(this.interactions.leftPressed){
      this.hud.logInfo("LDown")
    }if(this.interactions.leftReleased){
      this.hud.logInfo("LUp")
    }
    this.renderer.clear();
    // this.composer.render();
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.orthocam);
    // this.light.updateMatrix();
    this.terrainRenderer.update(this.grid);
    this.objectSpriteRenderer.update();

    this.renderer.setViewport(0, 0, 256, 256);
    this.renderer.clearDepth();
    this.renderer.render(this.scene, this.perspectiveCamera);

    const x =
        (this.interactions.leftDownPos.x / this.element.clientWidth)  - 1;
      const y =
          (0 - (this.interactions.leftDownPos.y / this.element.clientHeight))  ;
      const screenSpace = new THREE.Vector3(x, y, 0);
      const raycaster = new THREE.Raycaster();
      this.orthocam.updateProjectionMatrix()
      this.orthocam.updateMatrixWorld()
      raycaster.setFromCamera(screenSpace, this.orthocam);
        this.hud.showNow(`${screenSpace.x.toFixed(2)} ${screenSpace.y.toFixed(2)} ${screenSpace.z.toFixed(2)}`);

    const hits = this.terrainRenderer.raycast(raycaster);
    const firstHit = hits[hits.length-1];

    this.updateClosingTools(delta);
    if(this.activeTool === IDLE_TOOL){
      if (this.interactions.leftPressed) {
        if (this.interactions.shiftDown) {
          this.activeTool = new PanningTool(this.hud, this.interactions.mousePos, this.cameraPan,this.orthozoom,window.innerWidth,this.orthocam.right-this.orthocam.left,this.resizeWindow)
        } 
      }else if(this.interactions.rightPressed){

        this.activeTool = new PieTool(this.hud, this.interactions.mousePos, this.piemans)
      }
    } else {
      this.updateActiveTool(delta);
    }
    // if (this.interactions.leftDown || this.interactions.leftClicked) {
      
    //   this.brushTerrain(firstHit, screenSpace);
    // }
    // if (this.interactions.shiftDown) {
    //   this.orthozoom = Math.min(
    //     Math.max(
    //       this.orthozoom + this.interactions.wheelDelta.y * 0.5 * delta,
    //       1
    //     ),
    //     50
    //   );
    //   this.resizeWindow();
    // } else {
    //   this.cameraPan.add(new THREE.Vector2(-this.interactions.wheelDelta.x * delta, this.interactions.wheelDelta.y * delta));
    //   this.resizeWindow();
    // }
    this.interactions.update();
    this.hud.update();
  };

  public setNextActiveTool = (tool: GameTool) => {
    this.hud.logInfo(this.activeTool.getName() + " -> " + tool.getName())
    this.closingTools.push(this.activeTool);
    this.nextActiveTool = tool;
  }

  private updateActiveTool = (delta: number) => {
    const toolReturn = this.activeTool.update(false, delta, this.interactions, this.hud);
    switch (toolReturn) {
      case TOOL_DONE:
        this.hud.logInfo(this.activeTool.getName() + " Done");
        this.activeTool = IDLE_TOOL;
        break;
      case TOOL_CLOSING:
        this.hud.logInfo(this.activeTool.getName() + " (closing)");
        this.setNextActiveTool(IDLE_TOOL);
        break;
    }
    if(this.nextActiveTool !== undefined){
      this.activeTool = this.nextActiveTool;
      this.nextActiveTool = undefined;
    }
  }

  private updateClosingTools = (delta: number) => {
    const closedTools = [];
    for (const tool of this.closingTools) {
      const toolReturn = tool.update(true, delta, this.interactions, this.hud);

      switch (toolReturn) {
        case TOOL_DONE:
          closedTools.push(tool);
          this.hud.logInfo(tool.getName() + " (closing) Done");
          break;
        case TOOL_CLOSING:
          break;
      }
    }
    closedTools.forEach(tool => this.closingTools.splice(this.closingTools.indexOf(tool), 1));
  }

  private brushTerrain(firstHit: THREE.Intersection<THREE.Object3D<THREE.Event>>, screenSpace: THREE.Vector3) {
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
        this.hud.showNow(`${screenSpace.x.toFixed(2)} ${screenSpace.y.toFixed(2)} ${screenSpace.z.toFixed(2)}`);
        this.hud.showNow(`${p0.x.toFixed(2)} ${p0.y.toFixed(2)} ${p0.z.toFixed(2)}`);
        this.hud.showNow(`faceindex: ${firstHit.faceIndex}`);

      }
    }
  }
}
