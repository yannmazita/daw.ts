import { Button } from "@/common/shadcn/ui/button";
import { FilesMap, FilesTree } from "../types/files";

interface TreeProps {
  root: string;
  files: FilesMap;
  filesTree: FilesTree;
  onFileClick: (content: string) => Promise<void>;
}

export const InstrumentsTree: React.FC<TreeProps> = ({
  root,
  files,
  filesTree,
  onFileClick,
}) => {
  const renderTree = (currentRoot: string, currentTree: FilesTree) => {
    return (
      <ul className="list-none pl-4">
        {Object.entries(currentTree).map(([key, subtree]) => {
          const filePath = `${currentRoot}/${key}`.replace(/^\//, "");

          if (Object.keys(subtree).length > 0) {
            return (
              <li key={filePath}>
                <details className="cursor-pointer">
                  <summary className="text-primary hover:underline">
                    {key}
                  </summary>
                  {renderTree(filePath, subtree)}
                </details>
              </li>
            );
          }

          return (
            <li key={filePath}>
              <Button
                className="h-5 w-fit rounded-none border-none py-1 hover:underline"
                variant="outline"
                size="icon"
                onClick={() => onFileClick(files[filePath])}
              >
                {key}
              </Button>
            </li>
          );
        })}
      </ul>
    );
  };

  return <div>{renderTree(root, filesTree)}</div>;
};
