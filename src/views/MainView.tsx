// src/views/MainView.tsx

import React from "react";
import Sequencer from "@/features/sequencer/components/Sequencer";
import Mixer from "@/features/mixer/components/Mixer";

const MainView: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Sequencer />
      <Mixer />
    </div>
  );
};

export default MainView;
