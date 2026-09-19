// Central In-Memory Database Service for GabAi
// Syncs data between Dashboard, Tasks, Calendar, Expenses, and the Virtual Assistant.

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: 'Academic' | 'Personal' | 'Projects' | 'Exams' | 'Activities';
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Hard' | 'Medium' | 'Easy';
  duration: number; // in hours
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM
  completed: boolean;
  hasReminder: boolean;
  repeat: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  isPinned: boolean;
  isFavorite: boolean;
  attachments: number;
  subTasks: SubTask[];
  createdAt: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // "Today", "Yesterday", or "YYYY-MM-DD"
  type: 'income' | 'expense';
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'School' | 'Personal' | 'Projects' | 'Review' | 'Ideas' | 'Study Note' | string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
  colorAccent?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  category: 'Assignment' | 'Exam' | 'Class' | 'Meeting' | 'Personal';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  priority: 'High' | 'Medium' | 'Low';
  isAllDay: boolean;
  hasReminder: boolean;
  reminderTime: string;
  isRecurring: boolean;
  recurrenceRule: string; // "Daily" | "Weekly" | ""
  progress: number; // 0 - 100
  checklist: ChecklistItem[];
  description?: string;
  isAIScheduled?: boolean;
}

// Initial Mock Data mirroring screens
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Submit Capstone Draft (Part 2)',
    description: 'Revise methodology & conceptual framework based on panel guidelines.',
    subject: 'Capstone Paper',
    category: 'Academic',
    priority: 'High',
    difficulty: 'Hard',
    duration: 3.5,
    dueDate: '2026-07-26', // Today
    dueTime: '23:59',
    completed: false,
    hasReminder: true,
    repeat: 'None',
    isPinned: true,
    isFavorite: true,
    attachments: 2,
    subTasks: [
      { id: '1-1', title: 'Revise Methodology', completed: false },
      { id: '1-2', title: 'Finalize Abstract', completed: false },
    ],
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: '2',
    title: 'Review Chapter 5-7 Economics',
    description: 'Supply chain management and taxation formulas practice.',
    subject: 'Economics with Taxation',
    category: 'Exams',
    priority: 'High',
    difficulty: 'Hard',
    duration: 2.0,
    dueDate: '2026-07-28', // In 2 days
    dueTime: '13:00',
    completed: false,
    hasReminder: false,
    repeat: 'None',
    isPinned: false,
    isFavorite: false,
    attachments: 0,
    subTasks: [],
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: '3',
    title: 'Pitch Deck Slides Refinement',
    description: 'Add market sizes and detailed financial plans.',
    subject: 'Technopreneurship',
    category: 'Projects',
    priority: 'Medium',
    difficulty: 'Medium',
    duration: 1.5,
    dueDate: '2026-07-27', // Tomorrow
    dueTime: '17:00',
    completed: false,
    hasReminder: true,
    repeat: 'None',
    isPinned: true,
    isFavorite: false,
    attachments: 1,
    subTasks: [
      { id: '3-1', title: 'Market Size Chart', completed: true },
      { id: '3-2', title: 'Financials Review', completed: false },
    ],
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: '4',
    title: 'Daily Leg Workout Routine',
    description: 'Squats, deadlifts, and calves exercises.',
    subject: 'General',
    category: 'Personal',
    priority: 'Low',
    difficulty: 'Easy',
    duration: 1.0,
    dueDate: '2026-07-26', // Today
    dueTime: '18:00',
    completed: false,
    hasReminder: false,
    repeat: 'Daily',
    isPinned: false,
    isFavorite: true,
    attachments: 0,
    subTasks: [],
    createdAt: Date.now(),
  },
  {
    id: '5',
    title: 'Utilitarianism Essay Review',
    description: 'Review notes on moral philosophy chapters.',
    subject: 'Ethics',
    category: 'Activities',
    priority: 'Low',
    difficulty: 'Easy',
    duration: 1.2,
    dueDate: '2026-07-25', // Yesterday (Overdue)
    dueTime: '23:59',
    completed: false,
    hasReminder: false,
    repeat: 'None',
    isPinned: false,
    isFavorite: false,
    attachments: 0,
    subTasks: [],
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    id: '6',
    title: 'Database Schema Normalization',
    description: 'Draw 3NF mapping schema.',
    subject: 'Capstone Paper',
    category: 'Projects',
    priority: 'Medium',
    difficulty: 'Medium',
    duration: 2.5,
    dueDate: '2026-07-20',
    dueTime: '10:00',
    completed: true,
    hasReminder: false,
    repeat: 'None',
    isPinned: false,
    isFavorite: false,
    attachments: 1,
    subTasks: [],
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Weekly Allowance', amount: 1500.0, category: 'Allowance', date: 'Today', type: 'income' },
  { id: '2', title: 'Lunch at Canteen', amount: 120.0, category: 'Food', date: 'Today', type: 'expense' },
  { id: '3', title: 'Bus Fare to School', amount: 35.0, category: 'Transport', date: 'Today', type: 'expense' },
  { id: '4', title: 'Part-time Tutoring Job', amount: 800.0, category: 'Job', date: 'Yesterday', type: 'income' },
  { id: '5', title: 'Notebooks & Pens', amount: 150.0, category: 'Academics', date: 'Yesterday', type: 'expense' },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Algorithms Final Exam',
    category: 'Exam',
    date: '2026-07-26', // Today
    time: '09:00',
    duration: 180,
    priority: 'High',
    isAllDay: false,
    hasReminder: true,
    reminderTime: '30 minutes before',
    isRecurring: false,
    recurrenceRule: '',
    progress: 0,
    checklist: [
      { id: '1-1', text: 'Review Dynamic Programming', completed: false },
      { id: '1-2', text: 'Solve Graph traversal problems', completed: false },
      { id: '1-3', text: 'Read lecture notes on Greedy algorithms', completed: false },
    ],
    description: 'Final exam worth 40% of the grade. Topics: DP, Graphs, Network flow.',
  },
  {
    id: '2',
    title: 'Database Schema Design',
    category: 'Assignment',
    date: '2026-07-28',
    time: '23:59',
    duration: 60,
    priority: 'High',
    isAllDay: true,
    hasReminder: true,
    reminderTime: '1 day before',
    isRecurring: false,
    recurrenceRule: '',
    progress: 33,
    checklist: [
      { id: '2-1', text: 'E-R Diagram design', completed: true },
      { id: '2-2', text: 'Write SQL query DDL script', completed: false },
      { id: '2-3', text: 'Perform 3NF Normalization schemas', completed: false },
    ],
    description: 'Design and normalize a database schema for an online bookstore application.',
  },
  {
    id: '3',
    title: 'AI & Machine Learning Seminar',
    category: 'Class',
    date: '2026-07-26', // Today
    time: '14:00',
    duration: 90,
    priority: 'Medium',
    isAllDay: false,
    hasReminder: false,
    reminderTime: '',
    isRecurring: true,
    recurrenceRule: 'Weekly',
    progress: 100,
    checklist: [],
    description: 'Weekly guest seminar on cutting-edge neural architectures and transformers.',
  },
  {
    id: '4',
    title: 'Capstone Project Sync Meeting',
    category: 'Meeting',
    date: '2026-07-26', // Today
    time: '16:00',
    duration: 60,
    priority: 'Medium',
    isAllDay: false,
    hasReminder: true,
    reminderTime: '15 minutes before',
    isRecurring: false,
    recurrenceRule: '',
    progress: 0,
    checklist: [
      { id: '4-1', text: 'Draft backend schema specs', completed: false },
      { id: '4-2', text: 'Coordinate frontend layouts with PM', completed: false },
    ],
    description: 'Check-in on backend integrations and sync on upcoming milestone presentation.',
  },
  {
    id: '5',
    title: 'Personal Gym Workout',
    category: 'Personal',
    date: '2026-07-25', // Yesterday
    time: '18:00',
    duration: 90,
    priority: 'Low',
    isAllDay: false,
    hasReminder: false,
    reminderTime: '',
    isRecurring: true,
    recurrenceRule: 'Daily',
    progress: 0,
    checklist: [],
    description: 'Leg day workout routine focusing on squats and deadlifts.',
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Capstone Architecture & Core Tech Stack',
    content: `# Capstone System Architecture

## 1. Overview
The GabAI system is built as an offline-first student productivity suite designed for seamless multi-device continuity and intelligent schedule tracking.

## 2. Core Modules
- **Dynamic Task Engine**: Priority-weighted scheduling with pomodoro focus integration
- **Smart Calendar**: Academic sync with automated conflict detection
- **Note-Taking Workspace**: Structured markdown editor with direct task/calendar converters
- **Expense Tracker**: Student budget tracking with category analytics

## 3. Technology Stack
\`\`\`typescript
Frontend: React Native + Expo Router v54 + Reanimated
State Layer: Central Reactive In-Memory Cache
Styling: GabAI Modern Design System (#A97C50)
\`\`\`

## 4. Next Milestones
- [x] Finalize database schema
- [ ] Connect offline sync engine
- [ ] Test mobile presentation deck`,
    category: 'Projects',
    tags: ['#thesis', '#architecture', '#expo', '#react-native'],
    isFavorite: true,
    isPinned: true,
    isArchived: false,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 35 * 60 * 1000,
    colorAccent: '#A97C50',
  },
  {
    id: 'note-2',
    title: 'Economics with Taxation - Key Formulas & Principles',
    content: `# Economics & Taxation Study Sheet

> "Taxation is the inherent power of the sovereign exercised through the legislature."

### 1. Inelastic vs Elastic Demand Formulas
- **Price Elasticity of Demand (PED)**: 
  \`PED = (% Change in Qty Demanded) / (% Change in Price)\`
- If \`|PED| > 1\` => Elastic
- If \`|PED| < 1\` => Inelastic

### 2. Value Added Tax (VAT) Calculation
- **Output Tax** = Gross Sales * 12%
- **Input Tax** = Purchase Cost * 12%
- **VAT Payable** = Output Tax - Input Tax

### 3. Exam Reminders:
- Don't forget exemptions under Section 109 of the NIRC.
- Prepare calculator for bracket rate computations.`,
    category: 'Review',
    tags: ['#exam', '#formulas', '#economics', '#midterms'],
    isFavorite: false,
    isPinned: true,
    isArchived: false,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
    colorAccent: '#F59E0B',
  },
  {
    id: 'note-3',
    title: 'Database Normalization Cheatsheet (1NF to BCNF)',
    content: `# Database Normalization Guide

### First Normal Form (1NF)
- Eliminate repeating groups in individual tables.
- Create a separate table for each set of related data.
- Identify each set of related data with a primary key.

### Second Normal Form (2NF)
- Must already be in 1NF.
- Remove partial functional dependencies (attributes must depend on the whole composite PK).

### Third Normal Form (3NF)
- Must already be in 2NF.
- Remove transitive dependencies (non-key attributes must NOT depend on other non-key attributes).

### Boyce-Codd Normal Form (BCNF)
- A stricter version of 3NF where every determinant must be a candidate key.`,
    category: 'Study Note',
    tags: ['#cs301', '#databases', '#sql', '#normalization'],
    isFavorite: true,
    isPinned: false,
    isArchived: false,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    colorAccent: '#10B981',
  },
  {
    id: 'note-4',
    title: 'Technopreneurship Pitch Deck Outline',
    content: `# Technopreneurship 10-Slide Pitch Structure

1. **Problem Statement**: Students struggle with fragmented apps (notes, tasks, calendar, budget).
2. **Solution**: GabAI - The Unified AI-Powered Student Productivity Suite.
3. **Market Opportunity**: 3.5M Higher Education students in the region.
4. **Value Proposition**: Offline-first, distraction-free, intelligent task conversion.
5. **Business Model**: Freemium model + Campus Enterprise Tier.
6. **Go-to-Market Strategy**: Student Ambassador programs & university partnerships.`,
    category: 'School',
    tags: ['#startup', '#pitch', '#slides', '#business'],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    colorAccent: '#6366F1',
  },
  {
    id: 'note-5',
    title: 'Brainstorm: Mobile Offline-Sync Architecture Ideas',
    content: `# Offline-Sync Design Explorations

### Concept:
Use client-side operational timestamps + CRDT-inspired lightweight merge resolution.

- Cache all edits immediately in memory / local device store.
- Assign monotonic UUIDs and version counters to each note block.
- On reconnection, diff modified timestamps and apply 3-way merge.

### Things to test:
- Conflict handling when edited offline on both phone and laptop.
- Attachment serialization limits.`,
    category: 'Ideas',
    tags: ['#ideas', '#sync', '#architecture', '#offline-first'],
    isFavorite: true,
    isPinned: false,
    isArchived: false,
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    colorAccent: '#EC4899',
  },
  {
    id: 'note-6',
    title: 'Weekly Study Routine & Productivity Goals',
    content: `# Term 1 Habit Tracker & Routine

- **Morning Focus Block**: 8:00 AM - 10:00 AM (Algorithm drills)
- **Class Schedules**: 1:00 PM - 5:00 PM
- **Evening Review & Notes Polish**: 7:30 PM - 9:00 PM
- **Cap on Social Media**: Max 45 mins/day
- **Exercise**: Leg workout Tuesdays & Thursdays`,
    category: 'Personal',
    tags: ['#routine', '#habits', '#goals', '#health'],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    colorAccent: '#14B8A6',
  },
];

