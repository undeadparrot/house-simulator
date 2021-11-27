import { IdleTool } from "./../tools/IdleTool";
import {
  GameTool,
  GameToolUpdatePayload,
  TOOL_BUSY,
  TOOL_CLOSING,
  TOOL_DONE,
  TOOL_SKIP,
} from "./../constants";

export class ToolController {
  private readonly _activeStack: GameTool[];
  private readonly _closingList: GameTool[];
  private _nextTool?: GameTool;
  private readonly _idletool: IdleTool;
  constructor(makeNewIdleTool: (arg0: (tool: GameTool) => void) => IdleTool) {
    this._idletool = makeNewIdleTool(this.setNextTool);
    this._activeStack = [this._idletool];
    this._closingList = [];
    this._nextTool = undefined;
  }

  get activeTool(): GameTool {
    return this._activeStack[this._activeStack.length-1];
  }

  setNextTool = (tool: GameTool) => {
    this._nextTool = tool;
  };

  update(delta: number, extras: GameToolUpdatePayload) {
    extras.hud.showNow(
      "TOOLS " + this._activeStack.map((t) => t.getName()).join("; ")
    );
    extras.hud.showNow(
      "CLOSING " + this._closingList.map((t) => t.getName()).join("; ")
    );
    this._updateActiveTool(delta, extras);
    this._updateClosingTools(delta, extras);
  }

  get isIdle(): boolean {
    return this.activeTool === this._idletool;
  }

  private _updateActiveTool = (
    delta: number,
    extras: GameToolUpdatePayload
  ) => {
    const tool = this.activeTool;
    const returncode = tool.update(false, delta, extras);
    switch (returncode) {
      case TOOL_BUSY:
        break;
      case TOOL_SKIP:
        this._idletool.update(false, delta, extras);
        break;
      case TOOL_DONE:
        this._activeStack.pop();
        extras.hud.logInfo(`TOOL [${tool.getName()}] done`);
        break;
      case TOOL_CLOSING:
        extras.hud.logInfo(`TOOL [${tool.getName()}] closing`);
        this._activeStack.pop();
        this._closingList.push(tool);
        break;
    }
    if (this._nextTool !== undefined) {
      this._activeStack.push(this._nextTool);
      this._nextTool = undefined;
    }
    if (this._activeStack.length === 0) {
      this._activeStack.push(this._idletool);
    } 
  };

  private _updateClosingTools = (
    delta: number,
    extras: GameToolUpdatePayload
  ) => {
    for (const tool of [...this._closingList]) {
      const returncode = tool.update(true, delta, extras);
      switch (returncode) {
        case TOOL_BUSY:
          break;
        case TOOL_DONE:
          const index = this._closingList.indexOf(tool);
          this._closingList.splice(index, 1);
          extras.hud.logInfo(`TOOL [${tool.getName()}] done`);
          break;
        case TOOL_CLOSING:
          break;
      }
    }
  };
}
