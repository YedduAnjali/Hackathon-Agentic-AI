import { motion } from 'framer-motion';

// Page transition wrapper
export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Staggered container for lists
export const StaggerContainer = ({ children, staggerDelay = 0.05 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// Staggered item for lists
export const StaggerItem = ({ children }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      }}
    >
      {children}
    </motion.div>
  );
};

// Card hover elevation
export const HoverCard = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Smooth progress bar animation
export const AnimatedProgressBar = ({ progress = 0, duration = 0.6 }) => {
  return (
    <motion.div
      className="h-2 rounded-full bg-gradient-primary"
      initial={{ width: '0%' }}
      animate={{ width: `${progress}%` }}
      transition={{ duration, ease: 'easeOut' }}
    />
  );
};

// Scale and fade in for modals/important elements
export const ScaleIn = ({ children }) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Checkbox tick animation
export const CheckboxTick = ({ isChecked }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: isChecked ? 1 : 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      ✓
    </motion.div>
  );
};

// Expandable accordion item
export const ExpandableSection = ({ isOpen, children, duration = 0.3 }) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration, ease: 'easeInOut' }}
      overflow="hidden"
    >
      {children}
    </motion.div>
  );
};

// Smooth number counter animation (for stats)
export const AnimatedCounter = ({ from = 0, to = 100, duration = 0.6 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration }}
    >
      {to}
    </motion.div>
  );
};

// Fade in with delay
export const FadeInDelay = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation for loading/attention
export const PulseAnimation = ({ children }) => {
  return (
    <motion.div
      animate={{ opacity: [1, 0.7, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
};
