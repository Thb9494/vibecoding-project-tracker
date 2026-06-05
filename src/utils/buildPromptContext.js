export function buildPromptContext(task, projectName = 'Vibecoding Project Tracker') {
  const tool = task.contextTool ? ` · via ${task.contextTool}` : '';
  const contextBlock = task.context
    ? `\n\n## Context${tool}\n${task.context}`
    : '\n\n## Context\n_(not yet filled in — add via the task modal)_';

  return `# Task: ${task.title}
**Type:** ${task.type} · **Status:** ${task.status} · **Assignee:** ${task.assignee}${task.dueDate ? ` · **Due:** ${task.dueDate}` : ''}

## Description
${task.description || '_(no description)_'}${contextBlock}

---
_Copied from ${projectName}_`;
}
