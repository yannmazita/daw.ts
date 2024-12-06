// src/features/sequencer/components/Sequencer.tsx

import React from "react";
import SequencerVisualisation from "./SequencerVisualisation/SequencerVisualisation";
import SequencerTrackSettings from "./SequencerTrackSettings";
import LoopEditor from "./LoopEditor/LoopEditor";
import { PatternList } from "@/features/patterns/components/PatternList";

const Sequencer: React.FC = () => {
  return (
    <div id="sequencer-wrapper" className="flex flex-col max-w-[792px]">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <PatternList />
        <SequencerVisualisation />
      </div>
      <div className="grid grid-cols-3">
        <SequencerTrackSettings />
        <LoopEditor />
      </div>
    </div>
  );
};

export default Sequencer;
