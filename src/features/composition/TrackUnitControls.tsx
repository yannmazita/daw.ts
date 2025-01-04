// src/features/mix/components/MixerControls/TrackUnitControls.tsx

export const TrackUnitControls: React.FC = () => {
  return (
    <div className="grid grid-rows-4">
      <div className="row-span-1 flex w-full flex-col items-center pt-4">
        <Input
          type="number"
          value={localVolume}
          onChange={handleVolumeChange}
          className="input-no-wheel h-5 w-14 rounded-none bg-background px-0 py-1 text-center"
          step={0.01}
          min={0}
        />
      </div>
      <div className="k-full row-span-2 flex flex-col items-center gap-y-2">
        <Knob
          value={pan}
          onChange={handleKnobChange}
          radius={15}
          min={-1}
          max={1}
          step={0.01}
        />
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "size-7 rounded-none py-1",
            muted ? "bg-muted-foreground dark:text-background" : "",
          )}
          onClick={toggleMute}
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-5 w-7 rounded-none py-1",
            soloed ? "bg-muted-foreground dark:text-background" : "",
          )}
          onClick={toggleSolo}
        >
          S
        </Button>
        <Button
          variant="outline"
          className={cn("h-5 w-7 rounded-none py-1", armed ? "bg-accent" : "")}
          size="icon"
          onClick={toggleArmed}
        >
          <CassetteTape />
        </Button>
      </div>
    </div>
  );
};
