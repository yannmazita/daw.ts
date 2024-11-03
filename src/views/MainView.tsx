// src/views/MainView.tsx

import React from 'react';
import Sequencer from '@/features/sequencer/components/Sequencer';

const MainView: React.FC = () => {
  return (
    <div className="flex justify-center">
      <Sequencer />
    </div>
  );
}

export default MainView;
