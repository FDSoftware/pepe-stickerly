import { useState, ChangeEvent, useRef, useEffect } from "react";
import "./App.css";
import { ChromePicker, ColorResult } from "react-color";
function App() {
  const [baseImage] = useState<HTMLImageElement>(new Image());
  const [stickerImage] = useState<HTMLImageElement>(new Image());
  const [stickerRotation, setStickerRotation] = useState<number>(0);

  const [stickerX, setStickerX] = useState<number>(50);
  const [stickerY, setStickerY] = useState<number>(50);
  const [stickerScale, setStickerScale] = useState<number>(100);
  const [stickerFlip, setStickerFlip] = useState<boolean>(false);
  const [baseImageReady, setBaseImageReady] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false); // Estado para controlar si el selector de color está abierto o cerrado

  const [canvasBackgroundColor, setCanvasBackgroundColor] =
    useState<string>("white");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    // Load default sticker
    stickerImage.src = "/pepe.png";

    stickerImage.onload = () => {
      refreshCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    baseImageReady,
    stickerX,
    stickerY,
    stickerScale,
    stickerFlip,
    stickerRotation,
  ]);

  const refreshCanvas = () => {
    if (!canvasRef.current || !baseImageReady) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = baseImage.width;
    canvas.height = baseImage.height;

    const { width: canvasWidth, height: canvasHeight } = baseImage;
    const { width: stickerWidth, height: stickerHeight } = stickerImage;
    const realWidth = canvasWidth - (stickerWidth * stickerScale) / 100;
    const realHeight = canvasHeight - (stickerHeight * stickerScale) / 100;

    // Clear canvas
    ctx?.clearRect(0, 0, canvasWidth, canvasHeight);

    // Base Image
    ctx?.drawImage(baseImage, 0, 0);

    // Sticker Image
    if (stickerFlip) {
      ctx?.save();
      ctx?.translate(
        realWidth * (stickerX / 100) + stickerWidth * (stickerScale / 200),
        realHeight * (stickerY / 100) + stickerHeight * (stickerScale / 200)
      );
      ctx?.rotate((stickerRotation * Math.PI) / 180);
      ctx?.scale(-1, 1);
      ctx?.drawImage(
        stickerImage,
        -((stickerWidth * (stickerScale / 100)) / 2),
        -((stickerHeight * (stickerScale / 100)) / 2),
        stickerWidth * (stickerScale / 100),
        stickerHeight * (stickerScale / 100)
      );
      ctx?.restore();
    } else {
      ctx?.save();
      ctx?.translate(
        realWidth * (stickerX / 100) + stickerWidth * (stickerScale / 200),
        realHeight * (stickerY / 100) + stickerHeight * (stickerScale / 200)
      );
      ctx?.rotate((stickerRotation * Math.PI) / 180);
      ctx?.drawImage(
        stickerImage,
        -((stickerWidth * (stickerScale / 100)) / 2),
        -((stickerHeight * (stickerScale / 100)) / 2),
        stickerWidth * (stickerScale / 100),
        stickerHeight * (stickerScale / 100)
      );
      ctx?.restore();
    }
  };
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      baseImage.src = URL.createObjectURL(file);
    }

    baseImage.onload = () => {
      setBaseImageReady(true);
    };
  };

  const handleRotateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rotationValue = parseInt(event.target.value);
    setStickerRotation(rotationValue);
  };

  const handlePositionChange = (axis: "x" | "y", value: number) => {
    if (axis === "x") setStickerX(value);

    if (axis === "y") setStickerY(value);

    refreshCanvas();
  };

  const handleScaleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const scale = parseInt(event.target.value);
    setStickerScale(scale);
  };
  const handleOpenColorPicker = () => {
    setShowColorPicker(true);
  };

  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
  };
  const handleColorChange = (color: ColorResult) => {
    setCanvasBackgroundColor(color.hex);
  };

  const handleDownload = () => {
    if (!canvasRef.current || !baseImageReady) return;

    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "pepe_wif_breasts.png";
    link.click();
  };

  return (
    <div className=" flex-col justify-center items-center text-center h-[70em]">
      <h1 className="mb-4 freeman  py-10  animate-jump-in animate-duration-700 animate-ease-in-out">
        Hi anon, make your meme
      </h1>

      <label
        style={{ whiteSpace: "nowrap" }}
        className="addbg animate-jump-in animate-duration-700 animate-delay-200 animate-ease-in-out"
      >
        Add background
        <input
          type="file"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </label>

      <div className="relative flex flex-col items-center mt-4 gap-[37em]">
        <canvas
          ref={canvasRef}
          style={{ backgroundColor: canvasBackgroundColor }}
          className="mb-4 w-[20em] h-[20em] mt-8 animate-jump-in animate-duration-700 animate-delay-200 animate-ease-in-out"
        />
        <div className="absolute my-[5em] max-w-[30em] text-orange-400 font-bold w-[80%] md:w-[100%] top-[35em] left-[-10] transform -translate-y-1/2">
          <div className="flex flex-col gap-4 p-4 border-4  bg-gray-100 border-black   rounded">
            <div className="flex items-center gap-2">
              <label htmlFor="x-range">X:</label>
              <input
                id="x-range"
                type="range"
                value={stickerX}
                onChange={(e) =>
                  handlePositionChange("x", parseInt(e.target.value))
                }
                min={-(stickerScale * stickerImage.width) / baseImage.width}
                max={
                  100 + (stickerScale * stickerImage.width) / baseImage.width
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="y-range">Y:</label>
              <input
                id="y-range"
                type="range"
                value={stickerY}
                onChange={(e) =>
                  handlePositionChange("y", parseInt(e.target.value))
                }
                min={-(stickerScale * stickerImage.height) / baseImage.height}
                max={
                  100 + (stickerScale * stickerImage.height) / baseImage.height
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="scale-range">Scale:</label>
              <input
                id="scale-range"
                type="range"
                value={stickerScale}
                onChange={handleScaleChange}
                min="25"
                max="400"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="scale-range">Rotation:</label>
              <input
                type="range"
                value={stickerRotation}
                onChange={handleRotateChange}
                min="-90"
                max="90"
                step="15"
              />
            </div>
            <div className="flex items-center gap-2 ">
              <label htmlFor="flip-checkbox">
                Flip pepe:
                <input
                  id="flip-checkbox"
                  type="checkbox"
                  checked={stickerFlip}
                  className="w-[1em]"
                  onChange={(e) => setStickerFlip(e.target.checked)}
                />{" "}
                <span className="checkmark mt-3 cursor-pointer"></span>
              </label>
            </div>
            <div className="flex relative md:flex-grow flex-col w-[95%] gap-2 justify-center m-auto   ">
              {showColorPicker && (
                <div className="flex absolute  left-[90%] *:flex-col m-auto">
                  <ChromePicker
                    className=" "
                    color={canvasBackgroundColor}
                    onChange={handleColorChange}
                  />
                  <button
                    onClick={handleCloseColorPicker}
                    className="bg-[#1c374d] clossed  "
                  >
                    Close
                  </button>
                </div>
              )}
              <button className="animate-jump-in animate-duration-700 animate-delay-200 animate-ease-in-out  text-white px-3 py-1 rounded">
                {" "}
                <a
                  onClick={handleOpenColorPicker}
                  style={{ whiteSpace: "nowrap" }}
                  className="text-[18px] md:text-[24px] w-full m-auto "
                >
                  {" "}
                  Change BG color
                </a>
              </button>
              <button className=" animate-jump-in animate-duration-700 animate-delay-200 animate-ease-in-out text-white px-3 py-1 rounded">
                {" "}
                <a onClick={handleDownload} className=" w-full m-auto ">
                  {" "}
                  Download
                </a>
              </button>
            </div>
          </div>
        </div>{" "}
        <iframe
          id="dextools-widget"
          sandbox="allow-same-origin allow-scripts"
          title="DEXTools Trading Chart"
          width="500"
          height="400"
          className="w-[90%] md:max-w-[30em]"
          src="https://www.dextools.io/widget-chart/en/solana/pe-light/2AvPFAV3nvTtAJpWXsMkcp5onGMNZ6YUYNoaYPjf457r?theme=light&chartType=2&chartResolution=30&drawingToolbars=false"
        ></iframe>
      </div>
    </div>
  );
}

export default App;
