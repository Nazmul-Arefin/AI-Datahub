/**
 * DeepSeek Harness (DSH) integration for Use Data — isolated from app bootstrap.
 */
import { getAgentRunOnApi, startAgentRunOnApi } from './repositories/agentsRepository.js';

export function normalizeMissionPlanSteps(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (Array.isArray(item)) {
      return [String(item[0] || '').trim(), String(item[1] || '').trim(), Number(item[2]) || 0];
    }
    if (typeof item === 'string') return [item.trim(), '', 0];
    if (item && typeof item === 'object') {
      return [
        String(item.title || item.name || item.step || '').trim(),
        String(item.detail || item.description || item.subtitle || '').trim(),
        Number(item.progress) || 0,
      ];
    }
    return ['', '', 0];
  }).filter((item) => item[0]);
}

export function applyProgressToPlan(steps, { done = false, working = false, phase = 0 } = {}) {
  const total = Math.max(1, steps.length);
  return steps.map((step, index) => {
    let progress = 0;
    if (done) progress = 100;
    else if (working) {
      const start = (index / total) * 8;
      const end = ((index + 1) / total) * 8;
      if (phase <= start) progress = index === 0 ? 18 : 0;
      else if (phase >= end) progress = 100;
      else progress = Math.round(((phase - start) / Math.max(0.1, end - start)) * 100);
    }
    return [step[0], step[1], Math.max(0, Math.min(100, progress))];
  });
}

export function parseWeeplePlanFromText(raw = '') {
  const textValue = String(raw || '');
  const blocks = [...textValue.matchAll(/```(?:weeple-plan|json)\s*([\s\S]*?)```/gi)].map((match) => match[1].trim());
  if (textValue.trim().startsWith('{')) blocks.unshift(textValue.trim());
  for (const blob of blocks) {
    try {
      const data = JSON.parse(blob);
      if (!data || typeof data !== 'object') continue;
      return {
        workPlan: normalizeMissionPlanSteps(data.workPlan || data.tasks || []),
        guidelinePlan: normalizeMissionPlanSteps(data.guidelinePlan || data.guidelines || []),
        findings: (Array.isArray(data.findings) ? data.findings : []).map((item) => {
          if (typeof item === 'string') return [item, ''];
          return [String(item?.title || item?.name || '').trim(), String(item?.detail || item?.description || '').trim()];
        }).filter((item) => item[0]),
        sourcesUsed: (data.sourcesUsed || data.sources || []).map((item) => String(item || '').trim()).filter(Boolean),
        headline: String(data.headline || data.title || '').trim(),
        recommendation: String(data.recommendation || '').trim(),
      };
    } catch (_error) {
      /* try next block */
    }
  }
  return null;
}

export function extractAgentRunSummary(run) {
  if (!run) return '';
  if (run.summary) return String(run.summary).trim();
  if (run.result) return String(run.result).trim();
  const events = Array.isArray(run.events) ? run.events : [];
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    const text = event?.text || event?.detail || event?.message || event?.label || '';
    if (text) return String(text).trim();
  }
  return '';
}

export function stripMarkdownNoise(value = '') {
  return String(value)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeAgentReportHtml(html = '') {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const banned = new Set(['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT']);
  template.content.querySelectorAll('*').forEach((node) => {
    if (banned.has(node.tagName)) {
      node.remove();
      return;
    }
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = String(attr.value || '');
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value))) {
        node.removeAttribute(attr.name);
      }
    });
  });
  return template.innerHTML;
}

