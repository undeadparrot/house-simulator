import { GameRoot } from "./gameroot";
import "./pie-menu/PieMenu";

const gamestate = new GameRoot(32, 32);
window.game = gamestate;

window.addEventListener("resize", gamestate.resizeWindow);
gamestate.resizeWindow();

export function animate() {
  gamestate.update();
  requestAnimationFrame(animate);
}
animate();


