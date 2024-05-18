import { useEffect, useState } from "react";
import { MemeEditor } from "./MemeEditorV3";

export interface ILayer {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    img: string
}

export default function App() {
    const [layers, setLayers] = useState<Array<ILayer>>([{
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        id: "stickerLayer",
        img: "/pepe.webp" // default image
    }]);

    const [fliped, setFipled] = useState(false);
    const [image] = useState(new window.Image());
    const [imageSize, setImageSize] = useState({ x: 0, y: 0 });

    // const for updates with the fliped state
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

    // for track the current "pepe" selected
    const [currentPepeId, setCurrentPepeId] = useState(1);

    //upload background img & update canvas size
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        image.src = URL.createObjectURL(file);
        image.onload = function () {
            setImageSize({ x: image.width, y: image.height })
        }

    };

    // check fliped for update on-canvas "pepe" image
    useEffect(() => {
        setLayers((prev) =>
            prev.map((item) => {
                if (item.id === "stickerLayer") {
                    const newPepe = stickerArray.find(pred => pred.id === currentPepeId);
                    item.img = newPepe?.src ?? "/pepe.webp";
                }
                return item;
            })
        );
    }, [fliped])

    return (<>
        <input type="file" onChange={handleImageUpload} />
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
                                    if (item.id === "stickerLayer") {
                                        item.img = image.src;
                                        setCurrentPepeId(image.id);
                                    }
                                    return item;
                                })
                            );
                        }}
                    />
                </div>))}
        </div>
        <div className="flex m-auto gap-2 items-center">
            <label
                className="block text-white text-md font-bold mb-2"
                htmlFor="username"
            >
                Change pepe:
            </label>
            <div>
                <label
                    className="block text-white text-md font-bold mb-2"
                    htmlFor="flipCheckbox"
                >
                    <input
                        id="flipCheckbox"
                        type="checkbox"
                        checked={fliped}
                        placeholder="add text here"
                        onChange={() => setFipled((prev) => !prev)}
                    />
                    <span className="checkmark mt-3 cursor-pointer"></span>
                </label>
            </div>
        </div>
        <MemeEditor layers={layers} setLayers={setLayers} image={image} imageSize={imageSize} />

    </>);
}