export function extractAgentHtmlReport(raw = '') {
  const text = String(raw || '');
  const fenced = text.match(/```(?:html|htm)\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return {
      html: sanitizeAgentReportHtml(fenced[1].trim()),
      markdown: text.replace(fenced[0], '').trim(),
    };
  }
  if (/<(?:section|article|div|h[1-6]|ul|ol|p)\b/i.test(text) && /<\/(?:section|article|div|h[1-6]|ul|ol|p)>/i.test(text)) {
    return { html: sanitizeAgentReportHtml(text), markdown: '' };
  }
  return { html: '', markdown: text.trim() };
}

export function parseAgentReportSections(rawMarkdown = '') {
  const markdown = String(rawMarkdown || '').trim();
  const lines = markdown.split(/\n/);
  let headline = '';
  const findings = [];
  let recommendation = '';
  const bodyLines = [];
  let inRecommend = false;
  let inFindings = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      bodyLines.push('');
      return;
    }
    const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      const title = stripMarkdownNoise(heading[1]);
      if (!headline) headline = title;
      inFindings = /findings?|insights?|priorit/i.test(title) && !/recommend|next\s*(step|move|action)/i.test(title);
      inRecommend = /recommend|next\s*(step|move|action)/i.test(title);
      bodyLines.push(trimmed);
      return;
    }
    const bullet = trimmed.match(/^[-*+]\s+(.+)$/);
    if (bullet) {
      const item = stripMarkdownNoise(bullet[1]);
      if (inRecommend && !recommendation) recommendation = item;
      else if (inFindings && findings.length < 6) {
        const parts = item.split(/[:—–-]\s+/);
        const detail = parts.slice(1).join(': ').slice(0, 220);
        findings.push([parts[0].slice(0, 90), detail || 'Insight from the harness answer.']);
      }
      bodyLines.push(trimmed);
      return;
    }
    if (inRecommend && !recommendation) recommendation = stripMarkdownNoise(trimmed).slice(0, 280);
    bodyLines.push(trimmed);
  });

  if (!headline) {
    const first = stripMarkdownNoise(lines.find((line) => line.trim()) || '');
    headline = first.slice(0, 96) || 'Agent result';
  }

  return {
    headline,
    findings,
    recommendation,
    markdown: bodyLines.join('\n').trim() || markdown,
  };
}

export function useSourceLogoPath(source) {
  const key = `${source?.id || ''} ${source?.name || ''}`.toLowerCase();
  if (/notion/.test(key)) return 'assets/logos/notion.webp';
  if (/calendar/.test(key)) return 'assets/logos/Google_Calendar.webp';
  if (/gmail|mail/.test(key)) return 'assets/logos/gmail.webp';
  if (/github/.test(key)) return 'assets/logos/github.svg';
  if (/feishu|lark/.test(key)) return 'assets/logos/feishu.webp';
  if (/wechat|weixin/.test(key)) return 'assets/logos/wechat.webp';
  if (/telegram/.test(key)) return 'assets/logos/telegram.webp';
  if (/whatsapp/.test(key)) return 'assets/logos/whatsapp.svg';
  return '';
}

/**
 * @param {object} deps
 * @param {() => object} deps.getState
 * @param {() => Array} deps.getDataSources
 * @param {(msg: string) => void} deps.showToast
 * @param {() => object} deps.getUseDashboardGoal
 * @param {(state: string, options?: object) => void} deps.setUseMissionState
 * @param {() => void} deps.refreshUseSidePanels
 * @param {(options?: object) => void} deps.syncUsePersistentDashboard
 * @param {() => Promise<void>} deps.hydrateOverviewFromApi
 */
export function createUseMissionHarness(deps) {
  const {
    getState,
    getDataSources,
    showToast,
    getUseDashboardGoal,
    setUseMissionState,
    refreshUseSidePanels,
    syncUsePersistentDashboard,
    hydrateOverviewFromApi,
  } = deps;

  let useMissionRunTimer = null;
  let useMissionRunId = null;

  function clearUseMissionRunPoll() {
    if (useMissionRunTimer) {
      window.clearInterval(useMissionRunTimer);
      useMissionRunTimer = null;
    }
  }

  function clearUseMissionPlanState() {
    const state = getState();
    state.useMissionWorkPlan = [];
    state.useMissionGuidelinePlan = [];
    state.useMissionFindings = [];
    state.useMissionSourcesUsed = [];
    state.useMissionHeadline = '';
    state.useMissionRecommendation = '';
    state.useMissionReportHtml = '';
  }

  function ingestMissionPlanPayload(runOrText) {
    const state = getState();
    let plan = null;
    if (runOrText && typeof runOrText === 'object') {
      if (runOrText.workPlan || runOrText.guidelinePlan || runOrText.findings) {
        plan = {
          workPlan: normalizeMissionPlanSteps(runOrText.workPlan || runOrText.planPhase?.workPlan || []),
          guidelinePlan: normalizeMissionPlanSteps(runOrText.guidelinePlan || runOrText.planPhase?.guidelinePlan || []),
          findings: (runOrText.findings || []).map((item) => {
            if (typeof item === 'string') return [item, ''];
            if (Array.isArray(item)) return [String(item[0] || ''), String(item[1] || '')];
            return [String(item?.title || item?.name || '').trim(), String(item?.detail || item?.description || '').trim()];
          }).filter((item) => item[0]),
          sourcesUsed: (runOrText.sourcesUsed || runOrText.planPhase?.sourcesUsed || []).map((item) => String(item || '').trim()).filter(Boolean),
          headline: String(runOrText.headline || '').trim(),
          recommendation: String(runOrText.recommendation || '').trim(),
        };
      }
      const summaryPlan = parseWeeplePlanFromText(runOrText.summary || '');
      if (summaryPlan) {
        plan = {
          workPlan: plan?.workPlan?.length ? plan.workPlan : summaryPlan.workPlan,
          guidelinePlan: plan?.guidelinePlan?.length ? plan.guidelinePlan : summaryPlan.guidelinePlan,
          findings: plan?.findings?.length ? plan.findings : summaryPlan.findings,
          sourcesUsed: plan?.sourcesUsed?.length ? plan.sourcesUsed : summaryPlan.sourcesUsed,
          headline: plan?.headline || summaryPlan.headline,
          recommendation: plan?.recommendation || summaryPlan.recommendation,
        };
      }
    } else {
      plan = parseWeeplePlanFromText(runOrText);
    }
    if (!plan) return false;
    if (plan.workPlan?.length) state.useMissionWorkPlan = plan.workPlan;
    if (plan.guidelinePlan?.length) state.useMissionGuidelinePlan = plan.guidelinePlan;
    if (plan.findings?.length) state.useMissionFindings = plan.findings;
    if (plan.sourcesUsed?.length) state.useMissionSourcesUsed = plan.sourcesUsed;
    if (plan.headline) state.useMissionHeadline = plan.headline;
    if (plan.recommendation) state.useMissionRecommendation = plan.recommendation;
    return true;
  }

  function liveUseWorkSteps() {
    const state = getState();
    const phase = Math.max(0, Number(state.useMissionExecutionPhase) || 0);
    const working = state.useMissionState === 'working';
    const done = Boolean(String(state.useMissionSummary || '').trim()) && !working;
    if (!working && !done) return { tasks: [], guidelines: [] };

    const tasks = applyProgressToPlan(
      normalizeMissionPlanSteps(state.useMissionWorkPlan),
      { done, working, phase }
    );
    const guidelines = applyProgressToPlan(
      normalizeMissionPlanSteps(state.useMissionGuidelinePlan),
      { done, working, phase }
    );
    return { tasks, guidelines };
  }

  function liveUseSources(options = {}) {
    const state = getState();
    const preferUsed = Boolean(options.preferUsed);
    const usedHints = (Array.isArray(state.useMissionSourcesUsed) ? state.useMissionSourcesUsed : [])
      .map((item) => String(item || '').toLowerCase())
      .filter(Boolean);
    const rows = Array.isArray(getDataSources()) ? getDataSources() : [];
    const mapped = rows
      .filter((source) => source && !source.isCatalogOnly)
      .filter((source) => {
        const statusType = String(source.statusType || '').toLowerCase();
        if (!(statusType === 'connected' || statusType === 'attention' || statusType === 'processing')) {
          return false;
        }
        const connection = source.connection || null;
        const id = String(source.id || '').toLowerCase();
        const name = String(source.name || '').toLowerCase();
        const hinted = usedHints.some((hint) => id.includes(hint) || name.includes(hint) || hint.includes(id));
        if (preferUsed && usedHints.length) return hinted;
        if (connection?.externalConnectionId) return true;
        if (connection?.authProvider === 'astrbot' && connection?.status === 'connected') return true;
        if (Number(source.syncedCount || source.assetCount || 0) > 0) return true;
        if (hinted) return true;
        return false;
      })
      .map((source) => {
        const statusType = String(source.statusType || '').toLowerCase();
        let status = source.status || 'Connected';
        if (statusType === 'processing' || statusType === 'attention') status = 'Syncing';
        else if (statusType === 'connected') {
          status = /live/i.test(source.method || '') || /live/i.test(source.lastSync || '') ? 'Live' : 'Connected';
        }
        return [
          source.name || source.id || 'Source',
          useSourceLogoPath(source),
          status,
          source.id || 'source',
          source.assets || source.lastSync || '',
        ];
      });
    if (preferUsed && usedHints.length && !mapped.length) {
      return liveUseSources({ preferUsed: false });
    }
    return mapped;
  }

  function applyAgentRunProgress(run) {
    if (!run) return;
    const state = getState();
    const phase = Number(run.phase);
    if (Number.isFinite(phase) && phase > 0) {
      state.useMissionExecutionPhase = Math.max(1, Math.min(8, Math.round(phase)));
    } else {
      const progress = Number(run.progress);
      if (Number.isFinite(progress)) {
        state.useMissionExecutionPhase = Math.max(1, Math.min(8, Math.round(progress * 8) || 1));
      }
    }
    ingestMissionPlanPayload(run);
    const events = Array.isArray(run.events) ? run.events : [];
    if (events.length) {
      const latest = events[events.length - 1];
      const detail = latest?.text || latest?.detail || latest?.message || latest?.label || '';
      if (detail) state.useMissionStatusText = String(detail);
      const tools = events
        .map((event) => event?.tool || event?.toolName || event?.name)
        .filter(Boolean);
      if (tools.length) state.useMissionToolsUsed = [...new Set(tools)].slice(-6);
    }
    const summary = extractAgentRunSummary(run);
    if (summary) {
      state.useMissionSummary = summary;
      const extracted = extractAgentHtmlReport(summary);
      if (extracted.html) state.useMissionReportHtml = extracted.html;
      ingestMissionPlanPayload({ ...run, summary });
    }
    const { tasks, guidelines } = liveUseWorkSteps();
    const steps = [...tasks, ...guidelines];
    if (steps.length) {
      const avg = steps.reduce((sum, step) => sum + (Number(step[2]) || 0), 0) / steps.length;
      if (state.useMissionState === 'working' && avg > 0) {
        state.useMissionExecutionPhase = Math.max(state.useMissionExecutionPhase, Math.min(8, Math.round((avg / 100) * 8) || 1));
      }
    }
    if (state.useMissionState === 'working' || String(state.useMissionSummary || '').trim()) {
      refreshUseSidePanels();
      syncUsePersistentDashboard();
    }
  }

  function finalizeUseMissionRun(run) {
    applyAgentRunProgress(run);
    const state = getState();
    state.useMissionExecutionPhase = 8;
    refreshUseSidePanels();
    syncUsePersistentDashboard({ refreshPanels: true });
  }

  async function pollUseMissionRun(runId) {
    clearUseMissionRunPoll();
    useMissionRunId = runId;
    let attempts = 0;
    const maxAttempts = 200;
    useMissionRunTimer = window.setInterval(async () => {
      attempts += 1;
      const run = await getAgentRunOnApi(runId);
      if (run) applyAgentRunProgress(run);
      const status = String(run?.status || '').toLowerCase();
      if (['completed', 'complete', 'succeeded', 'success', 'failed', 'error', 'cancelled'].includes(status) || attempts >= maxAttempts) {
        clearUseMissionRunPoll();
        if (status === 'failed' || status === 'error' || status === 'cancelled' || (!run && attempts >= maxAttempts)) {
          const state = getState();
          state.useMissionState = 'idle';
          state.useMissionExecutionPhase = 1;
          showToast('Agent runtime unavailable');
          try { await hydrateOverviewFromApi(); } catch (_error) { /* optional */ }
          syncUsePersistentDashboard({ refreshPanels: true });
          return;
        }
        finalizeUseMissionRun(run);
        try { await hydrateOverviewFromApi(); } catch (_error) { /* optional */ }
      }
    }, 900);
  }

  async function startUseMissionFromPrompt(prompt) {
    const state = getState();
    state.useMissionRequest = prompt;
    state.useMissionDraft = prompt;
    state.useMissionExecutionPhase = 1;
    state.useMissionStatusText = 'Starting DeepSeek Harness…';
    state.useMissionToolsUsed = [];
    state.useMissionSummary = '';
    clearUseMissionPlanState();
    setUseMissionState('working', { announce: false });
    refreshUseSidePanels();
    syncUsePersistentDashboard({ refreshPanels: true });
    const goal = getUseDashboardGoal();
    const run = await startAgentRunOnApi({
      mission: prompt,
      goalId: goal?.linkedGoalId || null,
    });
    if (!run?.runId) {
      state.useMissionState = 'idle';
      state.useMissionExecutionPhase = 1;
      showToast('Agent runtime unavailable');
      syncUsePersistentDashboard({ refreshPanels: true });
      return;
    }
    applyAgentRunProgress(run);
    const status = String(run.status || '').toLowerCase();
    if (['completed', 'complete', 'succeeded', 'success'].includes(status)) {
      finalizeUseMissionRun(run);
      try { await hydrateOverviewFromApi(); } catch (_error) { /* optional */ }
      return;
    }
    if (['failed', 'error', 'cancelled'].includes(status)) {
      state.useMissionState = 'idle';
      state.useMissionExecutionPhase = 1;
      showToast('Agent runtime unavailable');
      syncUsePersistentDashboard({ refreshPanels: true });
      return;
    }
    await pollUseMissionRun(run.runId);
  }

  function buildUseResultReport({ renderMissionMarkdown }) {
    const state = getState();
    const goal = getUseDashboardGoal();
    const agentSummary = String(state.useMissionSummary || '').trim();
    const sources = liveUseSources({ preferUsed: true });
    const work = liveUseWorkSteps();
    const phase = Math.max(0, Number(state.useMissionExecutionPhase) || 0);
    const progress = Math.min(100, Math.round((phase / 8) * 100) || (agentSummary ? 100 : 0));
    const hasPlans = Boolean((state.useMissionWorkPlan || []).length || (state.useMissionGuidelinePlan || []).length);

    if (!agentSummary && !hasPlans) {
      return {
        empty: true,
        headline: 'No report yet',
        summary: '',
        summaryHtml: '',
        reportHtml: '',
        interpretation: 'Ask a question in Use Data to run DeepSeek Harness.',
        findings: [],
        drivers: [],
        recommendation: '',
        metrics: [],
        sources,
        taskCount: work.tasks.length,
        progress,
      };
    }

    const extracted = extractAgentHtmlReport(agentSummary);
    const parsed = parseAgentReportSections(extracted.markdown || agentSummary);
    const tools = Array.isArray(state.useMissionToolsUsed) ? state.useMissionToolsUsed : [];
    const findings = (state.useMissionFindings || []).length
      ? state.useMissionFindings
      : (parsed.findings || []);
    const taskAvg = work.tasks.length
      ? Math.round(work.tasks.reduce((sum, task) => sum + (Number(task[2]) || 0), 0) / work.tasks.length)
      : 0;
    const guideAvg = work.guidelines.length
      ? Math.round(work.guidelines.reduce((sum, item) => sum + (Number(item[2]) || 0), 0) / work.guidelines.length)
      : 0;

    return {
      empty: false,
      headline: state.useMissionHeadline || parsed.headline || (goal?.short ? `${goal.short} · agent result` : 'Agent result'),
      summary: parsed.markdown || agentSummary,
      summaryHtml: agentSummary ? renderMissionMarkdown(parsed.markdown || agentSummary) : '<p>Harness plans are ready. Waiting for the executed answer…</p>',
      reportHtml: extracted.html || String(state.useMissionReportHtml || '').trim(),
      interpretation: state.useMissionStatusText || 'Generated by the live DeepSeek Harness run.',
      findings,
      drivers: [
        ['Run progress', progress],
        ['Work plan', taskAvg],
        ['Guideline plan', guideAvg],
        ['Tool usage', Math.min(100, tools.length * 25)],
      ],
      recommendation: state.useMissionRecommendation || parsed.recommendation
        || 'Review the answer against your synced sources, then decide the next human-approved action.',
      metrics: [
        ['Sources', sources.length],
        ['Work tasks', work.tasks.length],
        ['Guidelines', work.guidelines.length],
      ],
      sources,
      taskCount: work.tasks.length,
      progress,
    };
  }

  return {
    clearUseMissionPlanState,
    ingestMissionPlanPayload,
    liveUseWorkSteps,
    liveUseSources,
    applyAgentRunProgress,
    finalizeUseMissionRun,
    startUseMissionFromPrompt,
    pollUseMissionRun,
    buildUseResultReport,
    clearUseMissionRunPoll,
  };
}
