import type { MetaFunction } from "@remix-run/node";

import { Klint, KlintContexts, useKlint } from "@shopify/klint";
import { Time, Easing, Color } from "@shopify/klint/plugins";

export const meta: MetaFunction = () => {
  return [
    { title: "Testing Klint" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { context, useWindow, useMouse } = useKlint();
  const { onResize } = useWindow();
  const { mouse } = useMouse();
  onResize((K: KlintContexts) => {
    const b = K.getOffscreen("buffer");
    b.resizeCanvas(K.width * 0.75, K.height * 0.75);
    drawOffscreen(b);
  });

  const drawOffscreen = (O: KlintContexts) => {
    O.noStroke();
    O.fillColor("#EEEEDD");
    const dimension = Math.min(O.width, O.height);
    O.roundedRectangle(0, 0, O.width, dimension * 0.0125, O.height);
    O.textFont("Inter");
    O.textSize(dimension * 0.225);
    O.fillColor("#000");
    O.alignText("center", "middle");
    O.text("Klint", O.width * 0.45, O.height * 0.55);
    O.textSize(O.width * 0.0175);
    O.alignText("left");
    O.text("npm i @shopify/klint", dimension * 0.045, dimension * 0.045);
    O.text(
      "made with 💚 for Shopify",
      dimension * 0.045,
      O.height - dimension * 0.045
    );
    O.alignText("right");
    O.text("v0.0.9", O.width - dimension * 0.045, dimension * 0.045);
    O.text(
      "#creative-coding",
      O.width - dimension * 0.045,
      O.height - dimension * 0.045
    );
  };

  const preload = async (K: KlintContexts) => {
    //@ts-expect-error non-breaking ts error
    K.extend("Time", new Time(K));
    //@ts-expect-error non-breaking ts error
    K.extend("Easing", new Easing(K));
    K.extend("Color", new Color());
    K.setRectOrigin("center");
    K.alignText("center", "middle");
    K.setImageOrigin("center");
    K.noStroke();

    K.createOffscreen(
      "buffer",
      K.width * 0.75,
      K.height * 0.75,
      {},
      (O: KlintContexts) => {
        drawOffscreen(O);
      }
    );
  };

  function easing(t: number, power: number): number {
    if (t < 0.5) {
      return Math.pow(t * 2, power) / 2;
    } else {
      return 1 - Math.pow((1 - t) * 2, power) / 2;
    }
  }

  const draw = (K: KlintContexts) => {
    const { Color } = K;
    K.background(Color.golden);

    const w = { min: K.width / 8, max: K.width };
    const h = { min: K.height / 8, max: K.height };
    const b = K.getOffscreen("buffer");
    const ffe = 1 * 60;
    const count = 4;
    const tf = ffe * count;
    const progress = (K.frame / tf) % 1;
    const actual = Math.floor(progress * count);
    const actualprogress = easing((progress * count) % 1, 8);

    const pointsx = [
      -K.width * 0.5 + w.min * 0.5,
      -K.width * 0.5 + w.max * 0.5,
      K.width * 0.5 - w.min * 0.5,
      K.width * 0.5 - w.max * 0.5,
    ];
    const pointsxb = [
      K.width * 0.5 - w.max * 0.5,
      K.width * 0.5 - w.min * 0.5,
      -K.width * 0.5 + w.max * 0.5,
      -K.width * 0.5 + w.min * 0.5,
    ];
    const pointsy = [
      -K.height * 0.5 + h.min * 0.5,
      -K.height * 0.5 + h.max * 0.5,
      K.height * 0.5 - h.min * 0.5,
      K.height * 0.5 - h.max * 0.5,
    ];
    const pointsyb = [
      K.height * 0.5 - h.max * 0.5,
      K.height * 0.5 - h.min * 0.5,
      -K.height * 0.5 + h.max * 0.5,
      -K.height * 0.5 + h.min * 0.5,
    ];

    const sx = [w.min, w.max, w.min, w.max];
    const sy = [h.min, h.max, h.min, h.max];

    let px = K.lerp(
      pointsx[actual],
      pointsx[(actual + 1) % pointsx.length],
      actualprogress
    );
    let py = K.lerp(
      pointsy[actual],
      pointsy[(actual + 1) % pointsy.length],
      actualprogress
    );

    let pw = K.lerp(sx[actual], sx[(actual + 1) % sx.length], actualprogress);
    let ph = K.lerp(sy[actual], sy[(actual + 1) % sy.length], actualprogress);

    let rpx = K.lerp(
      pointsxb[actual],
      pointsxb[(actual + 1) % pointsxb.length],
      actualprogress
    );
    let rpy = K.lerp(
      pointsyb[actual],
      pointsyb[(actual + 1) % pointsyb.length],
      actualprogress
    );
    const rpw = K.lerp(
      sx[(actual + 1) % sx.length],
      sx[(actual + 2) % sx.length],
      actualprogress
    );
    const rph = K.lerp(
      sy[(actual + 1) % sy.length],
      sy[(actual + 2) % sy.length],
      actualprogress
    );

    K.push();
    if (mouse.isPressed) {
      rpx = mouse.x - K.width / 2;
      rpy = mouse.y - K.height / 2;
      px = 0;
      py = 0;
      pw = K.width;
      ph = K.height;
    }
    const it = 64;
    for (let i = 0; i < it; i++) {
      const idd = i / (it - 1);
      const x = K.lerp(px, rpx, idd);

      const y = K.lerp(py, rpy, idd);
      const w = K.lerp(pw, rpw, idd);
      const _h = K.lerp(ph, rph, idd);

      const oscillationFactor = Math.sin(Math.PI * 2 * (i / (it - 1)));
      const dx = x + oscillationFactor * (Math.cos(progress * Math.PI * 2) * w);
      const dy = y + oscillationFactor * (Math.cos(progress * Math.PI * 2) * w);

      K.push();

      K.translate(K.width / 2 + dx, K.height / 2 + dy);
      K.image(b, 0, 0, w, _h);
      K.pop();
    }
    K.pop();
  };

  return (
    <div className="main  flex h-screen items-center justify-center">
      <div className="container overflow-hidden rounded-xl w-[80%] h-[80%]">
        <Klint context={context} preload={preload} draw={draw}></Klint>
      </div>
    </div>
  );
}
