import { PieMenu } from "./PieMenu";

export const pie1 = new PieMenu(91, 140);
export const pie2 = new PieMenu(91, 140);
export const pie3 = new PieMenu(91, 140);
pie2.items.push({
  name: "Toppity",
  zone: { type: "direction", value: "t" },
  autoAccept: false,
  callback: () => alert("Toppity!")
});
pie2.items.push({
  name: "Bottom",
  zone: { type: "direction", value: "b" },
  autoAccept: false,
  callback: () => alert("BoToppity!")
});
pie2.items.push({
  name: "Back",
  zone: { type: "direction", value: "l" },
  autoAccept: true,
  callback: (origin) => pie1.open(origin)
});
pie1.items.push({
  name: "TopRight",
  zone: { type: "direction", value: "tr" },
  autoAccept: false,
  callback: () => alert("Toppity Right!")
});
pie1.items.push({
  name: "Righty Ho",
  zone: { type: "direction", value: "r" },
  autoAccept: true,
  callback: (origin) => pie2.open(origin)
});
pie1.items.push({
  name: "Lefty Yo",
  zone: { type: "direction", value: "l" },
  autoAccept: true,
  callback: (origin) => pie3.open(origin)
});
pie1.items.push({
  name: "BotToppity Left",
  zone: { type: "direction", value: "bl" },
  autoAccept: false,
  callback: () => alert("Toppity!")
});
pie3.items.push({
  name: "Range Test",
  zone: { type: "range", from: 0, to: 180 },
  autoAccept: false,
  callback: () => alert("Toppity!")
});
