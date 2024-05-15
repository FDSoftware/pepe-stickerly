import { useEffect, useState, useRef, useMemo, useCallback } from "react";

function drawImage(
  ctx: CanvasRenderingContext2D | null,
  draw: () => void,
  item: CanvasLayer
) {
  if (!ctx) return;
  if (!item.url) return;

  if (!item.img) {
    const image = new Image();
    image.src = item.url;
    item.img = image;
    image.onload = () => {
      draw();
    };
    return;
  }

  ctx.save();
  const centerX = item.x + item.width / 2;
  const centerY = item.y + item.height / 2;
  ctx.translate(centerX, centerY);
  ctx.rotate(item.rotation);
  const aspectRatio = item.img.width / item.img.height;
  // Adjust either the width or height based on the aspect ratio
  let drawWidth = item.width;
  let drawHeight = item.height;
  if (item.width / item.height !== aspectRatio) {
    if (item.width / item.height > aspectRatio) {
      drawWidth = item.height * aspectRatio;
    } else {
      drawHeight = item.width / aspectRatio;
    }
  }

  ctx.scale(item.scaleFactor, item.scaleFactor);
  ctx.translate(-centerX, -centerY);
  ctx.save();

  ctx.restore();
  ctx.drawImage(item.img, item.x, item.y, drawWidth, drawHeight);
  ctx.restore();
}

function getClientCoordinates(
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  canvas: HTMLCanvasElement | null
) {
  if (!canvas) return;
  const canvasRect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / canvasRect.width;
  const scaleY = canvas.height / canvasRect.height;
  return {
    x: (e.clientX - canvasRect.left) * scaleX,
    y: (e.clientY - canvasRect.top) * scaleY,
  };
}

function IsThePointerInTheObject(x: number, y: number, object: CanvasLayer) {
  const scaledWidth = object.width * object.scaleFactor;
  const scaledHeight = object.height * object.scaleFactor;
  const centerX = object.x + object.width / 2;
  const centerY = object.y + object.height / 2;
  const newX = centerX - scaledWidth / 2;
  const newY = centerY - scaledHeight / 2;
  if (
    x >= newX &&
    x <= newX + scaledWidth &&
    y >= newY &&
    y <= newY + scaledHeight
  ) {
    return true;
  }
  return false;
}

interface CanvasLayer {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleFactor: number;
  active: boolean;
  type: string;
  rotation: number;

  // for image nodes
  url?: string;
  img?: (CanvasImageSource & { width: number; height: number }) | null;

  // for text nodes
  fontSize?: number;
  fontWeight?: number;
  text?: string;
  color?: string;
  fillStyle?: string;
  fontFamily?: string;
  calculatedY?: number;
}

// draw text
function drawText(ctx: CanvasRenderingContext2D | null, item: CanvasLayer) {
  if (!ctx || !item.text) return;

  ctx.save();
  ctx.fillStyle = item.color ?? "";
  ctx.font = "50px Arial"; //`${item.fontWeight} ${item.fontSize ?? 24 * item.scaleFactor}px`;
  const textWidth = ctx.measureText(item.text).width;
  item.width = textWidth;
  item.height = item.fontSize ?? 24;
  item.calculatedY = item.y - item.height;
  ctx.fillText(item.text, item.x, item.y);
  ctx.restore();
}

