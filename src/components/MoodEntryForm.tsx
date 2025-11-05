import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MoodEntry {
  id: string;
  mood: string;
  note: string;
  created_at: string;
}

interface MoodEntryFormProps {
  onEntryAdded: (entry: MoodEntry) => void;
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

const moodLabels: Record<string, string> = {
  happy: "Happy",
  calm: "Calm",
  sad: "Sad",
  angry: "Angry",
  tired: "Tired",
  anxious: "Anxious",
  excited: "Excited",
  neutral: "Neutral",
};

const MoodEntryForm = ({ onEntryAdded }: MoodEntryFormProps) => {
  const [note, setNote] = useState("");
  const [detectedMood, setDetectedMood] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Debounced mood detection
  useEffect(() => {
    if (note.trim().length < 10) {
      setDetectedMood("");
      return;
    }

    const timer = setTimeout(() => {
      detectMood(note);
    }, 1000);

    return () => clearTimeout(timer);
  }, [note]);

  const detectMood = async (text: string) => {
    if (text.trim().length < 10) return;

    setIsDetecting(true);

    try {
      const { data, error } = await supabase.functions.invoke("detect-mood", {
        body: { text },
      });

      if (error) throw error;

      if (data?.mood) {
        setDetectedMood(data.mood);
      }
    } catch (error: any) {
      console.error("Mood detection error:", error);
      if (error.message?.includes("429")) {
        toast({
          title: "Slow down",
          description: "Too many requests. Please wait a moment.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (note.trim().length < 10) {
      toast({
        title: "Write more",
        description: "Please write at least 10 characters to detect mood",
        variant: "destructive",
      });
      return;
    }

    if (!detectedMood) {
      toast({
        title: "Detecting mood...",
        description: "Please wait while AI analyzes your text",
      });
      await detectMood(note);
      return;
    }

    setLoading(true);

    try {
      const newEntry: MoodEntry = {
        id: crypto.randomUUID(),
        mood: detectedMood,
        note: note.trim(),
        created_at: new Date().toISOString(),
      };

      onEntryAdded(newEntry);

      toast({
        title: "Saved!",
        description: `Your mood has been recorded as ${moodLabels[detectedMood]}`,
      });

      setNote("");
      setDetectedMood("");
    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Error",
        description: "Failed to save mood entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border shadow-lg sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">
            What's on your mind?
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI-powered</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Mood Detection Display */}
          {(detectedMood || isDetecting) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-center space-x-3"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm text-foreground font-medium">
                    Analyzing your mood...
                  </span>
                </>
              ) : (
                <>
                  <span className="text-4xl">{moodEmojis[detectedMood]}</span>
                  <div>
                    <p className="text-sm text-foreground font-semibold">
                      Detected Mood
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {moodLabels[detectedMood]}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Express yourself freely...
            </label>
            <Textarea
              placeholder="Start typing your thoughts, feelings, or what happened today. AI will automatically detect your mood from what you write..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-background border-border min-h-[160px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {note.length < 10
                ? `Write at least ${10 - note.length} more characters`
                : "AI is analyzing your mood..."}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            disabled={loading || !detectedMood || note.trim().length < 10}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Save Entry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MoodEntryForm;