class LocalDatabase {
  private tasks: Task[] = [...INITIAL_TASKS];
  private transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
  private events: CalendarEvent[] = [...INITIAL_EVENTS];
  private notes: Note[] = [...INITIAL_NOTES];
  private listeners: (() => void)[] = [];

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in subscriber:', err);
      }
    });
  }

  // Tasks API
  getTasks(): Task[] {
    return this.tasks;
  }

  setTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.notify();
  }

  addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    this.tasks = [newTask, ...this.tasks];
    this.notify();
    return newTask;
  }

  updateTask(taskId: string, updates: Partial<Task>) {
    this.tasks = this.tasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    this.notify();
  }

  toggleTaskCompleted(taskId: string) {
    this.tasks = this.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    this.notify();
  }

  // Transactions API
  getTransactions(): Transaction[] {
    return this.transactions;
  }

  setTransactions(transactions: Transaction[]) {
    this.transactions = transactions;
    this.notify();
  }

  addTransaction(tx: Omit<Transaction, 'id'>): Transaction {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
    };
    this.transactions = [newTx, ...this.transactions];
    this.notify();
    return newTx;
  }

  // Calendar Events API
  getEvents(): CalendarEvent[] {
    return this.events;
  }

  setEvents(events: CalendarEvent[]) {
    this.events = events;
    this.notify();
  }

  addEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
    };
    this.events = [newEvent, ...this.events];
    this.notify();
    return newEvent;
  }

  // Notes API
  getNotes(): Note[] {
    return this.notes;
  }

  setNotes(notes: Note[]) {
    this.notes = notes;
    this.notify();
  }

  addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const now = Date.now();
    const newNote: Note = {
      ...note,
      id: 'note-' + now.toString(),
      createdAt: now,
      updatedAt: now,
    };
    this.notes = [newNote, ...this.notes];
    this.notify();
    return newNote;
  }

  updateNote(noteId: string, updates: Partial<Note>): Note | undefined {
    let updatedNote: Note | undefined;
    this.notes = this.notes.map((note) => {
      if (note.id === noteId) {
        updatedNote = {
          ...note,
          ...updates,
          updatedAt: Date.now(),
        };
        return updatedNote;
      }
      return note;
    });
    this.notify();
    return updatedNote;
  }

  deleteNote(noteId: string): boolean {
    const initialLen = this.notes.length;
    this.notes = this.notes.filter((note) => note.id !== noteId);
    const deleted = this.notes.length < initialLen;
    if (deleted) {
      this.notify();
    }
    return deleted;
  }

  toggleNoteFavorite(noteId: string) {
    this.notes = this.notes.map((note) =>
      note.id === noteId ? { ...note, isFavorite: !note.isFavorite, updatedAt: Date.now() } : note
    );
    this.notify();
  }

  toggleNotePinned(noteId: string) {
    this.notes = this.notes.map((note) =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned, updatedAt: Date.now() } : note
    );
    this.notify();
  }

  toggleNoteArchived(noteId: string) {
    this.notes = this.notes.map((note) =>
      note.id === noteId ? { ...note, isArchived: !note.isArchived, updatedAt: Date.now() } : note
    );
    this.notify();
  }

  // GabAI Integration Helpers
  convertNoteToTask(noteId: string, customOptions?: Partial<Task>): Task | null {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return null;

    // Map category
    let taskCategory: Task['category'] = 'Academic';
    if (note.category === 'Personal') taskCategory = 'Personal';
    else if (note.category === 'Projects') taskCategory = 'Projects';
    else if (note.category === 'Review') taskCategory = 'Exams';
    else if (note.category === 'Ideas') taskCategory = 'Activities';

    // Format date string for today/tomorrow
    const d = new Date();
    const dueDateStr = d.toISOString().split('T')[0];

    const newTask = this.addTask({
      title: customOptions?.title || note.title,
      description: customOptions?.description || `Converted from Note "${note.title}":\n\n` + (note.content.length > 200 ? note.content.substring(0, 197) + '...' : note.content),
      subject: customOptions?.subject || (note.tags[0] ? note.tags[0].replace('#', '') : 'General'),
      category: customOptions?.category || taskCategory,
      priority: customOptions?.priority || (note.isPinned ? 'High' : 'Medium'),
      difficulty: customOptions?.difficulty || 'Medium',
      duration: customOptions?.duration || 1.5,
      dueDate: customOptions?.dueDate || dueDateStr,
      dueTime: customOptions?.dueTime || '18:00',
      completed: false,
      hasReminder: customOptions?.hasReminder !== undefined ? customOptions.hasReminder : true,
      repeat: customOptions?.repeat || 'None',
      isPinned: note.isPinned,
      isFavorite: note.isFavorite,
      attachments: 1,
      subTasks: [],
    });

    return newTask;
  }

  linkNoteToSchedule(noteId: string, eventData?: Partial<CalendarEvent>): CalendarEvent | null {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return null;

    const d = new Date();
    const dateStr = d.toISOString().split('T')[0];

    let eventCategory: CalendarEvent['category'] = 'Personal';
    if (note.category === 'School' || note.category === 'Study Note') eventCategory = 'Class';
    else if (note.category === 'Review') eventCategory = 'Exam';
    else if (note.category === 'Projects') eventCategory = 'Assignment';
    else if (note.category === 'Personal') eventCategory = 'Personal';

    const newEvent = this.addEvent({
      title: eventData?.title || `Study: ${note.title}`,
      category: eventData?.category || eventCategory,
      date: eventData?.date || dateStr,
      time: eventData?.time || '15:00',
      duration: eventData?.duration || 60,
      priority: eventData?.priority || (note.isPinned ? 'High' : 'Medium'),
      isAllDay: false,
      hasReminder: true,
      reminderTime: '15 minutes before',
      isRecurring: false,
      recurrenceRule: '',
      progress: 0,
      checklist: [],
      description: `Note reference: "${note.title}". ${note.content.substring(0, 150)}...`,
    });

    return newEvent;
  }
}

export const localDb = new LocalDatabase();
export default localDb;
