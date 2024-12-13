// src/features/session/components/SessionGrid/SceneList/SceneList.tsx
import { Scene } from "@/core/interfaces/session";
import { SceneRow } from "./SceneRow";

interface SceneListProps {
  scenes: Scene[];
}

export const SceneList: React.FC<SceneListProps> = ({ scenes }) => {
  return (
    <div className="flex flex-col">
      {scenes.map((scene) => (
        <SceneRow key={scene.id} scene={scene} />
      ))}
    </div>
  );
};
