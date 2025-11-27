# Lesson Authoring Guide

Use this guide when adding or updating JSON lessons in `content/lessons/`. It’s meant for both humans and AI helpers.

## Structure & Formatting
- File name: `{group}.{index}.json` (e.g., `3.1.json`). Keep group_id matching the group prefix.
- Fields (all required): `id`, `group_id`, `version`, `title`, `objectives` (3–5 bullets), `context` (2–4 sentences of setup), `vocabulary` (array of objects), `sentences` (5ish sample lines), `explanation` (5–8 concise bullets).
- Vocabulary objects: `word`, `english`, `romanization`, `type`. Keep types consistent (`noun`, `verb`, `adjective`, `phrase`, `pronoun`, `counter`, `number`, etc.).
- Sentences: include `korean`, `english`, `romanization`. Aim for natural, polite-level Korean unless teaching casual.
- Explanations: short, high-signal bullets that answer “why” or “when to use” and clarify pitfalls/alternates.
- Use plain ASCII; keep indentation at 2 spaces. No trailing commas.

## Depth & Coverage
- Depth over breadth: every lesson should feel “immediately usable” with concrete phrases, not just vocab lists.
- Context should explain when/why the learner needs this lesson and what social tone to use.
- Vocabulary: prioritize high-frequency, reusable items. Add small context notes via `english` or `type` when needed.
- Sentences: show combinations of the vocab in realistic mini-dialog lines; include at least one line that chains two ideas.
- Explanations: highlight usage rules, form changes (e.g., conjugation, particles), and common mistakes; include 1–2 practical tips.

## ID & Ordering
- `id` is a string matching the file name (e.g., `"4.2"`). The integer part aligns with `group_id`.
- Keep numbering contiguous within a group. If inserting mid-sequence, use the next decimal index (e.g., `2.4`).

## Style Notes
- Favor polite speech (`-요`) unless explicitly teaching casual.
- Romanization: use a consistent, simple scheme (e.g., `gamsahamnida`, `annyeonghaseyo`). No special characters.
- Keep explanations in natural English. Avoid jargon unless defined in-line.
- When introducing grammar (-어요/아요, -(으)ㄹ 거예요, particles), include a succinct pattern description plus 1 example.

## Quality Checklist
- Does every vocabulary item appear in a sentence or explanation? If not, cut or swap it.
- Are there 5–8 explanation bullets with actionable tips? If fewer, add depth.
- Are context and objectives clear about the learner outcome?
- JSON validates (run `python3 -m json.tool file.json` or the provided combine/split scripts).

## Helper Scripts
- Combine all lessons into one JSON: `node scripts/combine-lessons.js` (outputs `content/all-lessons.json`).
- Split a mega JSON back into individual files: `node scripts/split-lessons.js [inputPath] [outputDir]`
  - Defaults: input `content/all-lessons.json`, output `_lessons/` (ignored by git).
  - `_lessons/` is for local staging; copy reviewed files into `content/lessons/` when ready.
