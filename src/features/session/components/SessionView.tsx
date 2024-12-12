// src/features/session/components/SessionView.tsx

import { useStore } from "@/common/slices/useStore";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/common/shadcn/lib/utils";
import { ScrollArea } from "@/common/shadcn/ui/scroll-area";
import { ClipState } from "@/core/types/common";

interface SessionViewProps {
  className?: string;
}

export const SessionView: React.FC<SessionViewProps> = ({ className }) => {
  // Refs for scroll sync
  const tracksScrollRef = useRef<HTMLDivElement>(null);
  const scenesScrollRef = useRef<HTMLDivElement>(null);

  // Store state
  const {
    sessionTracks: tracks,
    scenes,
    selectedClipIds,
    focusedTrackId,
    focusedClipId,
    createTrack,
    createScene,
    launchClip,
    stopClip,
    selectClip,
    clearSelection,
    setFocusedTrack,
    setFocusedClip,
    launchScene,
  } = useStore();

  // Handle horizontal scroll sync
  const handleTracksScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (scenesScrollRef.current) {
      scenesScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  // Handle vertical scroll sync
  const handleScenesScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (tracksScrollRef.current) {
      tracksScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSelection();
      setFocusedClip(undefined);
      setFocusedTrack(undefined);
    };
  }, [clearSelection, setFocusedClip, setFocusedTrack]);

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-4",
        className,
      )}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => createTrack(`Track ${tracks.length + 1}`)}
            className="rounded-md bg-primary px-2 py-1 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Add Track
          </button>
          <button
            onClick={() => createScene(`Scene ${scenes.length + 1}`)}
            className="rounded-md bg-primary px-2 py-1 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Add Scene
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="relative flex flex-1 gap-2 overflow-hidden">
        {/* Track Headers */}
        <div className="w-48 flex-none">
          <div className="h-8" /> {/* Spacer for scene header alignment */}
          <ScrollArea className="h-[calc(100%-2rem)]">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={cn(
                  "h-24 border-b border-border p-2",
                  track.id === focusedTrackId && "bg-accent",
                )}
                onClick={() => setFocusedTrack(track.id)}
              >
                {/* TrackHeader component will go here */}
                <div className="font-medium">{track.name}</div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Clips Grid */}
        <div className="flex-1 overflow-hidden">
          {/* Scene Headers */}
          <ScrollArea
            ref={scenesScrollRef}
            orientation="horizontal"
            className="h-8"
            onScroll={handleScenesScroll}
          >
            <div className="flex">
              {scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className="flex-none border-r border-border px-2 py-1"
                  style={{ width: "8rem" }}
                  onClick={() => launchScene(index)}
                >
                  {/* SceneHeader component will go here */}
                  <div className="text-sm font-medium">{scene.name}</div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Clips */}
          <ScrollArea
            ref={tracksScrollRef}
            className="h-[calc(100%-2rem)]"
            onScroll={handleTracksScroll}
          >
            <div className="flex flex-col">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex h-24 border-b border-border"
                >
                  {track.clipSlots.map((clip, slotIndex) => (
                    <div
                      key={clip.id}
                      className={cn(
                        "flex-none border-r border-border p-2",
                        clip.id === focusedClipId && "bg-accent",
                        selectedClipIds.has(clip.id) && "ring-1 ring-primary",
                        {
                          "bg-primary/10": clip.state === ClipState.PLAYING,
                          "bg-secondary/50": clip.state === ClipState.QUEUED,
                        },
                      )}
                      style={{ width: "8rem" }}
                      onClick={(e) => {
                        setFocusedClip(clip.id);
                        selectClip(clip.id, e.shiftKey);
                      }}
                      onDoubleClick={() => {
                        if (clip.state === ClipState.PLAYING) {
                          stopClip(track.id, slotIndex);
                        } else {
                          launchClip(track.id, slotIndex);
                        }
                      }}
                    >
                      {/* ClipSlot component will go here */}
                      {clip.patternId && (
                        <div className="text-sm">{clip.name}</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
