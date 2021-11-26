export class Hud {
  private _element: HTMLDivElement;
  private _element_immediate: HTMLPreElement;
  private _element_log: HTMLPreElement;
  private _element_activetool: HTMLPreElement;
  private _immediate: string;
  private _immediate_previous: string;
  private _logsize: number;
  private _logdirty: boolean;
  private _log: string[];
  private _activeTool: string;
  private _activeTool_dirty: boolean;
  constructor(logsize: number) {
    this._immediate = [];
    this._log = [];
    this._logdirty = false;
    this._activeTool = "?";
    this._activeTool_dirty = false;

    this._element = document.getElementById("app-hud")! as HTMLDivElement;

    this._element_activetool = document.createElement("pre") as HTMLPreElement;
    this._element_activetool.id = "app-hud--activetool";
    this._element_activetool.className = "boxy";
    this._element.appendChild(this._element_activetool);
    this._element_log = document.createElement("pre") as HTMLPreElement;
    this._element_log.id = "app-hud--log";
    this._element_log.className = "boxy";
    this._element.appendChild(this._element_log);
    this._element_immediate = document.createElement("pre") as HTMLPreElement;
    this._element_immediate.id = "app-hud--immediate";
    this._element_immediate.className = "boxy";
    this._element_immediate.style.height = "5em";
    this._element.appendChild(this._element_immediate);

    this._logsize = logsize;
    for (let i = 0; i < logsize; i++) {
      const logline = document.createElement("pre");
      this._element_log.appendChild(logline);
      this.logInfo(" ");
    }
  }
  setActiveTool(tool: string) {
    if (tool !== this._activeTool) {
      this._activeTool = tool;
      this._activeTool_dirty = true;
    }
  }
  logInfo(s: string) {
    this._log.push(s);
    while (this._log.length > this._logsize) {
      this._log.splice(0, 1);
    }
    this._logdirty = true;
  }
  showNow(s: string) {
    this._immediate += s + "\n";
  }
  update() {
    if (this._logdirty) {
      this._log.forEach((text, i) => {
        this._element_log.children[i].innerText = text;
      });
      this._logdirty = false;
    }
    if (this._activeTool_dirty) {
      this._element_activetool.innerText = this._activeTool;
      this._activeTool_dirty = false;
    }
    if (this._immediate !== this._immediate_previous) {
      this._element_immediate.innerText = this._immediate;
      this._immediate_previous = this._immediate;
    }
    this._immediate = "";
  }
}
