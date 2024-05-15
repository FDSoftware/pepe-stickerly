import { MemeEditor } from "./MemeEditorV2";
import "./App.css";

function MainApp() {
  return (
    <div>
      <div className="flex flex-col justify-center items-center text-center">
        <h1 className=" freeman  py-4  animate-jump-in animate-duration-700 animate-ease-in-out">
          Hi anon, make your meme
        </h1>

        <MemeEditor />
      </div>
      <footer>
        Powered by
        <a href="https://www.github.com/fiammamuscari" target="_blank">
          &nbsp;Fiamy
        </a>
      </footer>
    </div>
  );
}
export default MainApp;
