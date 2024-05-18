import React, { FC } from "react";
import { Stage, Layer, Image, Transformer } from "react-konva";
import useImage from "use-image";
import { ILayer } from "../App";

const Rectangle: FC<{
  shapeProps: ILayer;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: ILayer) => void;
  imgSrc: string;
}> = ({ shapeProps, isSelected, onSelect, onChange, imgSrc }) => {
  const [image] = useImage(
    imgSrc ?? "/pepe_3_fliped.webp",
    "anonymous"
  );
  const shapeRef = React.useRef<any | null>();
  const trRef = React.useRef<any | null>();

  React.useEffect(() => {
    if (isSelected && trRef.current) {
      shapeRef.current.cache();
      // we need to attach transformer manually
      trRef.current.setNode(shapeRef.current);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  React.useLayoutEffect(() => {
    shapeRef.current.cache();
  }, [shapeProps, image, isSelected]);

  const transformEndHandler = (_e: any) => {
    // transformer is changing scale of the node
    // and NOT its width or height
    // but in the store we have only width and height
    // to match the data better we will reset scale on transform end
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // we will reset it back
    node.scaleX(1);
    node.scaleY(1);
    node.width(Math.max(5, node.width() * scaleX));
    node.height(Math.max(node.height() * scaleY));

    onChange({
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      // set minimal value
      width: node.width(),
      height: node.height(),
    });

  }

  const onDragEndHandler = (e: any) => {
    onChange({
      ...shapeProps,
      x: e.target.x(),
      y: e.target.y(),

    });

  };

  return (
    <React.Fragment>
      <Image
        image={image}
        onClick={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={onDragEndHandler}
        onTransformEnd={transformEndHandler}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

function downloadURI(uri: string, name: string) {
  var link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const MemeEditor: FC<{
  layers: Array<ILayer>,
  setLayers: React.Dispatch<React.SetStateAction<ILayer[]>>,
  image: HTMLImageElement;
  imageSize: { x: number; y: number; };
}> = ({ layers, image, setLayers, imageSize }) => {
  const [selectedId, selectShape] = React.useState<string | null>(null);
  const stageRef = React.useRef<null | any>(null);

  const handleExport = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    downloadURI(uri, 'stage.png');
  };

  return (
    <>
      <button onClick={handleExport}>Download</button>

      <Stage
        width={imageSize.x ?? 800}
        height={imageSize.y ?? 800}
        ref={stageRef}
        onMouseDown={(e) => {
          // deselect when clicked on empty area
          //const clickedOnEmpty = e.target === e.target.getStage();
          const clickedOnEmpty = e.target.index === 0;
          if (clickedOnEmpty) {
            selectShape(null);
          }
        }}
      >
        <Layer>
          {<Image image={image} />}
          {layers && layers.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                shapeProps={rect}
                imgSrc={rect.img}
                isSelected={rect.id === selectedId}
                onSelect={() => {
                  selectShape(rect.id);
                }}
                onChange={(newAttrs: ILayer) => {
                  const rects = layers.slice();
                  layers[i] = newAttrs;
                  setLayers(rects);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
    </>
  );
};

