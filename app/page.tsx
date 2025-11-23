import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-pink via-garden-white to-garden-mint">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4 text-garden-earth">
              🌸 Hangeul Garden
            </h1>
            <p className="text-2xl text-garden-earth/80 font-noto">
              한글 정원
            </p>
          </div>

          {/* Tagline */}
          <p className="text-xl mb-8 text-garden-earth/70">
            A beginner-friendly Korean language learning platform
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-nunito font-bold text-lg mb-2">Interactive Lessons</h3>
              <p className="text-sm text-garden-earth/70">
                Structured learning path from basics to conversation
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">📖</div>
              <h3 className="font-nunito font-bold text-lg mb-2">Smart Dictionary</h3>
              <p className="text-sm text-garden-earth/70">
                Auto-generated from lessons with instant translations
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-nunito font-bold text-lg mb-2">Practice & Quizzes</h3>
              <p className="text-sm text-garden-earth/70">
                Flashcards, matching games, and adaptive quizzes
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/lessons"
              className="bg-garden-pink hover:bg-garden-pink/80 text-garden-earth font-nunito font-bold px-8 py-3 rounded-xl transition-colors shadow-md"
            >
              Start Learning
            </Link>
            <Link
              href="/dictionary"
              className="bg-garden-lavender hover:bg-garden-lavender/80 text-garden-earth font-nunito font-bold px-8 py-3 rounded-xl transition-colors shadow-md"
            >
              Browse Dictionary
            </Link>
          </div>

          {/* Coming Soon Note */}
          <div className="mt-16 p-6 bg-garden-mint/30 rounded-xl">
            <p className="text-sm text-garden-earth/70">
              🌱 <strong>Currently in development</strong> - More features coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
