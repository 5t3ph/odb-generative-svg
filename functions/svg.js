const { builder } = require("@netlify/functions");

const { createSVGWindow } = require("svgdom");
const window = createSVGWindow();
const document = window.document;
const { SVG, registerWindow } = require("@svgdotjs/svg.js");

// register window and document
registerWindow(window, document);

const randomize = (min, max) => {
  const randomPick = Math.random() * (max - min) + min;

  return Math.round(randomPick);
};

const colors = [
  "hsl(80, 95%, 78%)",
  "hsl(200, 95%, 80%)",
  "hsl(260, 95%, 80%)",
  "hsl(320, 95%, 80%)",
  "hsl(380, 95%, 80%)",
];

const createSVG = async (width, height) => {
  const points = [...Array(80)].map(() => {
    return {
      x: randomize(0, width),
      y: randomize(0, height),
    };
  });

  const canvas = SVG(document.documentElement)
    .viewbox(0, 0, width, height)
    .attr({
      width,
      height,
      focusable: false,
      "aria-hidden": true,
    });

  canvas.rect(width, height).fill("hsl(260, 95%, 95%)");

  points.forEach(({ x, y }) => {
    const color = colors[randomize(0, colors.length - 1)];

    canvas
      .circle(randomize(5, width / 10))
      .cx(x)
      .cy(y)
      .fill(color);
  });

  return canvas.svg();
};

async function handler(event) {
  let pathSplit = event.path.split("/").filter((entry) => !!entry);
  let [_seed, width, height] = pathSplit;

  // Set Defaults
  width = width || 200;
  height = height || 200;

  try {
    let output = await createSVG(width, height);

    return {
      statusCode: 200,
      headers: {
        "content-type": `image/svg+xml`,
      },
      body: `${output}`,
      isBase64Encoded: false,
    };
  } catch (error) {
    console.log("Error", error);

    return {
      // We need to return 200 here or Firefox won’t display the image
      // HOWEVER a 200 means that if it times out on the first attempt it will stay the default image until the next build.
      statusCode: 200,
      headers: {
        "content-type": "image/svg+xml",
        "x-error-message": error.message,
      },
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false"><text x="20" y="35">: )</text></svg>`,
      isBase64Encoded: false,
    };
  }
}

exports.handler = builder(handler);
