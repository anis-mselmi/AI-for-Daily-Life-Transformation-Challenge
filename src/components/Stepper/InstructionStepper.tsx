import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './InstructionStepper.css';

interface Props {
  steps: string[];
  timers?: number[];
}

export const InstructionStepper = ({ steps, timers }: Props) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="stepper">
      <div className="stepper-progress">
        Step {current + 1} of {steps.length}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="step-content"
        >
          <p>{steps[current]}</p>
          {timers && timers[current] > 0 && (
            <div className="timer-badge">⏱ {timers[current]} min</div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="stepper-actions">
        <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>Back</button>
        <button disabled={current === steps.length - 1} onClick={() => setCurrent(c => c + 1)}>Next</button>
      </div>
    </div>
  );
};
