import { HeightBrushTool } from "./../tools/HeightBrushTool";
import { AutoPanningTool } from "../tools/AutoPanningTool";
import { easeInOutQuad, easeInOutQuadReverse } from "./../easing";
import { PieMenu } from "./PieMenu";
import { PieMenuBootstrapPayload } from "../constants";

export const pie1 = new PieMenu(91, 110);
export const pie2 = new PieMenu(91, 110);
export const pie3 = new PieMenu(91, 110);
export const pieTerrainTools = new PieMenu(91, 110);

export function bootstrapPieMenus(game: PieMenuBootstrapPayload): void {
  pieTerrainTools.items.push({
    name: "Back",
    zone: { type: "direction", value: "bl" },
    autoAccept: true,
    callback: (_origin, mouse) => pie1.open(mouse),
  });

  pieTerrainTools.items.push({
    name: "Height Brush",
    zone: { type: "direction", value: "r" },
    autoAccept: true,
    callback: () => {
      game.setNextActiveTool(new HeightBrushTool(game.hud));
    },
  });

  pie2.items.push({
    name: "AUTO Pan Tool",
    zone: { type: "direction", value: "t" },
    autoAccept: true,
    callback: (_origin, mouse: THREE.Vector2) => {
      game.setNextActiveTool(
        new AutoPanningTool(
          game.hud,
          mouse,
          game.cameraPan,
          game.orthozoom,
          game.resizeWindow
        )
      );
    },
  });

  pie2.items.push({
    name: "Back",
    zone: { type: "direction", value: "l" },
    autoAccept: true,
    callback: (_origin, mouse) => pie1.open(mouse),
  });

  pie1.items.push({
    name: "Terrain tools",
    zone: { type: "direction", value: "tr" },
    autoAccept: true,
    callback: (_origin, mouse) => pieTerrainTools.open(mouse),
  });

  pie1.items.push({
    name: "Righty Ho",
    zone: { type: "direction", value: "r" },
    autoAccept: true,
    callback: (_origin, mouse) => pie2.open(mouse),
  });

  pie1.items.push({
    name: "Lefty Yo",
    zone: { type: "direction", value: "l" },
    autoAccept: true,
    callback: (_origin, mouse) => pie3.open(mouse),
  });

  pie1.items.push({
    name: "BotToppity Left",
    zone: { type: "direction", value: "bl" },
    autoAccept: false,
    callback: () => {},
  });
  const minZoom = 0.05;
  const maxZoom = 2;
  const minAngle = 200;
  const maxAngle = 340;
  const diffAngle = 140;
  const getZoomPercentage = () => {
    return (game.orthozoom - minZoom) / (maxZoom - minZoom);
  };

  pie3.items.push({
    get name() {
      return `Zoomy Zoom ${(getZoomPercentage() * 100).toFixed(0)}`;
    },
    get tickAngle() {
      const zoomPercentage = getZoomPercentage();
      const zoomPercentage2 = easeInOutQuadReverse(zoomPercentage);
      const angle = minAngle + diffAngle * zoomPercentage2;
      game.hud.showNow(
        `tick: ${zoomPercentage.toFixed(2)} ${zoomPercentage2.toFixed(
          2
        )} ${angle.toFixed(1)}°`
      );
      return angle;
    },
    zone: { type: "range", from: minAngle, to: maxAngle },
    autoAccept: false,
    callback: () => {},
    rangeCallback: (angle) => {
      const percentage = (angle - minAngle) / diffAngle;
      game.orthozoom = minZoom + easeInOutQuad(percentage) * maxZoom;
      game.resizeWindow();
      game.hud.showNow(`zoom: ${game.orthozoom}`);
      game.hud.showNow(
        `frustum: ${game.orthocam.left.toFixed(
          1
        )} ${game.orthocam.right.toFixed(1)}`
      );
    },
  });
}
