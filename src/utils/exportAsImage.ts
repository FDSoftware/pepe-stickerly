import html2canvas from "html2canvas";

export const exportAsImage = async (
  element: HTMLDivElement,
  imageFileName: string
) => {
  await html2canvas(
    document.querySelector("#canvasCapture") as unknown as HTMLElement,
    { backgroundColor: null }
  ).then((canvas) => {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = imageFileName;
    link.href = dataUrl;
    link.click();
  });
};
