"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DictionaryEntry } from "@/types/dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { SpeakerButton } from "@/components/SpeakerButton";

type TabType = "learned" | "all";
type SortType = "korean" | "english" | "lesson" | "type";

const ITEMS_PER_PAGE = 20;

export default function DictionaryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("learned");
  const [allEntries, setAllEntries] = useState<DictionaryEntry[]>([]);
  const [learnedEntries, setLearnedEntries] = useState<DictionaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DictionaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [lessonFilter, setLessonFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortType>("lesson");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);

  // Fetch lessons for the lesson filter
  useEffect(() => {
    fetchLessons();
  }, []);

  // Fetch dictionary entries based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      fetchAllWords();
    } else if (activeTab === "learned") {
      if (user) {
        fetchLearnedWords();
      } else {
        // User not signed in, clear learned entries and stop loading
        setLearnedEntries([]);
        setFilteredEntries([]);
        setLoading(false);
      }
    }
  }, [activeTab, user]);

  // Filter and sort entries when search, filter, or sort changes
  useEffect(() => {
    const currentEntries = activeTab === "learned" ? learnedEntries : allEntries;
    let filtered = currentEntries;

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

    // Apply lesson filter
    if (lessonFilter !== "all") {
      filtered = filtered.filter((entry: any) =>
        entry.lessons && entry.lessons.includes(lessonFilter)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "korean":
          return a.word.localeCompare(b.word, "ko");
        case "english":
          return a.english.localeCompare(b.english, "en");
        case "lesson":
          // Sort by first lesson ID if available
          const aLesson = (a as any).lessons?.[0] || "";
          const bLesson = (b as any).lessons?.[0] || "";
          return aLesson.localeCompare(bLesson);
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    setFilteredEntries(sorted);
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [searchTerm, typeFilter, lessonFilter, sortBy, allEntries, learnedEntries, activeTab]);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, title")
      .order("order_index", { ascending: true });

    if (!error && data) {
      setLessons(data);
    }
  };

  const fetchAllWords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dictionary")
      .select("*")
      .order("word", { ascending: true });

    if (error) {
      console.error("Error fetching dictionary:", error);
    } else {
      setAllEntries(data || []);
      setFilteredEntries(data || []);
    }
    setLoading(false);
  };

  const fetchLearnedWords = async () => {
    if (!user) {
      setLearnedEntries([]);
      setFilteredEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("learned_words")
      .select(`
        word_id,
        dictionary (*)
      `)
      .eq("user_id", user.id)
      .order("first_seen", { ascending: false });

    if (error) {
      console.error("Error fetching learned words:", error);
      setLearnedEntries([]);
    } else {
      // Extract dictionary entries from the joined data
      const entries = (data || [])
        .map((item: any) => item.dictionary)
        .filter((entry: any) => entry !== null);
      setLearnedEntries(entries);
      setFilteredEntries(entries);
    }
    setLoading(false);
  };

  const currentEntries = activeTab === "learned" ? learnedEntries : allEntries;
  const types = Array.from(new Set(currentEntries.map((e) => e.type))).sort();

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab("learned")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "learned"
                  ? "bg-garden-pink text-garden-earth shadow-md"
                  : "bg-white/50 text-garden-earth/60 hover:bg-white/80"
              }`}
            >
              Learned Words
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-garden-pink text-garden-earth shadow-md"
                  : "bg-white/50 text-garden-earth/60 hover:bg-white/80"
              }`}
            >
              All Words
            </button>
          </div>

          {/* Message for non-authenticated users */}
          {!user && activeTab === "learned" && (
            <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg max-w-2xl mx-auto">
              Please sign in to view your learned words
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-garden-earth">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search Kor/Eng"
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

                {/* Lesson Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-garden-earth">
                    Lesson
                  </label>
                  <select
                    value={lessonFilter}
                    onChange={(e) => setLessonFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-garden-earth/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-pink"
                  >
                    <option value="all">All Lessons</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        Lesson {lesson.id}: {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-garden-earth">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="w-full px-4 py-2 border border-garden-earth/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-pink"
                  >
                    <option value="korean">Korean (가-하)</option>
                    <option value="english">English (A-Z)</option>
                    <option value="lesson">Lesson Order</option>
                    <option value="type">Word Type</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-garden-earth/60">
                Showing {filteredEntries.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} words
                {filteredEntries.length !== currentEntries.length && ` (filtered from ${currentEntries.length} total)`}
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
              {currentEntries.length === 0
                ? activeTab === "learned"
                  ? "📚 No learned words yet"
                  : "📚 No words in dictionary yet"
                : "🔍 No words found matching your search"}
            </p>
            {currentEntries.length === 0 && activeTab === "learned" && (
              <p className="text-sm text-garden-earth/60">
                Complete lessons to add words to your learned vocabulary
              </p>
            )}
          </div>
        ) : (
          <>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {paginatedEntries.map((entry) => (
              <Card
                key={entry.id}
                className="hover:shadow-lg transition-all bg-white/80 backdrop-blur border-garden-earth/10 hover:border-garden-pink relative"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-3xl font-noto">
                          {entry.word}
                        </CardTitle>
                        <SpeakerButton text={entry.word} size="md" />
                      </div>
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

                {entry.examples && entry.examples.length > 0 ? (
                  <CardContent className="pb-8">
                    <div className="text-sm font-semibold mb-2 text-garden-earth">
                      Examples:
                    </div>
                    <div className="space-y-2">
                      {entry.examples.slice(0, 2).map((example: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 bg-garden-mint/10 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="font-noto text-garden-earth flex-1">
                              {example.korean}
                            </div>
                            <SpeakerButton text={example.korean} size="sm" />
                          </div>
                          <div className="text-garden-earth/70">
                            {example.english}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="pb-8"></CardContent>
                )}

                {/* Lesson numbers at bottom right */}
                {(entry as any).lessons && (entry as any).lessons.length > 0 && (
                  <div className="absolute bottom-2 right-2 text-xs text-garden-earth/50">
                    {(entry as any).lessons.slice(0, 3).join(', ')}
                    {(entry as any).lessons.length > 3 && ` +${(entry as any).lessons.length - 3}`}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="max-w-4xl mx-auto mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-garden-earth hover:bg-garden-pink"
                }`}
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  const showEllipsis =
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span key={page} className="px-2 py-2 text-garden-earth/50">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        currentPage === page
                          ? "bg-garden-pink text-garden-earth"
                          : "bg-white text-garden-earth hover:bg-garden-pink/50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-garden-earth hover:bg-garden-pink"
                }`}
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}
