import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MoodEntryForm from "@/components/MoodEntryForm";
import MoodCard from "@/components/MoodCard";
import MoodChart from "@/components/MoodChart";

interface MoodEntry {
  id: string;
  mood: string;
  note: string;
  created_at: string;
}

const Dashboard = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    try {
      const stored = localStorage.getItem("moodEntries");
      if (stored) {
        setMoodEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading entries:", error);
      toast({
        title: "Error",
        description: "Failed to load mood entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEntries = (newEntries: MoodEntry[]) => {
    localStorage.setItem("moodEntries", JSON.stringify(newEntries));
    setMoodEntries(newEntries);
  };

  const handleEntryAdded = (newEntry: MoodEntry) => {
    const updatedEntries = [newEntry, ...moodEntries];
    saveEntries(updatedEntries);
    toast({
      title: "Success",
      description: "Mood entry added",
    });
  };

  const handleDelete = (id: string) => {
    const updatedEntries = moodEntries.filter((entry) => entry.id !== id);
    saveEntries(updatedEntries);
    toast({
      title: "Deleted",
      description: "Mood entry removed",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌙</span>
              <div>
                <h1 className="text-xl font-bold text-foreground">MyMood</h1>
                <p className="text-sm text-muted-foreground">
                  Track your daily moods
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Add Entry Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <MoodEntryForm onEntryAdded={handleEntryAdded} />
          </motion.div>

          {/* Right Column - Entries and Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Mood Chart */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  Mood Analytics
                </h2>
              </div>
              <MoodChart entries={moodEntries} />
            </div>

            {/* Recent Entries */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Recent Entries
              </h2>
              <div className="space-y-4">
                {moodEntries.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <p className="text-muted-foreground">
                      No mood entries yet. Start by adding your first entry!
                    </p>
                  </div>
                ) : (
                  moodEntries.map((entry) => (
                    <MoodCard
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
