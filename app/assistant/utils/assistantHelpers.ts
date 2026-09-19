import * as Haptics from 'expo-haptics';
import { localDb } from '@/app/services/localDb';
import { Message, ActionButton, CustomWidgetType } from '../types';

export const formatTimerTime = (totalSecs: number): string => {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const generateMessageId = (): string => {
  return Date.now().toString() + Math.random().toString().slice(2, 6);
};

export const getCurrentTimestamp = (): string => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface ProcessQueryCallbacks {
  addMessage: (
    sender: 'user' | 'assistant',
    text: string,
    actions?: ActionButton[],
    customWidget?: CustomWidgetType,
    widgetData?: any
  ) => void;
  router: {
    replace: (path: any) => void;
  };
}

export const processAssistantQuery = async (
  queryText: string,
  callbacks: ProcessQueryCallbacks
): Promise<void> => {
  const { addMessage, router } = callbacks;
  const norm = queryText.toLowerCase().trim().replace(/[?.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

  // 1. Navigation triggers
  if (norm.includes('open calendar') || norm.includes('go to calendar') || norm.includes('navigate to schedule')) {
    addMessage('assistant', 'Opening your smart calendar for you right now.', [
      {
        label: 'Open Calendar Now',
        icon: 'calendar',
        action: () => {
          router.replace('/(tabs)/calendar/calendar');
        },
      },
    ]);
    return;
  }

  if (norm.includes('open tasks') || norm.includes('open task manager') || norm.includes('view tasks')) {
    addMessage('assistant', 'Navigating to your Task Manager page.', [
      {
        label: 'Open Tasks Now',
        icon: 'check-square',
        action: () => {
          router.replace('/(tabs)/tasks/task');
        },
      },
    ]);
    return;
  }

  if (norm.includes('open expenses') || norm.includes('open wallet') || norm.includes('view budget') || norm.includes('spend spendings')) {
    addMessage('assistant', 'Redirecting to your Expenses and Wallet Manager.', [
      {
        label: 'Open Wallet Now',
        icon: 'credit-card',
        action: () => {
          router.replace('/(tabs)/expenses/expenses');
        },
      },
    ]);
    return;
  }

  if (norm.includes('open profile') || norm.includes('open settings') || norm.includes('go to settings')) {
    addMessage('assistant', 'Redirecting to your Profile and Settings tab.', [
      {
        label: 'Open Profile Now',
        icon: 'user',
        action: () => {
          router.replace('/(tabs)/profile/profile');
        },
      },
    ]);
    return;
  }

  if (norm.includes('notes') || norm.includes('notepad') || norm.includes('open notes') || norm.includes('my notes') || norm.includes('study notes')) {
    const activeNotes = localDb.getNotes().filter((n) => !n.isArchived);
    let reply = `You currently have ${activeNotes.length} active notes in your Notes Workspace:\n\n`;
    activeNotes.slice(0, 4).forEach((n, i) => {
      const pinIcon = n.isPinned ? '📌 ' : '📝 ';
      reply += `${i + 1}. ${pinIcon}${n.title} [${n.category}]\n`;
    });
    if (activeNotes.length > 4) {
      reply += `...and ${activeNotes.length - 4} more notes.\n`;
    }
    addMessage('assistant', reply, [
      {
        label: 'Open Notes Workspace',
        icon: 'file-text',
        action: () => {
          router.replace('/(tabs)/notes/notes');
        },
      },
    ]);
    return;
  }

  // 2. Today's Tasks query
  if (
    norm.includes('tasks today') ||
    norm.includes('today tasks') ||
    norm.includes('what to focus on today') ||
    norm.includes('what should i focus on today') ||
    norm.includes('how many tasks do i have today') ||
    norm.includes('list today tasks') ||
    norm.includes('tasks for today')
  ) {
    const today = '2026-07-26';
    const todayTasks = localDb.getTasks().filter((t) => t.dueDate === today);

    if (todayTasks.length === 0) {
      addMessage('assistant', 'Great news! You have no tasks scheduled for today. You are fully caught up.', [
        { label: 'Add New Task', icon: 'plus', action: () => router.replace('/(tabs)/tasks/task') },
        { label: 'View All Tasks', icon: 'list', action: () => router.replace('/(tabs)/tasks/task') },
      ]);
    } else {
      const pendingCount = todayTasks.filter((t) => !t.completed).length;
      let responseText = `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} today (${pendingCount} pending, ${todayTasks.length - pendingCount} completed):\n\n`;

      todayTasks.forEach((t, i) => {
        const statusIcon = t.completed ? '✅' : '⏳';
        const priorityLabel = t.priority === 'High' ? '🔴 High' : t.priority === 'Medium' ? '🟡 Medium' : '🟢 Low';
        responseText += `${i + 1}. ${statusIcon} ${t.title} [${t.subject}]\n    • Priority: ${priorityLabel} | Due: ${t.dueTime}\n`;
      });

      const firstPending = todayTasks.find((t) => !t.completed);
      const actions: ActionButton[] = [
        { label: 'Manage in Tab', icon: 'check-square', action: () => router.replace('/(tabs)/tasks/task') },
      ];

      if (firstPending) {
        actions.unshift({
          label: `Complete "${firstPending.title.slice(0, 18)}..."`,
          icon: 'check',
          action: () => {
            localDb.toggleTaskCompleted(firstPending.id);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              // Ignored if haptics fail or on web
            }
            addMessage('assistant', `Nice! I've marked "${firstPending.title}" as complete. All dashboards and lists are updated!`);
          },
        });
      }

      addMessage('assistant', responseText, actions);
    }
    return;
  }

  // 3. Class schedule / schedule today
  if (
    norm.includes('next class') ||
    norm.includes('classes today') ||
    norm.includes('schedule today') ||
    norm.includes('today schedule') ||
    norm.includes('my schedule') ||
    norm.includes('class schedule') ||
    norm.includes('how many classes do i have today') ||
    norm.includes('show today schedule')
  ) {
    const today = '2026-07-26';
    const todayEvents = localDb.getEvents().filter((e) => e.date === today && (e.category === 'Class' || e.category === 'Exam' || e.category === 'Meeting'));

    if (todayEvents.length === 0) {
      addMessage('assistant', 'No classes or academic meetings scheduled for today, July 26, 2026. Enjoy your study break!', [
        { label: 'Open Calendar', icon: 'calendar', action: () => router.replace('/(tabs)/calendar/calendar') },
      ]);
    } else {
      const sorted = [...todayEvents].sort((a, b) => a.time.localeCompare(b.time));
      let responseText = `Here is your academic schedule for today:\n\n`;

      sorted.forEach((e) => {
        responseText += `• ⏰ ${e.time} (${e.duration} mins) - **${e.title}**\n    Category: ${e.category} | Priority: ${e.priority}\n`;
      });

      addMessage('assistant', responseText, [
        { label: 'View in Calendar', icon: 'calendar', action: () => router.replace('/(tabs)/calendar/calendar') },
      ]);
    }
    return;
  }

  // 4. Weekly Expenses query
  if (
    norm.includes('spend this week') ||
    norm.includes('weekly expenses') ||
    norm.includes('money spent') ||
    norm.includes('expense summary') ||
    norm.includes('expenses this week') ||
    norm.includes('my expenses')
  ) {
    const txs = localDb.getTransactions();
    const expenses = txs.filter((t) => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    const categoryMap: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    let responseText = `You spent a total of **₱${totalExpense.toFixed(2)}** this week.\n\nHere is your spending breakdown:\n`;
    Object.keys(categoryMap).forEach((cat) => {
      responseText += `• **${cat}**: ₱${categoryMap[cat].toFixed(2)}\n`;
    });

    const allowance = txs.filter((t) => t.category === 'Allowance').reduce((sum, item) => sum + item.amount, 0);
    responseText += `\nTotal Allowance: ₱${allowance.toFixed(2)}\nNet Wallet Standing: ₱${(allowance - totalExpense).toFixed(2)}`;

    addMessage('assistant', responseText, [
      { label: 'Open Wallet', icon: 'credit-card', action: () => router.replace('/(tabs)/expenses/expenses') },
    ]);
    return;
  }

  // 5. Monthly Expenses query
  if (
    norm.includes('spend this month') ||
    norm.includes('monthly expenses') ||
    norm.includes('expenses this month') ||
    norm.includes('spent this month')
  ) {
    const txs = localDb.getTransactions();
    const expenses = txs.filter((t) => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    let responseText = `Your calculated expenses for this month totals **₱${totalExpense.toFixed(2)}**.\n\nAll expenditures are saved locally in GabAi.`;

    addMessage('assistant', responseText, [
      { label: 'Open Expenses Tab', icon: 'dollar-sign', action: () => router.replace('/(tabs)/expenses/expenses') },
    ]);
    return;
  }

  // 6. Upcoming Deadlines
  if (
    norm.includes('upcoming deadlines') ||
    norm.includes('deadlines') ||
    norm.includes('show upcoming deadlines') ||
    norm.includes('deadlines upcoming')
  ) {
    const today = '2026-07-26';
    const tasks = localDb.getTasks();
    const incompleteDeadlines = tasks
      .filter((t) => !t.completed && t.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    if (incompleteDeadlines.length === 0) {
      addMessage('assistant', "No upcoming deadlines found! You're in the clear.", [
        { label: 'Add Task', icon: 'plus', action: () => router.replace('/(tabs)/tasks/task') },
      ]);
    } else {
      let responseText = `Here are your upcoming academic deadlines:\n\n`;

      incompleteDeadlines.forEach((t) => {
        const daysLeft = Math.round((new Date(t.dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        const urgency = daysLeft === 0 ? 'Due Today!' : daysLeft === 1 ? 'Due Tomorrow!' : `In ${daysLeft} days`;
        responseText += `• 🚨 **${t.title}** (${t.subject})\n    Due: ${t.dueDate} at ${t.dueTime} | *${urgency}*\n`;
      });

      addMessage('assistant', responseText, [
        { label: 'View Tasks', icon: 'check-square', action: () => router.replace('/(tabs)/tasks/task') },
      ]);
    }
    return;
  }

  // 7. Overdue Tasks
  if (
    norm.includes('overdue tasks') ||
    norm.includes('overdue assignments') ||
    norm.includes('late tasks') ||
    norm.includes('do i have overdue tasks')
  ) {
    const today = '2026-07-26';
    const overdueTasks = localDb.getTasks().filter((t) => !t.completed && t.dueDate < today);

    if (overdueTasks.length === 0) {
      addMessage('assistant', 'Excellent! You have zero overdue tasks. Keep up the high productivity!', [
        { label: 'Check Tasks', icon: 'check-square', action: () => router.replace('/(tabs)/tasks/task') },
      ]);
    } else {
      let responseText = `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. You should complete these as soon as possible:\n\n`;

      overdueTasks.forEach((t, i) => {
        responseText += `${i + 1}. ⚠️ **${t.title}** [${t.subject}]\n    Was due: ${t.dueDate} at ${t.dueTime} (Overdue)\n`;
      });

      addMessage('assistant', responseText, [
        {
          label: `Mark Complete: "${overdueTasks[0].title.slice(0, 16)}..."`,
          icon: 'check',
          action: () => {
            localDb.toggleTaskCompleted(overdueTasks[0].id);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            addMessage('assistant', `Marked "${overdueTasks[0].title}" as completed. Overdue count updated!`);
          },
        },
        { label: 'Open Task Screen', icon: 'arrow-right', action: () => router.replace('/(tabs)/tasks/task') },
      ]);
    }
    return;
  }

  // 8. Work on first / Focus today
  if (
    norm.includes('what should i work on first') ||
    norm.includes('work on first') ||
    norm.includes('first task') ||
    norm.includes('which task first') ||
    norm.includes('what is my most important task')
  ) {
    const pendingTasks = localDb.getTasks().filter((t) => !t.completed);

    const sorted = [...pendingTasks].sort((a, b) => {
      if (a.priority === 'High' && b.priority !== 'High') return -1;
      if (a.priority !== 'High' && b.priority === 'High') return 1;
      if (a.priority === 'Medium' && b.priority === 'Low') return -1;
      if (a.priority === 'Low' && b.priority === 'Medium') return 1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    if (sorted.length === 0) {
      addMessage('assistant', 'You have no pending tasks! There is nothing to work on. Celebrate your free time!', [
        { label: 'Go to Dashboard', icon: 'grid', action: () => router.replace('/(tabs)/dashboard/dashboard') },
      ]);
    } else {
      const topTask = sorted[0];
      let responseText = `You should focus on this task first:\n\n⭐️ **${topTask.title}** [${topTask.subject}]\n`;
      responseText += `Priority: **${topTask.priority}** | Difficulty: **${topTask.difficulty}**\nDue Date: ${topTask.dueDate} at ${topTask.dueTime}\n\n`;
      responseText += `Description: ${topTask.description || 'No description provided.'}`;

      addMessage('assistant', responseText, [
        {
          label: 'Start Focus Session',
          icon: 'target',
          action: () => {
            addMessage('assistant', `Starting a focused study session for: "${topTask.title}". Keep distractions away!`, [], 'focus', { topic: topTask.title });
          },
        },
        {
          label: 'Mark Complete',
          icon: 'check',
          action: () => {
            localDb.toggleTaskCompleted(topTask.id);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            addMessage('assistant', `Completed "${topTask.title}"! Excellent job.`);
          },
        },
      ]);
    }
    return;
  }

  // 9. Tomorrow's Schedule
  if (
    norm.includes('tomorrow schedule') ||
    norm.includes('tomorrows schedule') ||
    norm.includes('schedule tomorrow') ||
    norm.includes('what is tomorrow schedule') ||
    norm.includes('tomorrow')
  ) {
    const tomorrow = '2026-07-27';
    const tomorrowEvents = localDb.getEvents().filter((e) => e.date === tomorrow);
    const tomorrowTasks = localDb.getTasks().filter((t) => t.dueDate === tomorrow);

    if (tomorrowEvents.length === 0 && tomorrowTasks.length === 0) {
      addMessage('assistant', 'You have no classes, events, or deadlines tomorrow, July 27, 2026.', [
        { label: 'Open Calendar', icon: 'calendar', action: () => router.replace('/(tabs)/calendar/calendar') },
      ]);
    } else {
      let responseText = `Tomorrow, Monday, July 27:\n\n`;

      if (tomorrowEvents.length > 0) {
        responseText += `**Schedule Events:**\n`;
        tomorrowEvents.forEach((e) => {
          responseText += `• ⏰ ${e.time} - **${e.title}** (${e.category})\n`;
        });
        responseText += `\n`;
      }

      if (tomorrowTasks.length > 0) {
        responseText += `**Deadlines Due:**\n`;
        tomorrowTasks.forEach((t) => {
          responseText += `• 🚨 ${t.title} [${t.subject}] at ${t.dueTime}\n`;
        });
      }

      addMessage('assistant', responseText, [
        { label: 'View Calendar', icon: 'calendar', action: () => router.replace('/(tabs)/calendar/calendar') },
      ]);
    }
    return;
  }

  // 10. Subject with most assignments
  if (
    norm.includes('most assignments') ||
    norm.includes('subject assignments') ||
    norm.includes('most tasks') ||
    norm.includes('which subject has')
  ) {
    const pendingTasks = localDb.getTasks().filter((t) => !t.completed);

    if (pendingTasks.length === 0) {
      addMessage('assistant', "You don't have any pending assignments right now.");
      return;
    }

    const subjectCount: Record<string, number> = {};
    pendingTasks.forEach((t) => {
      const sub = t.subject || 'General';
      subjectCount[sub] = (subjectCount[sub] || 0) + 1;
    });

    let highestSub = '';
    let highestCount = 0;
    Object.keys(subjectCount).forEach((sub) => {
      if (subjectCount[sub] > highestCount) {
        highestCount = subjectCount[sub];
        highestSub = sub;
      }
    });

    addMessage(
      'assistant',
      `The subject with the most pending tasks is **${highestSub}** with **${highestCount} pending assignments**.\n\nI recommend working on this subject first to reduce your academic load.`,
      [
        { label: 'Filter Tasks', icon: 'check-square', action: () => router.replace('/(tabs)/tasks/task') },
      ]
    );
    return;
  }

  // 11. Start Focus Session
  if (
    norm.includes('focus session') ||
    norm.includes('start focus') ||
    norm.includes('stopwatch') ||
    norm.includes('study timer')
  ) {
    addMessage(
      'assistant',
      "Let's start a Focus Session. Tell me when you are finished studying.",
      [],
      'focus',
      { topic: 'General Study Focus' }
    );
    return;
  }

  // 12. Productivity stats
  if (
    norm.includes('productivity') ||
    norm.includes('statistics') ||
    norm.includes('productivity stats') ||
    norm.includes('analytics')
  ) {
    const tasks = localDb.getTasks();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const highPriorityPending = tasks.filter((t) => t.priority === 'High' && !t.completed).length;
    const overdue = tasks.filter((t) => !t.completed && t.dueDate < '2026-07-26').length;

    const text = `Here is your current Academic Productivity report:\n\n` +
      `📈 **Task Completion Rate**: ${rate}% (${completed}/${total} tasks done)\n` +
      `🚨 **Urgent High Priority Tasks**: ${highPriorityPending} pending\n` +
      `⚠️ **Overdue Tasks**: ${overdue} late\n\n` +
      `Academic pressure status is currently: **High Pressure**. Keep pushing forward!`;

    addMessage('assistant', text, [
      { label: 'View Tasks Overview', icon: 'check-square', action: () => router.replace('/(tabs)/tasks/task') },
    ]);
    return;
  }

  // 13. Notes / notepad query
  if (norm.includes('open notes') || norm.includes('notepad') || norm.includes('write note')) {
    addMessage('assistant', 'Opening your personal Notepad utility in the workspace.');
    return;
  }

  // Fallback response
  addMessage(
    'assistant',
    "I couldn't find any direct information about that in your local GabAi data.\n\n" +
    "I can help you with your local tasks, wallet budget, calendar events, focus timers, and general productivity stats. " +
    "Try asking me:\n" +
    '• *"What should I focus on today?"*\n' +
    '• *"How much did I spend this week?"*\n' +
    '• *"Show tomorrow\'s schedule."*',
    [
      { label: "Today's Focus", icon: 'target', action: () => callbacks.router.replace('/(tabs)/tasks/task') },
      { label: 'Weekly Expenses', icon: 'dollar-sign', action: () => callbacks.router.replace('/(tabs)/expenses/expenses') },
    ]
  );
};
