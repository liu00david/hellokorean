"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DictionaryEntry } from "@/types/dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DictionaryPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DictionaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  // Fetch dictionary entries
  useEffect(() => {
    fetchDictionary();
  }, []);

  // Filter entries when search or filter changes
  useEffect(() => {
    let filtered = entries;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.romanization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((entry) => entry.type === typeFilter);
    }

    setFilteredEntries(filtered);
  }, [searchTerm, typeFilter, entries]);

  const fetchDictionary = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dictionary")
      .select("*")
      .order("word", { ascending: true });

    if (error) {
      console.error("Error fetching dictionary:", error);
    } else {
      setEntries(data || []);
      setFilteredEntries(data || []);
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage("");

    try {
      const response = await fetch("/api/sync-dictionary", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setSyncMessage(
          `✅ Synced! Added: ${result.wordsAdded}, Updated: ${result.wordsUpdated}`
        );
        // Refresh the dictionary
        await fetchDictionary();
      } else {
        setSyncMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setSyncMessage(`❌ Error: ${error}`);
    } finally {
      setSyncing(false);
    }
  };

  const types = Array.from(new Set(entries.map((e) => e.type))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-white via-garden-mint/10 to-garden-lavender/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-garden-earth">
            📖 Dictionary
          </h1>
          <p className="text-xl text-garden-earth/70 mb-6">
            Browse and search Korean vocabulary
          </p>

          {/* Sync Button */}
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="secondary"
              className="gap-2"
            >
              {syncing ? "Syncing..." : "🔄 Sync Dictionary from Lessons"}
            </Button>
            {syncMessage && (
              <p className="text-sm text-garden-earth/70">{syncMessage}</p>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-garden-earth">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search Korean, English, or romanization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-garden-earth/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-pink"
                  />
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-garden-earth">
                    Word Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-garden-earth/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-pink"
                  >
                    <option value="all">All Types</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-garden-earth/60">
                Showing {filteredEntries.length} of {entries.length} words
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dictionary Entries */}
        {loading ? (
          <div className="text-center text-garden-earth/70">
            Loading dictionary...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center p-12 bg-white/50 rounded-2xl">
            <p className="text-xl text-garden-earth/70 mb-4">
              {entries.length === 0
                ? "📚 No words in dictionary yet"
                : "🔍 No words found matching your search"}
            </p>
            {entries.length === 0 && (
              <p className="text-sm text-garden-earth/60">
                Click "Sync Dictionary from Lessons" to populate the dictionary
              </p>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="hover:shadow-lg transition-all bg-white/80 backdrop-blur border-garden-earth/10 hover:border-garden-pink"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2 font-noto">
                        {entry.word}
                      </CardTitle>
                      <div className="text-lg text-garden-earth/80 mb-1">
                        {entry.english}
                      </div>
                      <div className="text-sm text-garden-earth/60 font-mono">
                        {entry.romanization}
                      </div>
                    </div>
                    <span className="text-xs bg-garden-lavender/50 px-2 py-1 rounded-lg h-fit">
                      {entry.type}
                    </span>
                  </div>
                </CardHeader>

                {entry.examples && entry.examples.length > 0 && (
                  <CardContent>
                    <div className="text-sm font-semibold mb-2 text-garden-earth">
                      Examples:
                    </div>
                    <div className="space-y-2">
                      {entry.examples.slice(0, 2).map((example: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 bg-garden-mint/10 rounded-lg text-sm"
                        >
                          <div className="font-noto text-garden-earth">
                            {example.korean}
                          </div>
                          <div className="text-garden-earth/70">
                            {example.english}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
