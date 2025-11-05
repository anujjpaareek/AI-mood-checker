import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

interface MoodEntry {
  id: string;
  mood: string;
  note: string;
  created_at: string;
}

interface MoodCardProps {
  entry: MoodEntry;
  onDelete: (id: string) => void;
}

const moodEmojis: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  sad: "😢",
  angry: "😡",
  tired: "😴",
  anxious: "😰",
  excited: "🥳",
  neutral: "😐",
};

const MoodCard = ({ entry, onDelete }: MoodCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-4xl">{moodEmojis[entry.mood] || "😐"}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {entry.mood}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a")}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-sm text-foreground leading-relaxed">
                    {entry.note}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MoodCard;
