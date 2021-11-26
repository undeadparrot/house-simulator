import * as THREE from 'three';
import {InteractionController} from "../InteractionController"
import {Hud} from "../Hud"
import { PieMenuManager } from "../pie-menu/PieMenuManager"
import { GameTool, TOOL_BUSY, TOOL_CLOSING, TOOL_DONE } from '../constants';
export class PieTool implements GameTool{
    private _pieman: PieMenuManager;
    private _start: THREE.Vector2;
    constructor(hud: Hud, p: THREE.Vector2, piemanager: PieMenuManager){
        this._start = p;
        this._pieman = piemanager;
        piemanager.update(1, p, true, false);
        hud.logInfo("Pie open");
    }
    getName = () => {return "Pie Menu"}
    update = (closing: boolean, delta: number, interactions: InteractionController, hud: Hud) => {
        if(closing){
            return TOOL_DONE;
        }
        const status = this._pieman.update(delta, interactions.mousePos, interactions.leftPressed, interactions.leftReleased);
        if(status === TOOL_BUSY){
            return TOOL_BUSY;
        }else if(status===TOOL_CLOSING){
            return TOOL_CLOSING;
        }
        hud.logInfo("Pie close")
        return TOOL_DONE;
    }
}