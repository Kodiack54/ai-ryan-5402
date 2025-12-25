/**
 * AI Service for Ryan - Routes to GPT-4o-mini for prioritization tasks
 * Claude Sonnet for strategic planning
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { from } = require('./db');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODELS = {
  gpt_mini: 'gpt-4o-mini',
  claude_sonnet: 'claude-sonnet-4-20250514'
};

const PRICING = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 }
};

function calculateCost(modelId, inputTokens, outputTokens) {
  const pricing = PRICING[modelId] || { input: 0.15, output: 0.60 };
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

async function trackUsage(modelId, inputTokens, outputTokens, taskType, promptPreview) {
  try {
    const cost = calculateCost(modelId, inputTokens, outputTokens);
    await from('dev_ai_usage').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      model: modelId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: cost,
      assistant_name: 'ryan',
      prompt_preview: promptPreview?.slice(0, 255)
    });
    console.log(`[AI] Ryan tracked: ${modelId} | ${inputTokens}+${outputTokens} tokens | $${cost.toFixed(6)}`);
  } catch (error) {
    console.error('[AI] Failed to track usage:', error.message);
  }
}

async function generateWithGPT(prompt, options = {}) {
  const modelId = MODELS.gpt_mini;
  const messages = [];
  if (options.system) messages.push({ role: 'system', content: options.system });
  messages.push({ role: 'user', content: prompt });

  const response = await openai.chat.completions.create({
    model: modelId,
    max_tokens: options.maxTokens || 2000,
    messages,
    response_format: options.jsonMode ? { type: 'json_object' } : undefined
  });

  const inputTokens = response.usage?.prompt_tokens || 0;
  const outputTokens = response.usage?.completion_tokens || 0;
  await trackUsage(modelId, inputTokens, outputTokens, options.taskType, prompt);

  return {
    content: response.choices[0].message.content,
    model: 'gpt_mini',
    tokens: { input: inputTokens, output: outputTokens }
  };
}

async function generateWithClaude(prompt, options = {}) {
  const modelId = MODELS.claude_sonnet;
  const request = {
    model: modelId,
    max_tokens: options.maxTokens || 2000,
    messages: [{ role: 'user', content: prompt }]
  };
  if (options.system) request.system = options.system;

  const response = await anthropic.messages.create(request);

  const inputTokens = response.usage?.input_tokens || 0;
  const outputTokens = response.usage?.output_tokens || 0;
  await trackUsage(modelId, inputTokens, outputTokens, options.taskType, prompt);

  return {
    content: response.content[0].text,
    model: 'claude_sonnet',
    tokens: { input: inputTokens, output: outputTokens }
  };
}

module.exports = {
  generateWithGPT,
  generateWithClaude,
  MODELS
};