export function MemeEditor() {
  // canva layers logic
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<null | CanvasRenderingContext2D>(null);
  const [layers, setLayers] = useState<Array<CanvasLayer>>([
    {
      name: "stickerLayer",
      x: 30, //initial position
      y: 30, //initial position
      width: 500,
      height: 500,
      scaleFactor: 1,
      active: false,
      type: "image",
      url: "/pepe.webp",
      rotation: 0,
    },
    {
      name: "textLayer",
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      scaleFactor: 5,
      active: false,
      type: "text",
      fontSize: 80,
      fontWeight: 120,
      text: "",
      color: "white",
      //here you can add any properties like fontFamily etc
      rotation: 0,
    },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // image upload logic:
  const [baseImage] = useState<HTMLImageElement>(new Image());
  const [baseImageReady, setBaseImageReady] = useState<boolean>(false);

  // Asset image logic:
  const [stickerImageUrl, setStickerImageUrl] = useState(1);
  const [fliped, setFipled] = useState(false);
  // canva draw logic

  const draw = useCallback(
    function draw() {
      if (!ctx) return;

      // fondito
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (baseImageReady) {
        ctx.drawImage(baseImage, 0, 0);
      } else {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }

      layers.forEach((item) => {
        if (item.type === "image") {
          drawImage(ctx, draw, item);
        } else if (item.type === "text") {
          drawText(ctx, item);
        }
      });
    },
    [ctx, baseImageReady, layers, baseImage]
  );

  // canva text
  const [canvaText, setCanvaText] = useState("");

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setLayers((prev) =>
        prev.map((items) => {
          if (items.name === "textLayer") {
            items.text = canvaText;
          }
          return items;
        })
      );
    }, 50);
    return () => clearTimeout(delayInputTimeoutId);
  }, [canvaText, 50]);

  useEffect(() => {
    canvas.current = document.getElementById("canvas") as HTMLCanvasElement;
    setCtx(canvas.current.getContext("2d"));
  }, []);

  // canva handlers:

  const handleCanvasMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const coordinates = getClientCoordinates(event, canvas.current);
    setLayers((prev) =>
      prev.map((item) => {
        item.active = false;
        return item;
      })
    );

    if (!coordinates) return;

    setLayers((prev) =>
      prev.map((item) => {
        if (IsThePointerInTheObject(coordinates.x, coordinates.y, item)) {
          setIsDragging(true);
          setOffsetX(coordinates.x - item.x);
          setOffsetY(coordinates.y - item.y);
          item.active = true;
        }

        return item;
      })
    );
  };

  const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const coordinates = getClientCoordinates(event, canvas.current);
    if (!coordinates) return;
    if (isDragging) {
      const activeObject = layers.find((dr) => dr.active === true);
      if (activeObject) {
        activeObject.x = coordinates.x - offsetX;
        activeObject.y = coordinates.y - offsetY;
      }
      draw();
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    draw(); // reemplace to useEffect with isDraggin deep
  };

  useEffect(
    function updateOnStickerChange() {
      draw();
    },
    [stickerImageUrl, draw]
  );

  // Background image upload logic

  const handleBaseImageLoad = () => {
    if (!canvas.current) return;
    canvas.current.width = baseImage.width;
    canvas.current.height = baseImage.height;
    setBaseImageReady(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    baseImage.src = URL.createObjectURL(file);
    baseImage.onload = handleBaseImageLoad;
  };

  useMemo(() => {
    if (baseImageReady) draw();
  }, [baseImageReady, draw]);

  // render on default load, no image
  useMemo(() => {
    if (ctx) draw();
  }, [ctx, draw]);

  // resize object:
  const handleResize = (event: React.WheelEvent<HTMLCanvasElement>) => {
    setLayers((prev) =>
      prev.map((currentItem) => {
        if (currentItem.active) {
          if (event.deltaY < 0) {
            currentItem.scaleFactor *= 1.1;
          } else {
            currentItem.scaleFactor /= 1.1;
          }
        }
        return currentItem;
      })
    );
    draw();
  };

  const handleKeyDown = useCallback(
    (event: { key: string }) => {
      setLayers((prev) =>
        prev.map((currentItem) => {
          if (currentItem.active) {
            if (event.key === "ArrowUp") {
              currentItem.rotation -= 0.1;
            } else if (event.key === "ArrowDown") {
              currentItem.rotation += 0.1;
            } else if (event.key === "ArrowLeft") {
              currentItem.rotation -= 0.1;
            } else if (event.key === "ArrowRight") {
              currentItem.rotation += 0.1;
            }
          }
          return currentItem;
        })
      );

      draw();
    },
    [setLayers, draw]
  );

  // keyboard listener for active item
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const stickerArray = [
    { id: 1, src: fliped ? "/pepe_fliped.webp" : "/pepe.webp", alt: "pepe1" },
    {
      id: 2,
      src: fliped ? "/pepe_2_fliped.webp" : "/pepe_2.webp",
      alt: "pepe2",
    },
    {
      id: 3,
      src: fliped ? "/pepe_3_fliped.webp" : "/pepe_3.webp",
      alt: "pepe3",
    },
  ];

  useEffect(() => {
    setLayers((prev) =>
      prev.map((item) => {
        if (item.name === "stickerLayer") {
          item.img = null;
          item.url = stickerArray.find(
            (stickers) => stickers.id === stickerImageUrl
          )?.src;
        }
        return item;
      })
    );
    setTimeout(() => draw(), 50);
  }, [fliped, setStickerImageUrl]);

  return (
    <>
      <div className="flex w-full h-full gap-4">
        <div className=" flex flex-col gap-2">
          <label
            style={{ whiteSpace: "nowrap" }}
            className="addbg animate-jump-in animate-duration-700 animate-delay-200 animate-ease-in-out"
          >
            Add background
            <input
              type="file"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </label>{" "}
          <div className="flex m-auto gap-2">
            <label
              className="block text-white text-md font-bold mb-2"
              htmlFor="username"
            >
              Change pepe:
            </label>{" "}
            <div>
              <label
                className="block text-white text-md font-bold mb-2"
                htmlFor="flipCheckbox"
              >
                Flip
              </label>
            </div>
            <input
              id="flipCheckbox"
              type="checkbox"
              checked={fliped}
              placeholder="add text here"
              onChange={() => setFipled((prev) => !prev)}
            />
          </div>
          <div className="flex gap-2">
            {stickerArray.map((image) => (
              <div
                key={image.id}
                className="max-w-[6em] m-auto border-2 border-solid border-[#4b0b74] bg-[#8713ce] box-border rounded-md p-1 my-2 cursor-pointer animate-jump-in"
                style={{ width: "6em", height: "6em" }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full  object-fill"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                  onClick={() => {
                    setLayers((prev) =>
                      prev.map((item) => {
                        if (item.name === "stickerLayer") {
                          item.img = null;
                          item.url = image.src;
                          setStickerImageUrl(image.id);
                        }
                        return item;
                      })
                    );
                  }}
                />
              </div>
            ))}
          </div>{" "}
          <button
            className="addbg  animate-jump-in animate-duration-700 animate-delay-200 animate-ease-in-out"
            onClick={() => {
              const currentCanvas = document.querySelector(
                "#canvas"
              ) as HTMLCanvasElement | null;
              if (!currentCanvas) return;
              const link = document.createElement("a");
              link.download = "imageFileName.png";
              link.href = currentCanvas.toDataURL("image/png");
              link.click();
            }}
          >
            Download Image
          </button>
        </div>
        <canvas
          id="canvas"
          width="400"
          height="300"
          onMouseDown={(e) => handleCanvasMouseDown(e)}
          onMouseUp={() => handleCanvasMouseUp()}
          onMouseMove={(e) => handleCanvasMouseMove(e)}
          onWheel={(e) => handleResize(e)}
        />

        <div className="mb-4">
          <label
            className="block text-white text-md font-bold mb-2"
            htmlFor="username"
          >
            Write here:
          </label>
          <input
            value={canvaText}
            onChange={(event) => setCanvaText(event.target.value)}
            className="shadow appearance-none border rounded bg-white text-black w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
          />
        </div>
      </div>
    </>
  );
}
