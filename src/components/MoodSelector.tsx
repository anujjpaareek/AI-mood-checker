import { motion } from "framer-motion";

interface MoodSelectorProps {
  selectedMood: string;
  onSelect: (mood: string) => void;
}

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "😢", label: "Sad", value: "sad" },
  { emoji: "😡", label: "Angry", value: "angry" },
  { emoji: "😴", label: "Tired", value: "tired" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "🥳", label: "Excited", value: "excited" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
];

const MoodSelector = ({ selectedMood, onSelect }: MoodSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Select your mood
      </label>
      <div className="grid grid-cols-4 gap-3">
        {moods.map((mood) => (
          <motion.button
            key={mood.value}
            type="button"
            onClick={() => onSelect(mood.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              flex flex-col items-center justify-center p-4 rounded-xl
              transition-all duration-200 border-2
              ${
                selectedMood === mood.value
                  ? "bg-primary/20 border-primary shadow-lg"
                  : "bg-secondary border-border hover:border-primary/50"
              }
            `}
          >
            <span className="text-3xl mb-1">{mood.emoji}</span>
            <span className="text-xs text-foreground font-medium">
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
