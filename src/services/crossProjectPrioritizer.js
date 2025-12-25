/**
 * crossProjectPrioritizer.js - Ryan's Cross-Project Prioritization Service
 *
 * Reads organized todos from all projects (from Clair), analyzes dependencies
 * across the ecosystem, and creates a unified priority roadmap.
 *
 * Key functions:
 * - Gather todos from all projects
 * - Identify cross-project dependencies
 * - Calculate priority scores
 * - Generate unified roadmap
 * - Flag blockers affecting multiple projects
 */

const { from } = require('../lib/db');
const { generateWithGPT } = require('../lib/ai');
const { Logger } = require('../lib/logger');

const logger = new Logger('Ryan:CrossProjectPrioritizer');

// Priority weights
const PRIORITY_WEIGHTS = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25
};

// System prompt for cross-project analysis
const CROSS_PROJECT_SYSTEM = `You are a project prioritization expert analyzing todos across multiple related projects.

RULES:
1. Output ONLY valid JSON - no explanations
2. Look for DEPENDENCIES between projects (shared components, APIs, data flows)
3. Identify BLOCKERS that affect multiple projects
4. Assign global priority scores (1-100) based on impact and urgency
5. Group into cross-project phases

OUTPUT SCHEMA:
{
  "unified_roadmap": [
    {
      "phase": "Phase 1",
      "theme": "Brief description of this phase's focus",
      "items": [
        {
          "project": "project-name",
          "todo_id": "uuid",
          "title": "todo title",
          "priority_score": 95,
          "reason": "Why this priority"
        }
      ]
    }
  ],
  "blockers": [
    {
      "blocker_todo_id": "uuid",
      "blocker_project": "project-name",
      "blocks": ["project1", "project2"],
      "description": "What it blocks and why"
    }
  ],
  "dependencies": [
    {
      "from_project": "project1",
      "from_todo_id": "uuid",
      "to_project": "project2",
      "to_todo_id": "uuid",
      "relationship": "requires|enables|shares"
    }
  ]
}`;

/**
 * Get all projects with their hierarchy info
 */
async function getAllProjects() {
  const { data: projects, error } = await from('dev_projects')
    .select('id, name, slug, is_parent, parent_id, client_id')
    .order('name');

  if (error) throw error;
  return projects || [];
}

/**
 * Get project paths for a project
 */
async function getProjectPaths(projectId) {
  const { data, error } = await from('dev_project_paths')
    .select('path')
    .eq('project_id', projectId);

  if (error) throw error;
  return (data || []).map(p => p.path);
}

/**
 * Get all actionable todos for a project path
 */
async function getTodosForPath(projectPath) {
  const { data, error } = await from('dev_ai_todos')
    .select('id, title, description, priority, status, category, project_path')
    .eq('project_path', projectPath);

  if (error) throw error;

  // Filter for actionable (not completed, not moved)
  return (data || []).filter(t =>
    t.status !== 'completed' &&
    t.category !== 'moved_to_knowledge' &&
    t.category !== 'duplicate'
  );
}

/**
 * Gather all todos across all projects
 */
async function gatherAllTodos() {
  logger.info('Gathering todos from all projects...');

  const projects = await getAllProjects();
  const allTodos = [];

  for (const project of projects) {
    const paths = await getProjectPaths(project.id);

    for (const path of paths) {
      const todos = await getTodosForPath(path);
      for (const todo of todos) {
        allTodos.push({
          project_id: project.id,
          project_name: project.name,
          project_slug: project.slug,
          is_parent: project.is_parent,
          parent_id: project.parent_id,
          ...todo
        });
      }
    }
  }

  logger.info('Gathered todos', { projectCount: projects.length, todoCount: allTodos.length });
  return allTodos;
}

/**
 * Group todos by client for focused analysis
 */
function groupByClient(todos, projects) {
  const clientGroups = {};

  for (const todo of todos) {
    const project = projects.find(p => p.id === todo.project_id);
    const clientId = project?.client_id || 'unknown';

    if (!clientGroups[clientId]) {
      clientGroups[clientId] = [];
    }
    clientGroups[clientId].push(todo);
  }

  return clientGroups;
}

/**
 * Calculate base priority score from priority field
 */
function getBasePriorityScore(priority) {
  return PRIORITY_WEIGHTS[priority?.toLowerCase()] || PRIORITY_WEIGHTS.medium;
}

/**
 * Analyze todos and generate cross-project priorities using AI
 */
