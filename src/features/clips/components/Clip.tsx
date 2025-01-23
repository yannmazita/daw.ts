// src/features/composition/components/Clip.tsx
interface ClipProps {
  clipId: string;
}

export const Clip: React.FC<ClipProps> = ({ clipId }) => {
  return <div>Clip {clipId}</div>;
};
