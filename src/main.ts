import { GameState } from "./gamestate";
import "./pie-menu/PieMenuManager";

const gamestate = new GameState(32, 32);
window.game = gamestate;

window.addEventListener("resize", gamestate.resizeWindow);
gamestate.resizeWindow();

export function animate() {
  gamestate.update();
  requestAnimationFrame(animate);
}
animate();