async function analyzeCrossProjectPriorities(todos) {
  if (todos.length === 0) {
    logger.info('No todos to analyze');
    return { unified_roadmap: [], blockers: [], dependencies: [] };
  }

  // Prepare todo summary for AI
  const todoSummary = todos.map(t => ({
    id: t.id,
    project: t.project_name,
    title: t.title,
    category: t.category,
    priority: t.priority,
    base_score: getBasePriorityScore(t.priority)
  }));

  const prompt = `Analyze these ${todos.length} todos from multiple projects and create a unified priority roadmap:

${JSON.stringify(todoSummary, null, 2)}

Look for:
1. Cross-project dependencies (shared APIs, components, data)
2. Blockers that affect multiple projects
3. Natural groupings into phases
4. Priority based on impact and dependencies

Output ONLY valid JSON matching the schema.`;

  const response = await generateWithGPT(prompt, {
    system: CROSS_PROJECT_SYSTEM,
    maxTokens: 3000,
    jsonMode: true,
    taskType: 'cross_project_prioritization'
  });

  let result;
  try {
    result = JSON.parse(response.content);
  } catch (parseError) {
    logger.error('AI returned invalid JSON', { error: parseError.message });
    throw new Error('AI returned invalid JSON');
  }

  return result;
}

/**
 * Save priority analysis to database
 */
async function savePriorityAnalysis(analysis) {
  try {
    // Save to dev_ai_knowledge for reference
    await from('dev_ai_knowledge').insert({
      project_path: '/var/www/Studio/ai-team',
      title: `Cross-Project Priority Analysis - ${new Date().toISOString().split('T')[0]}`,
      content: JSON.stringify(analysis, null, 2),
      category: 'Roadmap',
      source: 'ryan_prioritizer'
    });

    // Update todo priorities in database
    if (analysis.unified_roadmap) {
      for (const phase of analysis.unified_roadmap) {
        for (const item of (phase.items || [])) {
          if (item.todo_id && item.priority_score) {
            await from('dev_ai_todos')
              .update({
                priority: item.priority_score >= 80 ? 'high' :
                          item.priority_score >= 50 ? 'medium' : 'low'
              })
              .eq('id', item.todo_id);
          }
        }
      }
    }

    logger.info('Priority analysis saved');
  } catch (err) {
    logger.error('Failed to save analysis', { error: err.message });
  }
}

/**
 * Main prioritization function
 */
async function prioritizeAll() {
  logger.info('Starting cross-project prioritization...');

  try {
    // Gather all todos
    const allTodos = await gatherAllTodos();

    if (allTodos.length === 0) {
      logger.info('No todos found across projects');
      return { success: true, message: 'No todos to prioritize' };
    }

    // Analyze and prioritize
    const analysis = await analyzeCrossProjectPriorities(allTodos);

    // Save results
    await savePriorityAnalysis(analysis);

    logger.info('Cross-project prioritization complete', {
      phases: analysis.unified_roadmap?.length || 0,
      blockers: analysis.blockers?.length || 0,
      dependencies: analysis.dependencies?.length || 0
    });

    return {
      success: true,
      todoCount: allTodos.length,
      phases: analysis.unified_roadmap?.length || 0,
      blockers: analysis.blockers || [],
      dependencies: analysis.dependencies || [],
      roadmap: analysis.unified_roadmap || []
    };
  } catch (err) {
    logger.error('Prioritization failed', { error: err.message });
    throw err;
  }
}

/**
 * Get current priority status
 */
async function getPriorityStatus() {
  const allTodos = await gatherAllTodos();

  const byPriority = {
    high: allTodos.filter(t => t.priority === 'high').length,
    medium: allTodos.filter(t => t.priority === 'medium').length,
    low: allTodos.filter(t => t.priority === 'low').length
  };

  const byProject = {};
  for (const todo of allTodos) {
    if (!byProject[todo.project_name]) byProject[todo.project_name] = 0;
    byProject[todo.project_name]++;
  }

  return {
    totalTodos: allTodos.length,
    byPriority,
    byProject,
    projects: Object.keys(byProject).length
  };
}

/**
 * Get blockers affecting a specific project
 */
async function getBlockersForProject(projectSlug) {
  // Get latest analysis from knowledge
  const { data } = await from('dev_ai_knowledge')
    .select('content')
    .eq('category', 'Roadmap')
    .eq('source', 'ryan_prioritizer')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data?.content) return [];

  try {
    const analysis = JSON.parse(data.content);
    return (analysis.blockers || []).filter(b =>
      b.blocks?.includes(projectSlug) || b.blocker_project === projectSlug
    );
  } catch {
    return [];
  }
}

module.exports = {
  prioritizeAll,
  gatherAllTodos,
  analyzeCrossProjectPriorities,
  getPriorityStatus,
  getBlockersForProject,
  getAllProjects,
  PRIORITY_WEIGHTS
};
