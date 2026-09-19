import { NoteCategoryItem, NoteTemplateItem, NoteSortOption } from '../types';

export const CATEGORIES: NoteCategoryItem[] = [
  { name: 'All', icon: 'grid', color: '#A97C50' },
  { name: 'School', icon: 'book', color: '#6366F1' },
  { name: 'Study Note', icon: 'file-text', color: '#10B981' },
  { name: 'Review', icon: 'award', color: '#F59E0B' },
  { name: 'Projects', icon: 'code', color: '#A97C50' },
  { name: 'Ideas', icon: 'zap', color: '#EC4899' },
  { name: 'Personal', icon: 'user', color: '#14B8A6' },
];

export const TEMPLATES: NoteTemplateItem[] = [
  {
    id: 'lecture-notes',
    title: 'Lecture Notes',
    category: 'Study Note',
    description: 'Structured Cornell-style notes with core concepts, deep dives, and takeaways.',
    content: `# [Course Code]: [Lecture Topic]
**Date:** ${new Date().toLocaleDateString()} | **Professor:** [Name]

## Key Concepts
- Concept 1: [Brief explanation]
- Concept 2: [Brief explanation]

## Detailed Notes
1. [Important formula or theorem]
2. [Example covered in class]

## Questions / Clarifications
- [ ] Ask prof about [Topic] during office hours
- [ ] Review textbook page [XX-YY]

## Summary
[One or two sentence takeaway of today's lecture]`,
  },
  {
    id: 'exam-review',
    title: 'Exam Review',
    category: 'Review',
    description: 'High-yield topics, formula cheat sheets, common traps, and practice problem checklists.',
    content: `# [Subject] Midterm/Final Review

## High-Yield Topics
- [ ] Topic A (Definitions & Core Concepts)
- [ ] Topic B (Formulas & Step-by-Step Solves)
- [ ] Topic C (Case Studies / Examples)

## Important Formulas & Cheat Sheet
\`\`\`
Formula 1: ...
Formula 2: ...
\`\`\`

## Common Mistakes & Traps
> Warning: Pay close attention to unit conversions and sign rules!

## Practice Problem Checklist
- [ ] Problem Set 1
- [ ] Past Year Exam 2025`,
  },
  {
    id: 'project-roadmap',
    title: 'Project Roadmap',
    category: 'Projects',
    description: 'Milestones, team deliverables, sprint objectives, and spec checklists.',
    content: `# [Project Title] Roadmap

## Project Objective
[Brief description of project goal and deliverables]

## Team & Responsibilities
- **Lead / Backend:** [Name]
- **Frontend / UI:** [Name]
- **Documentation:** [Name]

## Phase 1: Planning & Specs
- [x] Initial brainstorm & requirements
- [ ] Architecture diagram finalized

## Phase 2: Implementation
- [ ] Milestone 1 Delivery
- [ ] Testing & Integration`,
  },
  {
    id: 'study-plan',
    title: 'Study Plan',
    category: 'School',
    description: 'Timed study blocks, active recall checklists, and review targets.',
    content: `# Study Session Plan (${new Date().toLocaleDateString()})

- [ ] Block 1 (45 mins): Review Chapter Notes
- [ ] Break (10 mins): Stretch & Hydrate
- [ ] Block 2 (45 mins): Practice Questions Set #3
- [ ] Block 3 (30 mins): Flashcards & Active Recall`,
  },
];

export const SORT_OPTIONS: { id: NoteSortOption; label: string; icon: string }[] = [
  { id: 'recent_edit', label: 'Last Modified', icon: 'clock' },
  { id: 'recent_create', label: 'Date Created', icon: 'calendar' },
  { id: 'title', label: 'Title (A-Z)', icon: 'type' },
  { id: 'category', label: 'Category', icon: 'folder' },
];
