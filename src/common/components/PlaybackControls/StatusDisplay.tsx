// src/common/components/PlaybackControls/StatusDisplay.tsx

import React from "react";
import { SequenceStatus } from "@/core/enums/sequenceStatus";

interface StatusDisplayProps {
  status: SequenceStatus;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  return (
    <div className="ml-4 text-sm font-medium text-gray-600">
      Status: {SequenceStatus[status]}
    </div>
  );
};

export default React.memo(StatusDisplay);
