/**
 * Application runtime adapted from the V2.3.2 monolith.
 * Expects overview/goals/import-data/use-data page roots to exist under #page-outlet.
 */
let __navigate = (id) => { window.location.hash = '#/' + id; };
let __showToastExternal = null;
let __store = null;
let __bootstrapped = false;
let __navigating = false;
let __activatePage = () => {};
let __deactivatePage = () => {};

export function configureRuntime({ navigate, showToast, store } = {}) {
  if (typeof navigate === 'function') __navigate = navigate;
  if (typeof showToast === 'function') __showToastExternal = showToast;
  if (store) __store = store;
}

export function ensureBootstrapped() {
  if (__bootstrapped) return;
  __bootstrapped = true;
  __install();
}

export function activatePage(pageId, params) {
  ensureBootstrapped();
  return __activatePage(pageId, params || new URLSearchParams());
}

export function deactivatePage(pageId) {
  if (!__bootstrapped) return;
  return __deactivatePage(pageId);
}

function __install() {
  'use strict';

  function __showToast(message, options = {}) {
    if (typeof __showToastExternal === 'function') {
      __showToastExternal(message, options);
      return;
    }
    __legacyShowToast(message, options);
  }


  function openRoutedView(legacyKey, announce = true) {
    const map = { overview: 'overview', goals: 'goals', data: 'import-data', memory: 'use-data' };
    try {
      __navigate(map[legacyKey] || legacyKey);
      return;
    } catch (_n) {
      return openPrimaryView(legacyKey, announce);
    }
  }

  const canvas = document.getElementById('topologyCanvas');
  if (!canvas) throw new Error('topologyCanvas missing — overview view must be preloaded before bootstrap');
  const ctx = canvas.getContext('2d', { alpha: true });
  const topologyInputLayer = document.getElementById('topologyHitLayer') || canvas;
  const tooltip = document.getElementById('nodeTooltip');
  const tooltipTitle = document.getElementById('tooltipTitle');
  const tooltipType = document.getElementById('tooltipType');
  const tooltipStrength = document.getElementById('tooltipStrength');
  const tooltipDetail = document.getElementById('tooltipDetail');
  const tooltipSource = document.getElementById('tooltipSource');
  const tooltipReason = document.getElementById('tooltipReason');
  const topologyConnectionCount = document.getElementById('topologyConnectionCount');
  const interactionHint = document.getElementById('interactionHint');
  const osShell = document.querySelector('.os-shell');
  const focusModePanel = document.getElementById('focusModePanel');
  const focusBack = document.getElementById('focusBack');
  const focusEyebrow = document.getElementById('focusEyebrow');
  const focusTitle = document.getElementById('focusTitle');
  const focusDescription = document.getElementById('focusDescription');
  const focusActions = document.getElementById('focusActions');
  const goalsWorkspace = document.getElementById('goalsWorkspace');
  const goalRailList = document.getElementById('goalRailList');
  const goalInspectorContent = document.getElementById('goalInspectorContent');
  const goalAdd = document.getElementById('goalAdd');
  const reasoningGoalAdd = document.getElementById('reasoningGoalAdd');
  const goalLibraryAdd = document.getElementById('goalLibraryAdd');
  const goalPlanMore = document.getElementById('goalPlanMore');
  const activeGoalTitle = document.getElementById('activeGoalTitle');
  const activeGoalStatus = document.getElementById('activeGoalStatus');
  const goalCompletionSummary = document.getElementById('goalCompletionSummary');
  const reasoningSubgoalList = document.getElementById('reasoningSubgoalList');
  const reasoningObservationList = document.getElementById('reasoningObservationList');
  const reasoningPredictionContent = document.getElementById('reasoningPredictionContent');
  const reasoningSuggestionList = document.getElementById('reasoningSuggestionList');
  const suggestionCount = document.getElementById('suggestionCount');
  const aiReasoningStatus = document.getElementById('aiReasoningStatus');
  const aiReasoningMessage = document.getElementById('aiReasoningMessage');
  const goalCollectionList = document.getElementById('goalCollectionList');
  const goalCollectionCount = document.getElementById('goalCollectionCount');
  const goalLibrary = document.querySelector('.goal-library');
  const goalFocusPrevious = document.getElementById('goalFocusPrevious');
  const goalFocusNext = document.getElementById('goalFocusNext');
  const goalFocusPicker = document.getElementById('goalFocusPicker');
  const goalFocusPosition = document.getElementById('goalFocusPosition');
  const goalFocusTitle = document.getElementById('goalFocusTitle');
  const goalFocusStatus = document.getElementById('goalFocusStatus');
  const goalPickerPanel = document.getElementById('goalPickerPanel');
  const goalSearch = document.getElementById('goalSearch');
  const goalCommandTitle = document.getElementById('goalCommandTitle');
  const goalMenuButton = document.getElementById('goalMenuButton');
  const goalMoreButton = document.getElementById('goalMoreButton');
  const goalActionMenu = document.getElementById('goalActionMenu');
  const goalDeleteButton = document.getElementById('goalDeleteButton');
  const goalDeleteSheet = document.getElementById('goalDeleteSheet');
  const goalDeleteTitle = document.getElementById('goalDeleteTitle');
  const goalDeleteDescription = document.getElementById('goalDeleteDescription');
  const goalDeleteCancel = document.getElementById('goalDeleteCancel');
  const goalDeleteConfirm = document.getElementById('goalDeleteConfirm');
  const goalCommandOutcome = document.getElementById('goalCommandOutcome');
  const goalCategoryLabel = document.getElementById('goalCategoryLabel');
  const goalUpdatedLabel = document.getElementById('goalUpdatedLabel');
  const goalCommandMeta = document.getElementById('goalCommandMeta');
  const goalCommandProgress = document.getElementById('goalCommandProgress');
  const goalCommandStatus = document.getElementById('goalCommandStatus');
  const goalNextMilestone = document.getElementById('goalNextMilestone');
  const goalNextAction = document.getElementById('goalNextAction');
  const goalMomentumLabel = document.getElementById('goalMomentumLabel');
  const goalAIState = document.getElementById('goalAIState');
  const goalMotivationMessage = document.getElementById('goalMotivationMessage');
  const goalMotivationDetail = document.getElementById('goalMotivationDetail');
  const goalTrajectory = document.getElementById('goalTrajectory');
  const goalJourneyNow = document.getElementById('goalJourneyNow');
  const goalResultsSummary = document.getElementById('goalResultsSummary');
  const goalLogicFlow = document.getElementById('goalLogicFlow');
  const goalGameContent = document.getElementById('goalGameContent');
  const goalLogicGoalTitle = document.getElementById('goalLogicGoalTitle');
  const goalLogicObservationTitle = document.getElementById('goalLogicObservationTitle');
  const goalLogicObservationMeta = document.getElementById('goalLogicObservationMeta');
  const goalLogicPredictionTitle = document.getElementById('goalLogicPredictionTitle');
  const goalLogicPredictionMeta = document.getElementById('goalLogicPredictionMeta');
  const goalLogicDecisionTitle = document.getElementById('goalLogicDecisionTitle');
  const goalLogicDecisionMeta = document.getElementById('goalLogicDecisionMeta');
  const goalBriefHeadline = document.getElementById('goalBriefHeadline');
  const goalBriefExplanation = document.getElementById('goalBriefExplanation');
  const goalBriefSubgoalCount = document.getElementById('goalBriefSubgoalCount');
  const goalResultStream = document.getElementById('goalResultStream');
  const goalPrimaryActionPanel = document.getElementById('goalPrimaryActionPanel');
  const goalPrimaryAction = document.getElementById('goalPrimaryAction');
  const goalDecisionState = document.getElementById('goalDecisionState');
  const goalDisclosureBar = document.getElementById('goalDisclosureBar');
  const goalPlanCount = document.getElementById('goalPlanCount');
  const goalReasoningCount = document.getElementById('goalReasoningCount');
  const goalSourceCount = document.getElementById('goalSourceCount');
  const goalResultDrawer = document.getElementById('goalResultDrawer');
  const goalResultDrawerEyebrow = document.getElementById('goalResultDrawerEyebrow');
  const goalResultDrawerTitle = document.getElementById('goalResultDrawerTitle');
  const goalResultDrawerContent = document.getElementById('goalResultDrawerContent');
  const goalResultDrawerClose = document.getElementById('goalResultDrawerClose');
  const goalMonitoringButton = document.getElementById('goalMonitoringButton');
  const goalMonitoringLabel = document.getElementById('goalMonitoringLabel');
  const goalMonitoringDescription = document.getElementById('goalMonitoringDescription');
  const goalMonitoringPopover = document.getElementById('goalMonitoringPopover');
  const goalTimeline = document.getElementById('goalTimeline');
  const goalHardwareState = document.getElementById('goalHardwareState');
  const goalPreviousCue = document.getElementById('goalPreviousCue');
  const goalNextCue = document.getElementById('goalNextCue');
  const goalCommandHero = document.querySelector('.goal-command-hero');
  const goalProposalInbox = document.getElementById('goalProposalInbox');
  const goalSupportTabs = document.getElementById('goalSupportTabs');
  const goalSupportPanel = document.getElementById('goalSupportPanel');
  const goalCanvasLinks = document.querySelector('.goal-canvas-links');
  const goalJourneyPaths = [...document.querySelectorAll('.goal-canvas-path.journey')];
  const goalJourneyPackets = [...document.querySelectorAll('.goal-canvas-packet.orange')];
  const goalMonitoringStatus = document.getElementById('goalMonitoringStatus');
  const goalCreateSheet = document.getElementById('goalCreateSheet');
  const goalCreateForm = document.getElementById('goalCreateForm');
  const goalCreateTitle = document.getElementById('goalCreateTitle');
  const goalCreateDescription = document.getElementById('goalCreateDescription');
  const newGoalDateInput = document.getElementById('newGoalDate');
  const newGoalTimeInput = document.getElementById('newGoalTime');
  const goalProposalPreview = document.getElementById('goalProposalPreview');
  const goalProposeButton = document.getElementById('goalProposeButton');
  const collaborationSheet = document.getElementById('collaborationSheet');
  const collaborationClose = document.getElementById('collaborationClose');
  const collaborationCancel = document.getElementById('collaborationCancel');
  const collaborationConfirm = document.getElementById('collaborationConfirm');
  const collaborationDescription = document.getElementById('collaborationDescription');
  const collaborationTitle = document.getElementById('collaborationTitle');
  const consentRules = document.querySelector('.consent-rules');
  const defaultConsentRules = consentRules ? consentRules.innerHTML : '';
  const dataWorkspace = document.getElementById('dataWorkspace');
  const sourceGrid = document.getElementById('sourceGrid');
  const sourceCount = document.getElementById('sourceCount');
  const sourceInspector = document.getElementById('sourceInspector');
  const sourceInspectorContent = document.getElementById('sourceInspectorContent');
  const sourceInspectorBackdrop = document.getElementById('sourceInspectorBackdrop');
  const sourceInspectorClose = document.getElementById('sourceInspectorClose');
  const addSourceButton = document.getElementById('addSourceButton');
  const addAdapterButton = document.getElementById('addAdapterButton');
  const connectionWizard = document.getElementById('connectionWizard');
  const connectionWizardClose = document.getElementById('connectionWizardClose');
  const wizardCancel = document.getElementById('wizardCancel');
  const wizardContinue = document.getElementById('wizardContinue');
  const wizardPermissionPreview = document.getElementById('wizardPermissionPreview');
  const useWorkspace = document.getElementById('useWorkspace');
  const useMissionStage = document.getElementById('useMissionStage');
  const missionProgress = document.getElementById('missionProgress');
  const missionDetailDrawer = document.getElementById('missionDetailDrawer');
  const missionDetailClose = document.getElementById('missionDetailClose');
  const useReportDrawerScrim = document.getElementById('useReportDrawerScrim');
  const useResultReportTitle = document.getElementById('useResultReportTitle');
  const useResultReportContent = document.getElementById('useResultReportContent');
  const useResultReportDownload = document.getElementById('useResultReportDownload');
  const conversationStream = document.getElementById('conversationStream');
  const assistantComposer = document.getElementById('assistantComposer');
  const assistantInput = document.getElementById('assistantInput');
  const memoryDrawer = document.getElementById('memoryDrawer');
  const memoryList = document.getElementById('memoryList');
  const memoryProposal = document.getElementById('memoryProposal');
  const setupButton = document.getElementById('setupButton');
  const onboardingOverlay = document.getElementById('onboardingOverlay');
  const onboardingBody = document.getElementById('onboardingBody');
  const onboardingTitle = document.getElementById('onboardingTitle');
  const onboardingDescription = document.getElementById('onboardingDescription');
  const onboardingProgressLabel = document.getElementById('onboardingProgressLabel');
  const onboardingBack = document.getElementById('onboardingBack');
  const onboardingNext = document.getElementById('onboardingNext');
  const toast = document.getElementById('toast');
  const toastAction = document.getElementById('toastAction');
  const goalUseHint = document.getElementById('goalUseHint');
  const goalUseHintDismiss = document.getElementById('goalUseHintDismiss');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const interactionHintCopy = interactionHint?.querySelector('span');
  if (interactionHintCopy) interactionHintCopy.innerHTML = 'Drag to explore <i>·</i> Pinch to zoom <i>·</i> Tap any node to understand it';
  let goalUseHintSeen = false;
  try { goalUseHintSeen = localStorage.getItem('weeple-goal-hint-seen') === '1'; } catch (error) { /* storage is optional */ }

  function haptic(duration = 8) {
    try {
      if (navigator.vibrate) navigator.vibrate(duration);
    } catch (error) {
      // Haptics are optional and may be blocked in desktop preview mode.
    }
  }

  function dismissInteractionHint() {
    interactionHint.classList.add('dismissed');
    try { localStorage.setItem('weeple-topology-hint-seen', '1'); } catch (error) { /* storage is optional */ }
  }

  function dismissGoalUseHint() {
    goalUseHintSeen = true;
    goalUseHint.classList.remove('visible');
    goalUseHint.setAttribute('aria-hidden', 'true');
    try { localStorage.setItem('weeple-goal-hint-seen', '1'); } catch (error) { /* storage is optional */ }
  }

  function showGoalUseHint() {
    if (goalUseHintSeen) return;
    window.setTimeout(() => {
      if (!state.goalWorkspaceActive || goalUseHintSeen) return;
      goalUseHint.classList.add('visible');
      goalUseHint.setAttribute('aria-hidden', 'false');
    }, reduceMotion ? 0 : 700);
  }

  try {
    if (localStorage.getItem('weeple-topology-hint-seen')) interactionHint.classList.add('dismissed');
  } catch (error) {
    // Keep the hint visible when local storage is unavailable.
  }

  const palette = {
    goals: { color: '#ff5e00', rgb: '255,94,0', label: 'GOAL MANAGEMENT' },
    data: { color: '#06a6c8', rgb: '6,166,200', label: 'PERSONAL DATA' },
    memory: { color: '#8b5cf6', rgb: '139,92,246', label: 'LONG-TERM MEMORY' },
    subgoal: { color: '#ff8c42', rgb: '255,140,66', label: 'DIRECT SUBGOAL' },
    execution: { color: '#8b5cf6', rgb: '139,92,246', label: 'AI EXECUTION' }
  };

  const clusterConfig = [
    {
      key: 'goals', title: 'Goal Management', center: { x: 30, y: -8, z: 0 }, count: 32, spread: { x: 72, y: 72, z: 44 },
      labels: ['Launch new product', 'Morning focus', 'Learn Spanish', 'Q3 milestones', 'Health plan', 'Travel fund']
    },
    {
      key: 'data', title: 'Personal Data', center: { x: -135, y: 14, z: 10 }, count: 30, spread: { x: 60, y: 62, z: 38 },
      labels: ['Apple Fitness', 'Air Quality', 'Family Ledger', 'Dash Cam', 'WeChat Pay', 'Calendar', 'Drive', 'Home Sensors']
    },
    {
      key: 'memory', title: 'Long-Term Memory', center: { x: 190, y: 8, z: -8 }, count: 30, spread: { x: 58, y: 64, z: 40 },
      labels: ['Morning habits', 'Food preferences', 'People graph', 'Past journeys', 'Reading notes', 'Work patterns', 'Family moments']
    }
  ];
  const clusterCenters = Object.fromEntries(clusterConfig.map(cluster => [cluster.key, cluster.center]));

  const state = {
    width: 0, height: 0, dpr: 1,
    rotationX: -0.08, rotationY: -0.1,
    targetRotationX: -0.08, targetRotationY: -0.1,
    velocityX: 0, velocityY: 0,
    zoom: 2.05, targetZoom: 2.05,
    dragging: false, moved: false,
    activePointer: null, lastX: 0, lastY: 0,
    pointers: new Map(), pinchDistance: 0,
    hoverNode: null, selectedNode: null, activeCluster: 'overview',
    lastTime: performance.now(), elapsed: 0,
    visible: !document.hidden,
    autoResumeAt: performance.now() + 900,
    autoBaseX: -0.08,
    viewCenter: { x: 0, y: 0, z: 0 },
    viewCenterTarget: { x: 0, y: 0, z: 0 },
    clusterVisibility: { goals: 1, data: 1, memory: 1 },
    clusterVisibilityTarget: { goals: 1, data: 1, memory: 1 },
    touchRipples: [],
    executionAmbient: false,
    voiceActive: false,
    voiceLevel: 0,
    goalWorkspaceActive: false,
    dataWorkspaceActive: false,
    useWorkspaceActive: false,
    useMissionState: 'idle',
    useMissionListening: false,
    useMissionRequest: 'Find investors for my startup who are interested in AI education platforms and can invest between $100K to $500K.',
    useMissionDraft: '',
    useMissionElapsed: 0,
    useMissionAutoAdvance: true,
    useMissionGoalIndex: 0,
    useMissionGoalStringHidden: false,
    useMissionExecutionPhase: 0,
    currentGoalIndex: 0,
    currentGoalProgress: 72,
    selectedSourceId: 'iphone',
    sourceFilter: 'all',
    onboardingStep: 0,
    onboardingScenario: 'goal',
    goalProposalReady: false,
    goalSyncing: false,
    goalFilter: 'active',
    goalSearch: '',
    goalSupportView: 'activity'
  };

  try { state.useMissionGoalStringHidden = localStorage.getItem('weeple-use-goal-string-hidden') === '1'; } catch (error) { /* storage is optional */ }

  let topologyAnimationFrame = 0;
  let topologyDirty = false;

  function shouldRenderTopology() {
    return state.visible && !state.goalWorkspaceActive && !state.dataWorkspaceActive && !state.useWorkspaceActive;
  }

  function stopTopologyLoop(clearCanvas = true) {
    if (topologyAnimationFrame) cancelAnimationFrame(topologyAnimationFrame);
    topologyAnimationFrame = 0;
    if (clearCanvas && state.width && state.height) ctx.clearRect(0, 0, state.width, state.height);
  }

  function startTopologyLoop() {
    if (!shouldRenderTopology() || topologyAnimationFrame) return;
    if (topologyDirty) {
      buildUniverse();
      topologyDirty = false;
    }
    state.lastTime = performance.now();
    topologyAnimationFrame = requestAnimationFrame(draw);
  }

  function invalidateTopology() {
    topologyDirty = true;
    if (!shouldRenderTopology()) return;
    buildUniverse();
    topologyDirty = false;
  }

  let seed = 84921;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  function getExecutionLevel() {
    const phase = state.elapsed % 12;
    if (phase < 7) return 0;
    if (phase < 8) return phase - 7;
    if (phase < 10.2) return 1;
    if (phase < 11.2) return 11.2 - phase;
    return 0;
  }

  function blendRgb(from, to, amount) {
    return from.map((value, index) => Math.round(value + (to[index] - value) * amount));
  }

  function visualStyle(node) {
    const base = palette[node.cluster];
    if (state.goalWorkspaceActive && node.cluster === 'goals' && !node.core) {
      return node.goalRole === 'subgoal' ? palette.subgoal : palette.execution;
    }
    if (node.visualKind === 'ai-core') {
      return { color: '#6d5dfc', rgb: '109,93,252', label: 'AI SYNTHESIS' };
    }
    if (!node.core || node.cluster !== 'goals') return base;
    const execution = getExecutionLevel();
    const mixed = blendRgb([255, 94, 0], [139, 92, 246], execution);
    return { color: `rgb(${mixed.join(',')})`, rgb: mixed.join(','), label: base.label };
  }

  function applyAmbientTheme() {
    const executionVisible = state.executionAmbient && (state.activeCluster === 'overview' || state.activeCluster === 'goals');
    const style = executionVisible ? palette.execution : (palette[state.activeCluster] || palette.goals);
    document.documentElement.style.setProperty('--active-rgb', style.rgb);
    document.documentElement.style.setProperty('--active-color', style.color);
  }

  const nodes = [];
  const edges = [];
  const dust = [];
  let voiceStream = null;
  let voiceAudioContext = null;
  let voiceAnalyser = null;
  let voiceBuffer = null;

  function buildUniverseLegacy() {
    nodes.length = 0;
    edges.length = 0;
    dust.length = 0;
    seed = 84921 + state.currentGoalIndex * 997;
    const connectionKeys = new Set();
    const connectNeurons = (a, b, options = {}) => {
      const key = [a.id, b.id].sort().join('|');
      if (connectionKeys.has(key)) return;
      connectionKeys.add(key);
      edges.push({
        a, b, phase: random(), speed: .2 + random() * .42, primary: false,
        curve: (random() - .5) * 1.35, electricPhase: random(), polarity: random() > .5 ? 1 : -1,
        ...options
      });
    };
    const goal = goalProfiles[state.currentGoalIndex] || goalProfiles[0];
    if (!goal) return;
    state.currentGoalProgress = goal.progress || 0;
    const goalCore = makeTopologyNode({
      id: 'goals-core', cluster: 'goals', core: true, role: 'goal', title: goal.title,
      detail: goal.description || 'The outcome you asked Weeple to help advance.', source: 'User-confirmed goal',
      reason: 'Every signal in this view is connected only when it can help advance this goal.',
      x: 35, y: 0, z: 0, radius: 19, strength: 100, showLabel: true
    });
    nodes.push(goalCore);

    const subgoals = (goal.subgoals || []).slice(0, 4);
    const subgoalPositions = [
      { x: -18, y: -70, z: 10 }, { x: 104, y: -49, z: -8 },
      { x: 111, y: 55, z: 9 }, { x: -17, y: 72, z: -9 }
    ];
    const subgoalNodes = subgoals.map((subgoal, index) => {
      const position = subgoalPositions[index];
      const node = makeTopologyNode({
        id: `subgoal-${index}`, cluster: 'goals', role: 'subgoal', goalRole: 'subgoal',
        title: subgoal.name, detail: `${subgoal.done || 0} of ${subgoal.total || 1} actions complete.`,
        source: 'AI plan · user confirmed', reason: `This is a direct path toward “${goal.short || goal.title}”.`,
        ...position, radius: 6.2, strength: 94 - index * 3, showLabel: true, subgoalIndex: index
      });
      nodes.push(node);
      connectNeurons(node, goalCore, { primary: true, goalStructure: true, support: true, curve: (index - 1.5) * .12, polarity: 1 });
      return node;
    });

    const taskLabels = (goal.taskLabels || []).slice(0, 8);
    taskLabels.forEach((task, index) => {
      const parentIndex = index % Math.max(1, subgoalNodes.length);
      const parent = subgoalNodes[parentIndex] || goalCore;
      const angle = Math.atan2(parent.baseY - goalCore.baseY, parent.baseX - goalCore.baseX) + (index % 2 ? .27 : -.27);
      const distance = 32 + Math.floor(index / Math.max(1, subgoalNodes.length)) * 13;
      const node = makeTopologyNode({
        id: `task-${index}`, cluster: 'goals', role: 'task', goalRole: 'task', title: task,
        detail: 'An execution item generated from this direct subgoal.', source: 'Goal plan',
        reason: `Completing this action advances “${parent.title}”.`,
        x: parent.baseX + Math.cos(angle) * distance, y: parent.baseY + Math.sin(angle) * distance,
        z: (random() - .5) * 18, radius: 2.2, strength: 78 + Math.floor(random() * 15), showLabel: false
      });
      nodes.push(node);
      connectNeurons(node, parent, { primary: false, task: true, curve: (random() - .5) * .22, polarity: 1 });
    });

    const evidence = buildGoalEvidence(goal, subgoalNodes);
    const lanes = { data: -1, memory: 1 };
    const evidenceLaneCounts = new Map();
    evidence.forEach((item, index) => {
      const parentIndex = item.subgoalIndex % Math.max(1, subgoalNodes.length);
      const parent = subgoalNodes[parentIndex] || goalCore;
      const side = lanes[item.kind];
      const laneKey = `${item.kind}-${parentIndex}`;
      const laneIndex = evidenceLaneCounts.get(laneKey) || 0;
      evidenceLaneCounts.set(laneKey, laneIndex + 1);
      const parentAngle = Math.atan2(parent.baseY - goalCore.baseY, parent.baseX - goalCore.baseX);
      const laneAngle = item.kind === 'data'
        ? Math.PI + (parentIndex - 1) * .19 + (laneIndex - .5) * .34
        : (parentIndex - 1) * .2 + (laneIndex - .5) * .28;
      const spread = 59 + (index % 3) * 12;
      const node = makeTopologyNode({
        id: `${item.kind}-evidence-${index}`, cluster: item.kind, role: 'evidence', evidenceType: item.kind,
        title: item.title, detail: item.detail, source: item.source, freshness: item.freshness,
        permission: item.kind === 'data' ? 'Connected source · authorized' : 'Confirmed memory · user controlled',
        reason: `Supports “${parent.title}” because ${item.reason}`,
        x: parent.baseX + Math.cos(laneAngle) * spread + Math.cos(parentAngle) * 9,
        y: parent.baseY + Math.sin(laneAngle) * spread * .62 + side * (index % 2 ? 8 : -7),
        z: (random() - .5) * 32, radius: item.featured ? 5.2 : 3.8,
        strength: item.strength, showLabel: item.featured, subgoalIndex: parentIndex
      });
      nodes.push(node);
      connectNeurons(node, parent, {
        primary: item.featured, bridge: true, support: true, evidenceType: item.kind,
        curve: item.kind === 'data' ? -.34 : .34, speed: item.kind === 'data' ? .46 : .29, polarity: 1
      });
    });

    subgoalNodes.forEach((parent, parentIndex) => {
      for (let index = 0; index < 5; index += 1) {
        const angle = parentIndex * 1.7 + index * 1.18 + random() * .25;
        const distance = 16 + random() * 28;
        const node = makeTopologyNode({
          id: `signal-${parentIndex}-${index}`, cluster: 'goals', role: 'signal', title: `${parent.title} signal`,
          detail: 'A supporting inference within this subgoal.', source: 'Weeple reasoning',
          reason: `This signal is being evaluated for “${parent.title}”.`,
          x: parent.baseX + Math.cos(angle) * distance, y: parent.baseY + Math.sin(angle) * distance,
          z: (random() - .5) * 38, radius: 1.15 + random() * 1.3, strength: 67 + Math.floor(random() * 20), showLabel: false
        });
        nodes.push(node);
        connectNeurons(node, parent, { curve: (random() - .5) * .32, polarity: 1 });
      }
    });

    for (let i = 0; i < 130; i += 1) {
      dust.push({
        x: -270 + random() * 600,
        y: -160 + random() * 320,
        z: -130 + random() * 260,
        radius: .25 + random() * 1.15,
        alpha: .08 + random() * .22,
        phase: random() * Math.PI * 2
      });
    }
    if (topologyConnectionCount) topologyConnectionCount.textContent = String(edges.length).padStart(2, '0');
  }

  function buildUniverse() {
    nodes.length = 0;
    edges.length = 0;
    dust.length = 0;
    seed = 84921 + state.currentGoalIndex * 997;
    const connectionKeys = new Set();
    const connectNeurons = (a, b, options = {}) => {
      const key = [a.id, b.id].sort().join('|');
      if (connectionKeys.has(key)) return;
      connectionKeys.add(key);
      edges.push({
        a, b, phase: random(), speed: .2 + random() * .42, primary: false,
        curve: (random() - .5) * 1.35, electricPhase: random(), polarity: 1,
        ...options
      });
    };
    if (!goalProfiles.length) return;

    const selectedGoal = goalProfiles[state.currentGoalIndex] || goalProfiles[0];
    state.currentGoalProgress = selectedGoal.progress || 0;
    const intelligenceCore = makeTopologyNode({
      id: 'goals-core', cluster: 'goals', core: true, role: 'hub', visualKind: 'ai-core', title: 'AI Synthesis',
      detail: `${goalProfiles.length} goals are continuously coordinated here.`,
      source: 'Weeple AI OS',
      reason: 'Authorized live data and confirmed memory are synthesized into support for each goal.',
      x: 34, y: 0, z: 0, radius: 11.8, strength: 100, showLabel: true
    });
    nodes.push(intelligenceCore);

    const goalCount = goalProfiles.length;
    const goalNodes = goalProfiles.map((goal, goalIndex) => {
      const selected = goalIndex === state.currentGoalIndex;
      const relativeIndex = (goalIndex - state.currentGoalIndex + goalCount) % goalCount;
      const goalPositions = [
        { x: -62, y: 0, z: 8 },
        { x: -2, y: -65, z: -10 },
        { x: 102, y: -38, z: 8 },
        { x: 104, y: 50, z: -7 },
        { x: 0, y: 68, z: 11 }
      ];
      const position = goalPositions[relativeIndex] || {
        x: 34 + Math.cos(relativeIndex / goalCount * Math.PI * 2) * 92,
        y: Math.sin(relativeIndex / goalCount * Math.PI * 2) * 68,
        z: Math.sin(relativeIndex * 1.7) * 10
      };
      const node = makeTopologyNode({
        id: `goal-${goalIndex}`, cluster: 'goals', role: 'goal', goalRole: 'goal', goalIndex,
        isSelectedGoal: selected, title: goal.title,
        detail: goal.description || `${goal.progress || 0}% of this goal is complete.`,
        source: 'User-confirmed goal',
        reason: 'This goal connects to the central intelligence core for continuous planning and support.',
        x: position.x, y: position.y, z: position.z,
        radius: selected ? 10.6 : 8.5, strength: 100, showLabel: true
      });
      nodes.push(node);
      connectNeurons(node, intelligenceCore, {
        primary: true, goalStructure: true, support: selected, reasoningPath: true, selectedPath: selected,
        curve: (relativeIndex - 2) * .045, speed: selected ? .52 : .18 + goalIndex * .012
      });
      return node;
    });

    goalNodes.forEach((goalNode) => {
      const goal = goalProfiles[goalNode.goalIndex];
      const outwardAngle = Math.atan2(goalNode.baseY - intelligenceCore.baseY, goalNode.baseX - intelligenceCore.baseX);
      const allEvidence = buildGoalEvidence(goal, [goalNode]);
      const visibleEvidence = [
        ...allEvidence.filter(item => item.kind === 'data').slice(0, 2),
        ...allEvidence.filter(item => item.kind === 'memory').slice(0, 1)
      ];
      visibleEvidence.forEach((item, evidenceIndex) => {
        const offset = (evidenceIndex - (visibleEvidence.length - 1) / 2) * .43;
        const evidenceAngle = outwardAngle + offset;
        const distance = goalNode.isSelectedGoal ? 48 + (evidenceIndex % 2) * 8 : 38 + (evidenceIndex % 2) * 6;
        const node = makeTopologyNode({
          id: `${item.kind}-goal-${goalNode.goalIndex}-${evidenceIndex}`, cluster: item.kind,
          role: 'evidence', evidenceType: item.kind, goalIndex: goalNode.goalIndex,
          title: item.title, detail: item.detail, source: item.source, freshness: item.freshness,
          permission: item.kind === 'data' ? 'Connected source · authorized' : 'Confirmed memory · user controlled',
          reason: `Connected to “${goal.title}” because ${item.reason}`,
          x: goalNode.baseX + Math.cos(evidenceAngle) * distance,
          y: goalNode.baseY + Math.sin(evidenceAngle) * distance * .78,
          z: goalNode.baseZ + (evidenceIndex - 1) * 9,
          isSelectedEvidence: goalNode.isSelectedGoal,
          radius: item.kind === 'memory' ? 6.4 : 5.9,
          strength: item.strength,
          showLabel: goalNode.isSelectedGoal
        });
        nodes.push(node);
        connectNeurons(node, goalNode, {
          primary: true, bridge: true, support: goalNode.isSelectedGoal, reasoningPath: true, selectedPath: goalNode.isSelectedGoal, evidenceType: item.kind,
          curve: item.kind === 'data' ? -.27 : .27,
          speed: goalNode.isSelectedGoal ? (item.kind === 'data' ? .58 : .4) : (item.kind === 'data' ? .22 : .16)
        });
      });
    });

    for (let index = 0; index < 120; index += 1) {
      dust.push({
        x: -260 + random() * 570, y: -155 + random() * 310, z: -125 + random() * 250,
        radius: .25 + random() * 1.05, alpha: .07 + random() * .19,
        phase: random() * Math.PI * 2
      });
    }
    if (topologyConnectionCount) topologyConnectionCount.textContent = String(edges.length).padStart(2, '0');
  }

  function makeTopologyNode(options) {
    const node = {
      core: false, showLabel: false, strength: 80, radius: 3, role: 'signal',
      phase: random() * Math.PI * 2, drift: .3 + random() * .7,
      membraneSeed: random() * Math.PI * 2, dendrites: 4 + Math.floor(random() * 3),
      fireRate: .22 + random() * .24, screen: { x: 0, y: 0, r: 0, z: 0 },
      ...options
    };
    node.baseX = node.x; node.baseY = node.y; node.baseZ = node.z;
    return node;
  }

  function buildGoalEvidence(goal, subgoalNodes) {
    const subgoals = subgoalNodes.map(node => node.title.toLowerCase());
    const chooseSubgoal = (text, fallback) => {
      const words = String(text).toLowerCase().split(/[^a-z0-9]+/).filter(word => word.length > 3);
      let bestIndex = fallback % Math.max(1, subgoals.length);
      let bestScore = -1;
      subgoals.forEach((subgoal, index) => {
        const score = words.reduce((total, word) => total + (subgoal.includes(word) ? 1 : 0), 0);
        if (score > bestScore) { bestScore = score; bestIndex = index; }
      });
      return bestIndex;
    };
    const looksLikeMemory = (item) => /memory|history|pattern|preference|habit|notes|confirmed/i.test(`${item.title || ''} ${item.source || ''}`);
    const observations = (goal.observations || []).slice(0, 6);
    const result = observations.map((observation, index) => {
      const kind = looksLikeMemory(observation) ? 'memory' : 'data';
      return {
        kind, title: observation.title, detail: observation.detail,
        source: observation.source || (kind === 'data' ? 'Connected source' : 'Long-term memory'),
        freshness: observation.time || (kind === 'data' ? 'Live' : 'Confirmed'),
        subgoalIndex: chooseSubgoal(`${observation.title} ${observation.detail}`, index),
        reason: kind === 'data' ? 'it changes the current situation around this work.' : 'it preserves a useful pattern or preference from earlier experience.',
        strength: 91 - index * 3, featured: index < 3
      };
    });
    const hasMemory = result.some(item => item.kind === 'memory');
    if (!hasMemory) {
      result.push({
        kind: 'memory', title: `${goal.category || 'Goal'} preferences`,
        detail: goal.description || `Confirmed context retained for ${goal.title}.`,
        source: 'User-confirmed goal brief', freshness: 'Confirmed', subgoalIndex: 0,
        reason: 'it keeps your intended outcome and constraints consistent over time.', strength: 88, featured: true
      });
    }
    const hasData = result.some(item => item.kind === 'data');
    if (!hasData) {
      result.unshift({
        kind: 'data', title: 'Current goal status', detail: `${goal.progress || 0}% of the confirmed plan is complete.`,
        source: 'Goal activity', freshness: 'Live', subgoalIndex: 0,
        reason: 'it shows what has changed since the plan was confirmed.', strength: 95, featured: true
      });
    }
    return result.slice(0, 8);
  }

  function resize() {
    state.width = window.innerWidth;
    state.height = Math.max(window.innerHeight, 600);
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  let goalPathSyncFrame = 0;
  function syncGoalCanvasPaths() {
    goalPathSyncFrame = 0;
    if (!goalCanvasLinks || !state.goalWorkspaceActive) return;
    const canvasRect = goalCanvasLinks.getBoundingClientRect();
    const core = reasoningSubgoalList.querySelector('.subgoal-path-ring');
    const targets = [...reasoningSubgoalList.querySelectorAll('.simple-subgoal')];
    if (!core || canvasRect.width < 10 || canvasRect.height < 10) return;
    const viewBox = goalCanvasLinks.viewBox.baseVal;
    const scaleX = viewBox.width / canvasRect.width;
    const scaleY = viewBox.height / canvasRect.height;
    const coreRect = core.getBoundingClientRect();
    const startX = (coreRect.right - canvasRect.left - 3) * scaleX;
    const startY = (coreRect.top + coreRect.height / 2 - canvasRect.top) * scaleY;
    goalJourneyPaths.forEach((path, index) => {
      const target = targets[index];
      const packet = goalJourneyPackets[index];
      if (!target) {
        path.style.opacity = '0';
        if (packet) packet.style.opacity = '0';
        return;
      }
      const targetRect = target.getBoundingClientRect();
      const endX = (targetRect.left - canvasRect.left + 2) * scaleX;
      const endY = (targetRect.top + targetRect.height / 2 - canvasRect.top) * scaleY;
      const distance = Math.max(60, endX - startX);
      const controlA = startX + Math.min(170, distance * .43);
      const controlB = endX - Math.min(135, distance * .3);
      path.setAttribute('d', `M${startX.toFixed(1)} ${startY.toFixed(1)} C${controlA.toFixed(1)} ${startY.toFixed(1)} ${controlB.toFixed(1)} ${endY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`);
      path.style.opacity = '1';
      if (packet) packet.style.opacity = '1';
    });
  }

  function scheduleGoalCanvasPathSync() {
    if (goalPathSyncFrame) cancelAnimationFrame(goalPathSyncFrame);
    goalPathSyncFrame = requestAnimationFrame(syncGoalCanvasPaths);
  }

  function rotatePoint(point) {
    const cy = Math.cos(state.rotationY);
    const sy = Math.sin(state.rotationY);
    const cx = Math.cos(state.rotationX);
    const sx = Math.sin(state.rotationX);
    const x1 = point.x * cy - point.z * sy;
    const z1 = point.x * sy + point.z * cy;
    return {
      x: x1,
      y: point.y * cx - z1 * sx,
      z: point.y * sx + z1 * cx
    };
  }

  function project(point) {
    const rotated = rotatePoint({
      x: point.x - state.viewCenter.x,
      y: point.y - state.viewCenter.y,
      z: point.z - state.viewCenter.z
    });
    const perspective = 680 / (680 + rotated.z);
    const baseScale = Math.min(state.width / 1260, state.height / 720) * state.zoom;
    const mobileShift = state.goalWorkspaceActive
      ? .5
      : state.width < 700
        ? .66
        : (state.activeCluster === 'overview' ? .66 : .61);
    return {
      x: state.width * mobileShift + rotated.x * baseScale * perspective,
      y: state.height * .465 + rotated.y * baseScale * perspective,
      z: rotated.z,
      scale: baseScale * perspective
    };
  }

  function roundRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function renderAura(node, screen, intensity) {
    const style = visualStyle(node);
    const radius = (node.visualKind === 'ai-core' ? 48 : node.core ? 50 : node.isSelectedGoal ? 22 : 17) * screen.scale * intensity;
    if (![screen.x, screen.y, radius].every(Number.isFinite) || radius <= 0) return;
    const gradient = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, radius);
    gradient.addColorStop(0, `rgba(${style.rgb},${node.core ? .3 : .15})`);
    gradient.addColorStop(.25, `rgba(${style.rgb},${node.core ? .16 : .08})`);
    gradient.addColorStop(1, `rgba(${style.rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function traceOrganicMembrane(node, x, y, radius, detail = 1) {
    const pointCount = node.core ? 22 : (radius > 5 ? 16 : 11);
    const points = [];
    const livingTime = reduceMotion ? 0 : state.elapsed * (.48 + node.fireRate * .24);
    for (let index = 0; index < pointCount; index += 1) {
      const angle = index / pointCount * Math.PI * 2;
      const cellularNoise = Math.sin(index * 2.37 + node.membraneSeed) * .055
        + Math.sin(index * 4.13 + node.phase) * .027
        + Math.sin(livingTime + index * 1.71 + node.phase) * .018 * detail;
      const localRadius = radius * (1 + cellularNoise);
      points.push({ x: x + Math.cos(angle) * localRadius, y: y + Math.sin(angle) * localRadius });
    }
    const last = points[points.length - 1];
    const first = points[0];
    ctx.beginPath();
    ctx.moveTo((last.x + first.x) * .5, (last.y + first.y) * .5);
    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) * .5, (point.y + next.y) * .5);
    });
    ctx.closePath();
  }

  function renderCellDendrites(node, screen, radius, style, visibility, isHovered) {
    const branchCount = node.core ? (node.cluster === 'goals' ? 8 : 6) : (node.showLabel ? 4 : 2 + (node.id.charCodeAt(node.id.length - 1) % 2));
    ctx.save();
    ctx.globalAlpha = visibility * (isHovered ? .76 : node.core ? .46 : .28);
    ctx.lineCap = 'round';
    for (let branch = 0; branch < branchCount; branch += 1) {
      const angle = node.membraneSeed + branch * 2.399 + Math.sin(node.phase + branch * 3.1) * .31;
      const sway = reduceMotion ? 0 : Math.sin(state.elapsed * .24 + node.phase + branch * 1.7) * .035;
      const variation = .7 + ((Math.sin(node.membraneSeed * 3 + branch * 4.7) + 1) * .5) * .8;
      const branchLength = radius * (node.core ? 2.25 : node.showLabel ? 2.4 : 1.8) * variation;
      const startX = screen.x + Math.cos(angle) * radius * .82;
      const startY = screen.y + Math.sin(angle) * radius * .82;
      const endAngle = angle + sway + Math.sin(branch * 2.71 + node.phase) * .2;
      const endX = screen.x + Math.cos(endAngle) * (radius + branchLength);
      const endY = screen.y + Math.sin(endAngle) * (radius + branchLength);
      const tangentX = -Math.sin(angle);
      const tangentY = Math.cos(angle);
      const curve = Math.sin(branch * 2.73 + node.membraneSeed) * branchLength * .28;
      ctx.strokeStyle = `rgba(${style.rgb},${node.core ? .25 : .2})`;
      ctx.lineWidth = node.core ? .8 : Math.max(.38, radius * .055);
      ctx.shadowColor = style.color;
      ctx.shadowBlur = isHovered ? 5 : 0;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + Math.cos(angle) * branchLength * .3 + tangentX * curve,
        startY + Math.sin(angle) * branchLength * .3 + tangentY * curve,
        endX - Math.cos(endAngle) * branchLength * .32 - tangentX * curve * .4,
        endY - Math.sin(endAngle) * branchLength * .32 - tangentY * curve * .4,
        endX, endY
      );
      ctx.stroke();
      if (node.core || (node.showLabel && branch % 2 === 0)) {
        const twigLength = branchLength * .22;
        const twigStartX = startX + (endX - startX) * .7;
        const twigStartY = startY + (endY - startY) * .7;
        ctx.lineWidth = .4;
        ctx.strokeStyle = `rgba(${style.rgb},${node.core ? .17 : .13})`;
        ctx.beginPath();
        ctx.moveTo(twigStartX, twigStartY);
        ctx.lineTo(twigStartX + Math.cos(endAngle + (branch % 2 ? .48 : -.48)) * twigLength, twigStartY + Math.sin(endAngle + (branch % 2 ? .48 : -.48)) * twigLength);
        ctx.stroke();
      }
      if (node.core && branch % 2 === 0) {
        ctx.fillStyle = `rgba(${style.rgb},.34)`;
        ctx.beginPath();
        ctx.arc(endX, endY, .8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function renderNeuralCell(node, screen, radius, style, visibility, isHovered) {
    ctx.save();
    ctx.globalAlpha = visibility;
    if (!node.core) {
      const signalRadius = Math.max(1.05, radius * (node.showLabel ? .78 : .66));
      const signalGradient = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, signalRadius * 2.5);
      signalGradient.addColorStop(0, 'rgba(255,255,255,.98)');
      signalGradient.addColorStop(.22, `rgba(${style.rgb},.96)`);
      signalGradient.addColorStop(.58, `rgba(${style.rgb},.4)`);
      signalGradient.addColorStop(1, `rgba(${style.rgb},0)`);
      ctx.fillStyle = signalGradient;
      ctx.shadowColor = style.color;
      ctx.shadowBlur = isHovered ? 14 : node.showLabel ? 7 : 3;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, signalRadius * 2.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(${style.rgb},${node.showLabel ? .92 : .72})`;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, signalRadius, 0, Math.PI * 2);
      ctx.fill();
      if (node.showLabel || isHovered) {
        const telemetryRadius = signalRadius * 2.15;
        ctx.strokeStyle = `rgba(${style.rgb},${isHovered ? .55 : .22})`;
        ctx.lineWidth = .55;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, telemetryRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
      return;
    }
    const gradient = ctx.createRadialGradient(screen.x - radius * .34, screen.y - radius * .38, .15, screen.x, screen.y, radius * 1.08);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(node.core ? .16 : .1, `rgba(${style.rgb},1)`);
    gradient.addColorStop(.58, `rgba(${style.rgb},${node.core ? .96 : .88})`);
    gradient.addColorStop(1, `rgba(${style.rgb},${node.core ? .72 : .48})`);
    ctx.fillStyle = gradient;
    ctx.shadowColor = style.color;
    ctx.shadowBlur = node.core ? 28 : (isHovered ? 18 : 10);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255,255,255,${node.core ? .74 : .52})`;
    ctx.lineWidth = node.core ? 1.15 : .55;
    ctx.stroke();
    if (node.core || radius > 4.5) {
      ctx.fillStyle = `rgba(255,255,255,${node.core ? .92 : .68})`;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = node.core ? 9 : 4;
      ctx.beginPath();
      ctx.arc(screen.x - radius * .2, screen.y - radius * .22, Math.max(.65, radius * (node.core ? .12 : .09)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = `rgba(255,255,255,.25)`;
    ctx.lineWidth = .65;
    ctx.beginPath();
    for (let side = 0; side < 6; side += 1) {
      const angle = Math.PI / 3 * side - Math.PI / 6;
      const x = screen.x + Math.cos(angle) * radius * .62;
      const y = screen.y + Math.sin(angle) * radius * .62;
      if (side === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function renderHolographicNode(node, screen, radius, style, visibility, isHovered) {
    const phase = reduceMotion ? 0 : state.elapsed;
    ctx.save();
    ctx.globalAlpha = visibility;
    ctx.translate(screen.x, screen.y);

    if (!node.core) {
      const glyphType = node.role === 'goal' ? 'goal' : node.evidenceType || 'signal';
      const selected = node.isSelectedGoal || node.isSelectedEvidence;
      const breathing = reduceMotion ? 1 : 1 + Math.sin(phase * (glyphType === 'data' ? 1.7 : .86) + node.phase) * (selected ? .045 : .025);
      const unit = Math.max(2.2, radius * (node.role === 'goal' ? .9 : .82)) * breathing;
      const haloRadius = unit * (node.role === 'goal' ? 2.35 : 2.05);
      const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, haloRadius);
      halo.addColorStop(0, `rgba(${style.rgb},${selected ? .18 : .1})`);
      halo.addColorStop(.42, `rgba(${style.rgb},${selected ? .065 : .028})`);
      halo.addColorStop(1, `rgba(${style.rgb},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      if (glyphType === 'goal') {
        const ring = unit * 1.18;
        ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(${style.rgb},${isHovered ? .92 : selected ? .72 : .38})`;
        ctx.lineWidth = selected ? 1.55 : .95;
        ctx.shadowColor = style.color;
        ctx.shadowBlur = selected || isHovered ? 11 : 4;
        for (let arc = 0; arc < 4; arc += 1) {
          const start = arc * Math.PI / 2 + phase * .028;
          ctx.beginPath();
          ctx.arc(0, 0, ring, start, start + Math.PI * (selected ? .34 : .24));
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${style.rgb},${selected ? .22 : .13})`;
        ctx.lineWidth = .65;
        ctx.beginPath();
        ctx.arc(0, 0, ring * .72, 0, Math.PI * 2);
        ctx.stroke();
      } else if (glyphType === 'data') {
        ctx.save();
        ctx.rotate(Math.PI / 4 + phase * .018);
        ctx.fillStyle = `rgba(${style.rgb},${selected ? .12 : .06})`;
        ctx.strokeStyle = `rgba(${style.rgb},${isHovered ? .9 : selected ? .64 : .36})`;
        ctx.lineWidth = selected ? 1.25 : .8;
        ctx.shadowColor = style.color;
        ctx.shadowBlur = selected || isHovered ? 10 : 4;
        ctx.fillRect(-unit * .92, -unit * .92, unit * 1.84, unit * 1.84);
        ctx.strokeRect(-unit * .92, -unit * .92, unit * 1.84, unit * 1.84);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${style.rgb},.22)`;
        ctx.strokeRect(-unit * .5, -unit * .5, unit, unit);
        ctx.restore();
      } else if (glyphType === 'memory') {
        ctx.save();
        ctx.rotate(-phase * .016 + node.phase * .08);
        ctx.lineCap = 'round';
        const memoryRadii = [1.05, .76, .48];
        memoryRadii.forEach((factor, index) => {
          ctx.strokeStyle = `rgba(${style.rgb},${(selected ? .66 : .36) - index * .1})`;
          ctx.lineWidth = index === 0 ? 1.15 : .7;
          ctx.beginPath();
          ctx.arc(0, 0, unit * factor, index * .9, index * .9 + Math.PI * (1.28 - index * .12));
          ctx.stroke();
        });
        ctx.restore();
      }

      ctx.fillStyle = '#fff';
      ctx.shadowColor = style.color;
      ctx.shadowBlur = isHovered ? 15 : selected ? 10 : 5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.8, unit * .38), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = style.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(.85, unit * .18), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    const coreRadius = radius * .9;
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2.8);
    halo.addColorStop(0, `rgba(${style.rgb},.25)`);
    halo.addColorStop(.3, `rgba(${style.rgb},.08)`);
    halo.addColorStop(1, `rgba(${style.rgb},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.strokeStyle = `rgba(${style.rgb},.58)`;
    ctx.lineWidth = 1.1;
    ctx.shadowColor = style.color;
    ctx.shadowBlur = 17;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.save();
    ctx.rotate(phase * .055 + node.phase);
    ctx.strokeStyle = `rgba(${style.rgb},.72)`;
    ctx.lineWidth = 1.35;
    ctx.lineCap = 'round';
    for (let segment = 0; segment < 4; segment += 1) {
      const start = segment / 4 * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * .77, start, start + Math.PI * .3);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.rotate(Math.PI / 4 - phase * .018);
    ctx.strokeStyle = `rgba(${style.rgb},.48)`;
    ctx.lineWidth = .85;
    ctx.strokeRect(-coreRadius * .34, -coreRadius * .34, coreRadius * .68, coreRadius * .68);
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.shadowColor = style.color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(2.4, coreRadius * .17), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = style.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1.1, coreRadius * .07), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function quadraticPoint(a, control, b, progress) {
    const inverse = 1 - progress;
    return {
      x: inverse * inverse * a.x + 2 * inverse * progress * control.x + progress * progress * b.x,
      y: inverse * inverse * a.y + 2 * inverse * progress * control.y + progress * progress * b.y
    };
  }

  function renderBrainField() {
    const goalCore = nodes.find(node => node.id === 'goals-core');
    if (!goalCore || !Number.isFinite(goalCore.screen.x)) return;
    const goalNodes = nodes.filter(node => node.role === 'goal');
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    const radius = 104 * goalCore.screen.scale;
    const glow = ctx.createRadialGradient(goalCore.screen.x, goalCore.screen.y, 0, goalCore.screen.x, goalCore.screen.y, radius);
    glow.addColorStop(0, 'rgba(109,93,252,.095)');
    glow.addColorStop(.42, 'rgba(73,137,255,.028)');
    glow.addColorStop(1, 'rgba(255,94,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(goalCore.screen.x, goalCore.screen.y, radius, 0, Math.PI * 2);
    ctx.fill();

    goalNodes.forEach((goalNode, index) => {
      if (!Number.isFinite(goalNode.screen.x)) return;
      const branchGlow = ctx.createLinearGradient(goalNode.screen.x, goalNode.screen.y, goalCore.screen.x, goalCore.screen.y);
      branchGlow.addColorStop(0, 'rgba(255,255,255,0)');
      branchGlow.addColorStop(.54, goalNode.isSelectedGoal ? 'rgba(255,94,0,.055)' : 'rgba(109,93,252,.012)');
      branchGlow.addColorStop(1, goalNode.isSelectedGoal ? 'rgba(109,93,252,.075)' : 'rgba(109,93,252,.025)');
      ctx.strokeStyle = branchGlow;
      ctx.lineWidth = (goalNode.isSelectedGoal ? 18 : 8) * Math.max(.7, goalNode.screen.scale);
      ctx.beginPath();
      ctx.moveTo(goalNode.screen.x, goalNode.screen.y);
      ctx.quadraticCurveTo(
        (goalNode.screen.x + goalCore.screen.x) * .5,
        (goalNode.screen.y + goalCore.screen.y) * .5 + (index - (goalNodes.length - 1) / 2) * 3,
        goalCore.screen.x, goalCore.screen.y
      );
      ctx.stroke();
    });

    const contourRadius = 82 * goalCore.screen.scale;
    ctx.strokeStyle = 'rgba(109,93,252,.11)';
    ctx.lineWidth = .65;
    ctx.setLineDash([2, 9]);
    ctx.lineDashOffset = reduceMotion ? 0 : -state.elapsed * 2.5;
    ctx.beginPath();
    ctx.ellipse(goalCore.screen.x, goalCore.screen.y, contourRadius, contourRadius * .48, -.08, 0, Math.PI * 2);
    ctx.stroke();

    const scanX = goalCore.screen.x + Math.sin(reduceMotion ? 0 : state.elapsed * .18) * contourRadius * .72;
    const scanGradient = ctx.createLinearGradient(scanX, goalCore.screen.y - contourRadius * .45, scanX, goalCore.screen.y + contourRadius * .45);
    scanGradient.addColorStop(0, 'rgba(109,93,252,0)');
    scanGradient.addColorStop(.5, 'rgba(109,93,252,.12)');
    scanGradient.addColorStop(1, 'rgba(109,93,252,0)');
    ctx.strokeStyle = scanGradient;
    ctx.lineWidth = .7;
    ctx.beginPath();
    ctx.moveTo(scanX, goalCore.screen.y - contourRadius * .45);
    ctx.lineTo(scanX, goalCore.screen.y + contourRadius * .45);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  }

  function renderElectricalBurst(edge, a, b, controlX, controlY, style, edgeVisibility, active) {
    if (!active || edgeVisibility < .15 || reduceMotion) return;
    const burstGate = (state.elapsed * (.14 + edge.speed * .13) + edge.electricPhase) % 1;
    const duty = edge.selectedPath ? .86 : edge.reasoningPath ? .32 : edge.support ? .44 : edge.bridge ? .12 : edge.primary ? .08 : .04;
    if (burstGate > duty) return;
    const direction = edge.support || edge.polarity > 0 ? 1 : -1;
    const rawProgress = (state.elapsed * (edge.speed * 1.42) + edge.phase) % 1;
    const progress = direction > 0 ? rawProgress : 1 - rawProgress;
    const control = { x: controlX, y: controlY };
    const segments = edge.selectedPath ? 15 : edge.reasoningPath ? 11 : edge.support ? 12 : edge.bridge ? 9 : 7;
    const trailLength = edge.selectedPath ? .16 : edge.reasoningPath ? .11 : edge.support ? .12 : .08;
    const points = [];
    for (let segment = 0; segment <= segments; segment += 1) {
      const trailPosition = segment / segments;
      const t = Math.max(0, Math.min(1, progress - direction * trailLength * (1 - trailPosition)));
      const point = quadraticPoint(a, control, b, t);
      const tangentAhead = quadraticPoint(a, control, b, Math.min(1, t + .004));
      const tangentX = tangentAhead.x - point.x;
      const tangentY = tangentAhead.y - point.y;
      const tangentLength = Math.max(1, Math.hypot(tangentX, tangentY));
      const jitter = segment === 0 || segment === segments ? 0 : Math.sin(segment * 8.73 + edge.electricPhase * 31) * (edge.support ? 1.25 : .7) * Math.sin(trailPosition * Math.PI);
      points.push({ x: point.x - tangentY / tangentLength * jitter, y: point.y + tangentX / tangentLength * jitter });
    }
    const destinationStyle = edge.support || edge.bridge ? visualStyle(edge.b) : style;
    const sourceRgb = style.rgb.split(',').map(Number);
    const destinationRgb = destinationStyle.rgb.split(',').map(Number);
    const packetRgb = blendRgb(sourceRgb, destinationRgb, progress);
    const packetColor = `rgb(${packetRgb.join(',')})`;
    const trace = () => {
      ctx.beginPath();
      points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    };
    ctx.save();
    ctx.globalAlpha = edgeVisibility;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = packetColor;
    ctx.shadowColor = packetColor;
    ctx.shadowBlur = edge.selectedPath ? 16 : edge.reasoningPath ? 10 : edge.support ? 12 : 7;
    ctx.lineWidth = edge.selectedPath ? 1.9 : edge.reasoningPath ? 1.15 : edge.support ? 1.45 : edge.bridge ? .9 : .65;
    trace();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.96)';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 5;
    ctx.lineWidth = edge.support ? .72 : .48;
    trace();
    ctx.stroke();
    const head = points[points.length - 1];
    ctx.fillStyle = '#fff';
    ctx.shadowColor = packetColor;
    ctx.shadowBlur = edge.support ? 20 : 13;
    ctx.beginPath();
    ctx.arc(head.x, head.y, edge.selectedPath ? 1.65 : edge.reasoningPath ? 1.12 : edge.support ? 1.35 : edge.bridge ? 1 : .72, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function renderLegacyCoreEffects(node) {
    const screen = node.screen;
    const style = visualStyle(node);
    const visibility = state.clusterVisibility[node.cluster];
    if (visibility < .01) return;
    const active = state.activeCluster === 'overview' || state.activeCluster === node.cluster;
    const energy = active ? 1 : .35;
    const scale = Math.max(.72, screen.scale);
    const direction = node.cluster === 'data' ? -1 : 1;
    const primaryCore = node.cluster === 'goals';
    const execution = primaryCore ? getExecutionLevel() : 0;
    const heartbeatPhase = (state.elapsed * 1.08) % 1;
    const heartbeat = primaryCore ? 1 + Math.exp(-Math.pow((heartbeatPhase - .08) * 15, 2)) * .13 + Math.exp(-Math.pow((heartbeatPhase - .24) * 19, 2)) * .07 : 1;

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.globalAlpha = energy * visibility;

    for (let ring = 0; ring < (primaryCore ? 4 : 3); ring += 1) {
      const spin = state.elapsed * (.17 + ring * .055) * direction + node.phase + ring * 1.8;
      const radiusX = (24 + ring * 10) * scale * (primaryCore ? 1.18 : 1) * heartbeat;
      const radiusY = (8 + ring * 4.2) * scale * (primaryCore ? 1.18 : 1) * heartbeat;
      ctx.save();
      ctx.rotate(spin);
      ctx.setLineDash(ring === 1 ? [2, 6] : [7, 9]);
      ctx.lineDashOffset = -state.elapsed * (6 + ring * 2) * direction;
      ctx.strokeStyle = `rgba(${style.rgb},${(primaryCore ? .31 : .24) - ring * .045})`;
      ctx.lineWidth = ring === 0 ? 1.2 : .75;
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const sparkAngle = spin + state.elapsed * (.55 + ring * .16) * direction;
      const sparkX = Math.cos(sparkAngle) * radiusX;
      const sparkY = Math.sin(sparkAngle) * radiusY;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, ring === 0 ? 2.1 : 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    const waveProgress = (state.elapsed * .27 + node.phase / (Math.PI * 2)) % 1;
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(${style.rgb},${(1 - waveProgress) * .18})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, (20 + waveProgress * 66) * scale, 0, Math.PI * 2);
    ctx.stroke();

    const bracketRadius = (primaryCore ? 70 : 51) * scale;
    ctx.strokeStyle = `rgba(${style.rgb},${primaryCore ? .26 : .17})`;
    ctx.lineWidth = .7;
    ctx.setLineDash([]);
    for (let quadrant = 0; quadrant < 4; quadrant += 1) {
      ctx.save();
      ctx.rotate(quadrant * Math.PI / 2 + state.elapsed * .018 * direction);
      ctx.beginPath();
      ctx.moveTo(bracketRadius - 8, -bracketRadius);
      ctx.lineTo(bracketRadius, -bracketRadius);
      ctx.lineTo(bracketRadius, -bracketRadius + 8);
      ctx.stroke();
      ctx.restore();
    }

    if (primaryCore) {
      const progress = .72;
      const progressRadius = 57 * scale * heartbeat;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(${style.rgb},.1)`;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(0, 0, progressRadius, -.5 * Math.PI, 1.5 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${style.rgb},${.66 + execution * .2})`;
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, progressRadius, -.5 * Math.PI, (-.5 + progress * 2) * Math.PI);
      ctx.stroke();
      const endAngle = (-.5 + progress * 2) * Math.PI;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(Math.cos(endAngle) * progressRadius, Math.sin(endAngle) * progressRadius, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '800 7px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = style.color;
      ctx.fillText(state.voiceActive ? 'LISTENING' : execution > .55 ? 'EXECUTING' : `${state.currentGoalProgress}% GOAL`, 0, progressRadius + 12 * scale);

      if (state.voiceActive) {
        const voiceRadius = 68 * scale;
        const bars = 42;
        ctx.lineCap = 'round';
        for (let bar = 0; bar < bars; bar += 1) {
          const angle = (bar / bars) * Math.PI * 2 - Math.PI / 2;
          const organic = .48 + .52 * Math.abs(Math.sin(bar * 1.73 + state.elapsed * 5.5));
          const length = (3 + state.voiceLevel * 24 * organic) * scale;
          const inner = voiceRadius + Math.sin(state.elapsed * 2.4 + bar * .45) * 1.5;
          ctx.strokeStyle = `rgba(139,92,246,${.28 + state.voiceLevel * .55})`;
          ctx.lineWidth = 1.3 + state.voiceLevel * 1.4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
          ctx.lineTo(Math.cos(angle) * (inner + length), Math.sin(angle) * (inner + length));
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function renderHolographicCoreEffects(node) {
    const screen = node.screen;
    const style = visualStyle(node);
    const visibility = state.clusterVisibility[node.cluster];
    if (visibility < .01) return;
    const active = state.activeCluster === 'overview' || state.activeCluster === node.cluster;
    const primary = node.cluster === 'goals' && node.visualKind !== 'ai-core';
    const synthesis = node.visualKind === 'ai-core';
    const direction = node.cluster === 'data' ? -1 : 1;
    const scale = Math.max(.72, screen.scale);
    const time = reduceMotion ? 0 : state.elapsed;
    const outerRadius = (synthesis ? 43 : primary ? 64 : 47) * scale;
    const middleRadius = outerRadius * .76;
    const activity = active ? 1 : .28;

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.globalAlpha = visibility * activity;
    ctx.lineCap = 'round';

    ctx.save();
    ctx.rotate(time * .055 * direction + node.phase);
    ctx.strokeStyle = `rgba(${style.rgb},${primary ? .38 : .25})`;
    ctx.lineWidth = primary ? 1.25 : .8;
    for (let segment = 0; segment < 8; segment += 1) {
      const start = segment / 8 * Math.PI * 2;
      const length = segment % 2 ? .17 : .1;
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius, start, start + Math.PI * length);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.rotate(-time * .08 * direction - node.phase * .4);
    ctx.setLineDash([1.5, 7]);
    ctx.lineDashOffset = -time * 2.5 * direction;
    ctx.strokeStyle = `rgba(${style.rgb},${primary ? .26 : .17})`;
    ctx.lineWidth = .65;
    ctx.beginPath();
    ctx.ellipse(0, 0, outerRadius * 1.08, outerRadius * .42, .16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(${style.rgb},.16)`;
    ctx.lineWidth = .65;
    ctx.beginPath();
    ctx.arc(0, 0, middleRadius, 0, Math.PI * 2);
    ctx.stroke();

    const scanAngle = time * .3 * direction + node.phase;
    const scanGradient = ctx.createLinearGradient(0, 0, Math.cos(scanAngle) * outerRadius, Math.sin(scanAngle) * outerRadius);
    scanGradient.addColorStop(0, `rgba(${style.rgb},.02)`);
    scanGradient.addColorStop(1, `rgba(${style.rgb},.48)`);
    ctx.strokeStyle = scanGradient;
    ctx.lineWidth = .85;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(scanAngle) * outerRadius, Math.sin(scanAngle) * outerRadius);
    ctx.stroke();

    const orbitCount = synthesis ? 3 : primary ? 4 : 3;
    for (let orbit = 0; orbit < orbitCount; orbit += 1) {
      const angle = time * (.32 + orbit * .08) * direction + node.phase + orbit * 2.1;
      const radiusX = outerRadius * (1.02 - orbit * .07);
      const radiusY = outerRadius * (.4 + orbit * .055);
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      ctx.fillStyle = orbit === 0 ? '#fff' : style.color;
      ctx.shadowColor = style.color;
      ctx.shadowBlur = orbit === 0 ? 13 : 8;
      ctx.beginPath();
      ctx.arc(x, y, orbit === 0 ? 1.8 : 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    for (let tick = 0; tick < 24; tick += 1) {
      const angle = tick / 24 * Math.PI * 2;
      const tickLength = tick % 6 === 0 ? 6 : tick % 3 === 0 ? 3.5 : 1.8;
      const inner = outerRadius + 5;
      ctx.strokeStyle = `rgba(${style.rgb},${tick % 6 === 0 ? .33 : .14})`;
      ctx.lineWidth = tick % 6 === 0 ? .8 : .45;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * (inner + tickLength), Math.sin(angle) * (inner + tickLength));
      ctx.stroke();
    }

    const bracketRadius = outerRadius + 14;
    ctx.strokeStyle = `rgba(${style.rgb},${primary ? .28 : .18})`;
    ctx.lineWidth = .7;
    for (let quadrant = 0; quadrant < 4; quadrant += 1) {
      ctx.save();
      ctx.rotate(quadrant * Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(bracketRadius - 10, -bracketRadius);
      ctx.lineTo(bracketRadius, -bracketRadius);
      ctx.lineTo(bracketRadius, -bracketRadius + 10);
      ctx.stroke();
      ctx.restore();
    }

    const waveProgress = (time * .22 + node.phase / (Math.PI * 2)) % 1;
    ctx.strokeStyle = `rgba(${style.rgb},${(1 - waveProgress) * .16})`;
    ctx.lineWidth = .75;
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius * (.45 + waveProgress * .9), 0, Math.PI * 2);
    ctx.stroke();

    if (primary && node.role !== 'hub') {
      const progress = node.role === 'hub' ? 1 : Math.max(0, Math.min(100, state.currentGoalProgress)) / 100;
      const progressRadius = outerRadius + 2;
      ctx.strokeStyle = `rgba(${style.rgb},.1)`;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(0, 0, progressRadius, -Math.PI / 2, Math.PI * 1.5);
      ctx.stroke();
      ctx.strokeStyle = style.color;
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, progressRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = style.color;
      ctx.font = '800 7px Bahnschrift, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.voiceActive ? 'VOICE LINK' : node.role === 'hub' ? `${goalProfiles.length} GOALS LINKED` : `${state.currentGoalProgress}% GOAL`, 0, progressRadius + 13);
    }
    ctx.restore();
  }

  function renderCoreEffects(node) {
    const screen = node.screen;
    const style = visualStyle(node);
    const visibility = state.clusterVisibility[node.cluster];
    if (visibility < .01) return;
    const primaryCore = node.cluster === 'goals';
    const active = state.activeCluster === 'overview' || state.activeCluster === node.cluster;
    const activity = active ? 1 : .32;
    const heartbeatPhase = (state.elapsed * .88) % 1;
    const heartbeat = primaryCore ? 1 + Math.exp(-Math.pow((heartbeatPhase - .09) * 18, 2)) * .055 : 1;
    const baseRadius = screen.r * heartbeat;
    const firingPhase = (state.elapsed * node.fireRate + node.phase / (Math.PI * 2)) % 1;

    ctx.save();
    ctx.globalAlpha = visibility * activity;
    ctx.lineCap = 'round';

    const haloRadius = baseRadius * (primaryCore ? 1.68 : 1.55);
    ctx.strokeStyle = `rgba(${style.rgb},${primaryCore ? .2 : .12})`;
    ctx.lineWidth = primaryCore ? 1.1 : .7;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, haloRadius, 0, Math.PI * 2);
    ctx.stroke();

    if (primaryCore) {
      const progressStart = -Math.PI * .5;
      const progressEnd = progressStart + Math.PI * 2 * (state.currentGoalProgress / 100);
      ctx.strokeStyle = `rgba(${style.rgb},.11)`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, haloRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = style.color;
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, haloRadius + 5, progressStart, progressEnd);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(screen.x + Math.cos(progressEnd) * (haloRadius + 5), screen.y + Math.sin(progressEnd) * (haloRadius + 5), 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    if (firingPhase < .42) {
      const waveProgress = firingPhase / .42;
      const waveRadius = haloRadius + waveProgress * baseRadius * (primaryCore ? 2.6 : 1.7);
      ctx.strokeStyle = `rgba(${style.rgb},${Math.pow(1 - waveProgress, 2) * (primaryCore ? .18 : .1)})`;
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 6;
      ctx.lineWidth = .65;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (primaryCore && state.voiceActive) {
      const voiceRadius = haloRadius + 13;
      const bars = 32;
      for (let bar = 0; bar < bars; bar += 1) {
        const angle = bar / bars * Math.PI * 2 - Math.PI / 2;
        const response = .35 + .65 * Math.abs(Math.sin(bar * 1.73 + state.elapsed * 5.5));
        const length = 1.5 + state.voiceLevel * 13 * response;
        const inner = voiceRadius;
        ctx.strokeStyle = `rgba(139,92,246,${.16 + state.voiceLevel * .48})`;
        ctx.lineWidth = .8 + state.voiceLevel;
        ctx.beginPath();
        ctx.moveTo(screen.x + Math.cos(angle) * inner, screen.y + Math.sin(angle) * inner);
        ctx.lineTo(screen.x + Math.cos(angle) * (inner + length), screen.y + Math.sin(angle) * (inner + length));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function getLabelBox(node, screen) {
    const isCore = node.core;
    const isPrimary = isCore && node.cluster === 'goals';
    const labelText = node.role === 'goal' ? `GOAL · ${node.title}`
      : node.evidenceType === 'data' ? `LIVE DATA · ${node.title}`
      : node.evidenceType === 'memory' ? `MEMORY · ${node.title}` : node.title;
    ctx.save();
    ctx.font = `${isPrimary ? 740 : isCore ? 650 : 620} ${isPrimary ? 13 : isCore ? 11.5 : 8.5}px Bahnschrift, "Segoe UI", sans-serif`;
    const textWidth = ctx.measureText(labelText).width;
    ctx.restore();
    const width = Math.max(textWidth + (isCore ? 32 : 20), isPrimary ? 190 : 0);
    const height = isPrimary ? 46 : isCore ? 31 : 22;
    const preferredX = node.evidenceType === 'data'
      ? screen.x - width - 9
      : screen.x + (isCore ? 23 : 9);
    const x = Math.max(12, Math.min(state.width - width - 12, preferredX));
    const y = Math.max(84, Math.min(state.height - height - 118, screen.y - height / 2));
    return { x, y, width, height, isCore, isPrimary };
  }

  function labelBoxesOverlap(first, second) {
    const padding = 5;
    return first.x < second.x + second.width + padding
      && first.x + first.width + padding > second.x
      && first.y < second.y + second.height + padding
      && first.y + first.height + padding > second.y;
  }

  function renderLabel(node, screen, box = getLabelBox(node, screen)) {
    const style = visualStyle(node);
    const { x, y, width, height, isCore, isPrimary } = box;
    const text = node.role === 'goal' ? `GOAL · ${node.title}`
      : node.evidenceType === 'data' ? `LIVE DATA · ${node.title}`
      : node.evidenceType === 'memory' ? `MEMORY · ${node.title}` : node.title;
    ctx.save();
    ctx.font = `${isPrimary ? 740 : isCore ? 650 : 620} ${isPrimary ? 13 : isCore ? 11.5 : 8.5}px Bahnschrift, "Segoe UI", sans-serif`;
    ctx.shadowColor = 'rgba(17,24,39,.1)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = isCore ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.74)';
    ctx.strokeStyle = isCore ? `rgba(${style.rgb},${isPrimary ? .42 : .18})` : 'rgba(255,255,255,.72)';
    ctx.lineWidth = isPrimary ? 1.25 : 1;
    roundRect(x, y, width, height, isPrimary ? 11 : isCore ? 8 : 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.fillStyle = isCore ? '#111827' : '#555d69';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + (isCore ? 18 : 10), y + (isPrimary ? 16 : height / 2 + .5));
    if (isPrimary) {
      ctx.font = '750 6px Bahnschrift, "Segoe UI", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillStyle = style.color;
      ctx.fillText(
        state.goalWorkspaceActive
          ? 'USER-CONFIRMED GOAL'
          : (getExecutionLevel() > .55
            ? 'ACTION POTENTIAL \u00b7 EXECUTING'
            : 'AI SYNTHESIS · DATA + MEMORY → GOALS'),
        x + 18,
        y + 31
      );
    }
    if (isCore) {
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.arc(x + 8, y + (isPrimary ? 16 : height / 2), isPrimary ? 3 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function renderTouchRipples() {
    state.touchRipples = state.touchRipples.filter(ripple => state.elapsed - ripple.startedAt < 1.25);
    state.touchRipples.forEach((ripple) => {
      const progress = Math.max(0, Math.min(1, (state.elapsed - ripple.startedAt) / 1.15));
      const eased = 1 - Math.pow(1 - progress, 3);
      const radius = 12 + eased * 135;
      const opacity = Math.pow(1 - progress, 1.7);
      ctx.save();
      ctx.strokeStyle = `rgba(${ripple.rgb},${opacity * .34})`;
      ctx.shadowColor = `rgb(${ripple.rgb})`;
      ctx.shadowBlur = 13;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${ripple.rgb},${opacity * .16})`;
      ctx.lineWidth = .8;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, radius * .68, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function renderSignalArrivals() {
    if (reduceMotion) return;
    edges.forEach((edge) => {
      if (!edge.evidenceType || !edge.b?.screen) return;
      const progress = (state.elapsed * edge.speed + edge.phase) % 1;
      if (progress < .82) return;
      const arrival = (progress - .82) / .18;
      const opacity = Math.pow(1 - arrival, 1.7);
      const target = edge.b.screen;
      const style = palette[edge.evidenceType];
      const radius = (7 + arrival * 21) * Math.max(.75, target.scale);
      ctx.save();
      ctx.globalAlpha = opacity * state.clusterVisibility[edge.b.cluster];
      ctx.strokeStyle = style.color;
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 10 * opacity;
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(target.x, target.y, Math.max(.8, 1.8 * opacity), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function draw(time) {
    topologyAnimationFrame = 0;
    if (!shouldRenderTopology()) return;
    const delta = Math.min(40, time - state.lastTime);
    state.lastTime = time;
    state.elapsed += delta * .001;
    const executionAmbient = getExecutionLevel() > .55;
    if (executionAmbient !== state.executionAmbient) {
      state.executionAmbient = executionAmbient;
      applyAmbientTheme();
      const liveTitle = document.getElementById('liveActivityTitle');
      const liveDetail = document.getElementById('liveActivityDetail');
      if (liveTitle && liveDetail) {
        liveTitle.textContent = executionAmbient ? 'Executing goal plan' : 'Goal plan recalibrated';
        liveDetail.textContent = executionAmbient ? 'Weeple is completing the next action' : '3 next actions prioritized for today';
      }
    }
    if (state.voiceActive) {
      let voiceTarget = .16 + Math.sin(state.elapsed * 5.2) * .07 + Math.sin(state.elapsed * 9.7) * .04;
      if (voiceAnalyser && voiceBuffer) {
        voiceAnalyser.getByteTimeDomainData(voiceBuffer);
        let energy = 0;
        for (let index = 0; index < voiceBuffer.length; index += 1) {
          const sample = (voiceBuffer[index] - 128) / 128;
          energy += sample * sample;
        }
        voiceTarget = Math.min(1, Math.sqrt(energy / voiceBuffer.length) * 4.8);
      }
      state.voiceLevel += (Math.max(.04, voiceTarget) - state.voiceLevel) * .2;
    } else {
      state.voiceLevel *= .86;
    }

    const autopilot = !state.dragging && !state.hoverNode && performance.now() >= state.autoResumeAt;
    if (!state.dragging) {
      state.rotationY += state.velocityY;
      state.rotationX += state.velocityX;
      state.velocityY *= .92;
      state.velocityX *= .92;
      if (autopilot && !reduceMotion) {
        const baseZoom = state.activeCluster === 'overview' ? 2.05 : 2.3;
        const zoomRange = state.activeCluster === 'overview' ? .1 : .14;
        state.targetRotationY += .000055 * delta;
        state.targetRotationX = state.autoBaseX + Math.sin(state.elapsed * .22) * .04;
        state.targetZoom = baseZoom + Math.sin(state.elapsed * .42) * zoomRange;
      }
    }
    state.rotationX += (state.targetRotationX - state.rotationX) * .055;
    state.rotationY += (state.targetRotationY - state.rotationY) * .055;
    state.zoom += (state.targetZoom - state.zoom) * .07;
    state.viewCenter.x += (state.viewCenterTarget.x - state.viewCenter.x) * .07;
    state.viewCenter.y += (state.viewCenterTarget.y - state.viewCenter.y) * .07;
    state.viewCenter.z += (state.viewCenterTarget.z - state.viewCenter.z) * .07;
    state.rotationX = Math.max(-.72, Math.min(.72, state.rotationX));
    Object.keys(state.clusterVisibility).forEach((key) => {
      const current = state.clusterVisibility[key];
      const target = state.clusterVisibilityTarget[key];
      state.clusterVisibility[key] = current + (target - current) * .075;
    });

    ctx.clearRect(0, 0, state.width, state.height);

    dust.forEach((particle) => {
      const float = reduceMotion ? 0 : Math.sin(state.elapsed * .35 + particle.phase) * 2;
      const screen = project({ x: particle.x, y: particle.y + float, z: particle.z });
      if (screen.x < 0 || screen.x > state.width || screen.y < 60 || screen.y > state.height) return;
      ctx.fillStyle = `rgba(135,125,115,${particle.alpha * Math.max(.3, screen.scale)})`;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, particle.radius * screen.scale, 0, Math.PI * 2);
      ctx.fill();
    });

    nodes.forEach((node) => {
      const drift = node.core || reduceMotion ? 0 : Math.sin(state.elapsed * node.drift + node.phase) * 2.6;
      if (node.core || reduceMotion) {
        node.x = node.baseX;
        node.y = node.baseY + drift;
        node.z = node.baseZ;
      } else {
        const motionScale = node.role === 'evidence' ? 1.55 : node.role === 'goal' ? .82 : 1;
        const motionSpeed = node.evidenceType === 'data' ? 1.22 : node.evidenceType === 'memory' ? .72 : 1;
        const tissueBreath = Math.sin(state.elapsed * .42 * motionSpeed + node.phase) * (1.1 + node.drift * .7) * motionScale;
        node.x = node.baseX + Math.sin(state.elapsed * (.21 + node.drift * .08) * motionSpeed + node.phase) * 1.7 * motionScale;
        node.y = node.baseY + drift * .62 * motionScale + Math.cos(state.elapsed * (.18 + node.drift * .07) * motionSpeed + node.membraneSeed) * 1.35 * motionScale;
        node.z = node.baseZ + tissueBreath;
      }
      node.screen = project(node);
      node.screen.r = Math.max(node.core ? 10 : (node.showLabel ? 3.3 : 2), node.radius * node.screen.scale);
    });

    renderBrainField();

    edges.forEach((edge) => {
      const a = edge.a.screen;
      const b = edge.b.screen;
      const style = visualStyle(edge.a);
      const edgeVisibility = edge.bridge
        ? Math.min(state.clusterVisibility[edge.a.cluster], state.clusterVisibility[edge.b.cluster])
        : state.clusterVisibility[edge.a.cluster];
      if (edgeVisibility < .01) return;
      const active = state.activeCluster === 'overview' || state.activeCluster === edge.a.cluster || state.activeCluster === edge.b.cluster;
      const pathEmphasis = edge.selectedPath ? 1 : edge.reasoningPath ? .5 : edge.goalStructure ? .24 : .18;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const bend = edge.curve * Math.min(edge.bridge ? 34 : 13, distance * .15);
      const controlX = (a.x + b.x) * .5 - (dy / distance) * bend;
      const controlY = (a.y + b.y) * .5 + (dx / distance) * bend;
      if (edge.bridge) {
        const bridgeGradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        bridgeGradient.addColorStop(0, `rgba(${palette[edge.a.cluster].rgb},${(active ? .42 : .05) * edgeVisibility * pathEmphasis})`);
        bridgeGradient.addColorStop(1, `rgba(${palette[edge.b.cluster].rgb},${(active ? .42 : .05) * edgeVisibility * pathEmphasis})`);
        ctx.strokeStyle = bridgeGradient;
      } else {
        const destinationStyle = visualStyle(edge.b);
        const goalGradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        goalGradient.addColorStop(0, `rgba(${style.rgb},${(active ? .34 : .04) * edgeVisibility * pathEmphasis})`);
        goalGradient.addColorStop(1, `rgba(${destinationStyle.rgb},${(active ? .34 : .04) * edgeVisibility * pathEmphasis})`);
        ctx.strokeStyle = goalGradient;
      }
      ctx.lineWidth = edge.selectedPath ? 1.35 : edge.reasoningPath ? .82 : edge.support ? 1.05 : edge.bridge ? .72 : .52;
      ctx.setLineDash(edge.evidenceType === 'memory' ? [3, 5] : []);
      ctx.lineDashOffset = edge.evidenceType === 'memory' && !reduceMotion ? -state.elapsed * 2 : 0;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(controlX, controlY, b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      renderElectricalBurst(edge, a, b, controlX, controlY, style, edgeVisibility, active && (edge.reasoningPath || edge.support || pathEmphasis > .2));

      if (active && edgeVisibility > .15 && !reduceMotion && edge.reasoningPath) {
        const progress = (state.elapsed * edge.speed + edge.phase) % 1;
        const trailCount = edge.selectedPath ? 6 : edge.bridge ? 2 : 1;
        const sourceRgb = style.rgb.split(',').map(Number);
        const destinationStyle = visualStyle(edge.b);
        const destinationRgb = destinationStyle.rgb.split(',').map(Number);
        for (let trail = trailCount - 1; trail >= 0; trail -= 1) {
          const trailProgress = Math.max(0, progress - trail * .022);
          const inverse = 1 - trailProgress;
          const px = inverse * inverse * a.x + 2 * inverse * trailProgress * controlX + trailProgress * trailProgress * b.x;
          const py = inverse * inverse * a.y + 2 * inverse * trailProgress * controlY + trailProgress * trailProgress * b.y;
          const packetRgb = blendRgb(sourceRgb, destinationRgb, trailProgress);
          const packetColor = `rgb(${packetRgb.join(',')})`;
          const strength = 1 - trail / (trailCount + 1);
          ctx.globalAlpha = edgeVisibility * strength * (trail === 0 ? 1 : .42);
          ctx.fillStyle = packetColor;
          ctx.shadowColor = packetColor;
          ctx.shadowBlur = edge.support ? 14 : 9;
          ctx.beginPath();
          ctx.arc(px, py, (edge.selectedPath ? 2.5 : edge.bridge ? 1.35 : 1) * strength, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    });

    renderTouchRipples();
    renderSignalArrivals();
    nodes.filter(node => node.core).forEach(renderHolographicCoreEffects);

    const sorted = [...nodes].sort((a, b) => b.screen.z - a.screen.z);
    sorted.forEach((node) => {
      const screen = node.screen;
      if (![screen.x, screen.y, screen.r, screen.scale].every(Number.isFinite)) return;
      const visibility = state.clusterVisibility[node.cluster];
      if (visibility < .01) return;
      const style = visualStyle(node);
      const isHovered = node === state.hoverNode || node === state.selectedNode;
      const pulseDepth = node.core ? .1 : node.role === 'goal' ? .085 : node.role === 'evidence' ? .075 : .055;
      const pulseSpeed = node.evidenceType === 'data' ? 2.15 : node.evidenceType === 'memory' ? 1.05 : 1.65;
      const pulse = reduceMotion ? 1 : 1 + Math.sin(state.elapsed * pulseSpeed + node.phase) * pulseDepth;
      let touchBoost = 0;
      state.touchRipples.forEach((ripple) => {
        const rippleProgress = Math.max(0, Math.min(1, (state.elapsed - ripple.startedAt) / 1.15));
        const waveRadius = 12 + (1 - Math.pow(1 - rippleProgress, 3)) * 135;
        const nodeDistance = Math.hypot(screen.x - ripple.x, screen.y - ripple.y);
        touchBoost = Math.max(touchBoost, Math.max(0, 1 - Math.abs(nodeDistance - waveRadius) / 20));
      });

      ctx.globalAlpha = visibility;
      if (node.core || node.isSelectedGoal || isHovered) renderAura(node, screen, pulse);
      const heartbeatPhase = (state.elapsed * 1.08) % 1;
      const heartbeatNode = node.core || node.isSelectedGoal;
      const heartbeat = heartbeatNode
        ? 1 + Math.exp(-Math.pow((heartbeatPhase - .08) * 15, 2)) * (node.core ? .13 : .055) + Math.exp(-Math.pow((heartbeatPhase - .24) * 19, 2)) * (node.core ? .07 : .03)
        : 1;
      const voiceBoost = node.core && node.cluster === 'goals' ? 1 + state.voiceLevel * .12 : 1;
      const r = screen.r * pulse * heartbeat * voiceBoost * (isHovered ? 1.35 : 1) * (1 + touchBoost * .32);
      renderHolographicNode(node, screen, r, style, visibility, isHovered);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    const labelCandidates = sorted.filter((node) => {
      const visibility = state.clusterVisibility[node.cluster];
      const evidenceThreshold = node.isSelectedEvidence ? 2.08 : 2.2;
      const nodeEvidenceOpacity = Math.max(0, Math.min(1, (state.zoom - evidenceThreshold) / .13));
      const zoomRevealsEvidence = node.role === 'evidence' && nodeEvidenceOpacity > .04;
      const persistentGoalLabel = node.role === 'goal';
      return visibility > .15 && (node.core || ((persistentGoalLabel || zoomRevealsEvidence || node.showLabel) && state.width > 750 && (state.activeCluster === 'overview' || state.activeCluster === node.cluster)) || node === state.selectedNode);
    }).sort((a, b) => Number(b === state.selectedNode) - Number(a === state.selectedNode) || Number(b.core) - Number(a.core) || Number(b.role === 'goal') - Number(a.role === 'goal') || b.screen.z - a.screen.z);
    const occupiedLabels = [];
    labelCandidates.forEach((node) => {
      const box = getLabelBox(node, node.screen);
      const protectedLabel = node.core || node.role === 'goal' || node === state.selectedNode;
      if (!protectedLabel && occupiedLabels.some(existing => labelBoxesOverlap(existing, box))) return;
      const evidenceThreshold = node.isSelectedEvidence ? 2.08 : 2.2;
      const labelOpacity = node.role === 'evidence'
        ? Math.max(0, Math.min(1, (state.zoom - evidenceThreshold) / .13))
        : node.role === 'goal' && !node.isSelectedGoal ? .82 : 1;
      ctx.globalAlpha = state.clusterVisibility[node.cluster] * labelOpacity;
      renderLabel(node, node.screen, box);
      ctx.globalAlpha = 1;
      occupiedLabels.push(box);
    });

    const detailedNode = state.hoverNode || (state.selectedNode && !state.selectedNode.core ? state.selectedNode : null);
    if (detailedNode && !state.dragging) positionTooltip(detailedNode);
    topologyAnimationFrame = requestAnimationFrame(draw);
  }

  function getHitNode(x, y) {
    let result = null;
    let best = Infinity;
    nodes.forEach((node) => {
      if (state.clusterVisibility[node.cluster] < .15) return;
      const dx = node.screen.x - x;
      const dy = node.screen.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const threshold = Math.max(node.core ? 25 : 10, node.screen.r + 7);
      if (distance < threshold && distance < best) {
        result = node;
        best = distance;
      }
    });
    return result;
  }

  function positionTooltip(node) {
    tooltipTitle.textContent = node.title;
    tooltipType.textContent = node.core ? 'WEEPLE INTELLIGENCE CORE'
      : node.role === 'goal' ? 'GOAL'
      : node.evidenceType === 'data' ? 'PERSONAL DATA · LIVE EVIDENCE'
      : node.evidenceType === 'memory' ? 'LONG-TERM MEMORY · CONFIRMED CONTEXT'
      : node.role === 'task' ? 'EXECUTION TASK' : 'GOAL SIGNAL';
    tooltipStrength.textContent = node.strength;
    if (tooltipDetail) tooltipDetail.textContent = node.detail || 'A relevant signal connected to this goal.';
    if (tooltipSource) tooltipSource.textContent = `${node.source || 'Weeple intelligence'}${node.freshness ? ` · ${node.freshness}` : ''}${node.permission ? ` · ${node.permission}` : ''}`;
    if (tooltipReason) tooltipReason.textContent = node.reason || 'It contributes to the selected goal.';
    tooltip.style.setProperty('--tooltip-color', palette[node.cluster].color);
    tooltip.style.setProperty('--tooltip-shape', node.evidenceType === 'data' ? '2px' : '50%');
    const width = 345;
    let x = node.screen.x;
    let y = node.screen.y;
    if (x + width + 24 > state.width) x -= width + 35;
    y = Math.max(120, Math.min(state.height - 120, y));
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  topologyInputLayer.addEventListener('pointerdown', (event) => {
    const pos = pointerPosition(event);
    const touchedNode = getHitNode(pos.x, pos.y);
    const rippleStyle = touchedNode ? visualStyle(touchedNode) : (palette[state.activeCluster] || palette.goals);
    state.touchRipples.push({ x: pos.x, y: pos.y, rgb: rippleStyle.rgb, startedAt: state.elapsed });
    if (state.touchRipples.length > 5) state.touchRipples.shift();
    topologyInputLayer.setPointerCapture(event.pointerId);
    state.pointers.set(event.pointerId, pos);
    state.activePointer = event.pointerId;
    state.lastX = pos.x;
    state.lastY = pos.y;
    state.dragging = true;
    state.moved = false;
    state.autoResumeAt = performance.now() + 2600;
    dismissInteractionHint();
    if (event.pointerType !== 'mouse') haptic();
    if (state.pointers.size === 2) {
      const pts = [...state.pointers.values()];
      state.pinchDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  });

  topologyInputLayer.addEventListener('pointermove', (event) => {
    const pos = pointerPosition(event);
    if (state.pointers.has(event.pointerId)) state.pointers.set(event.pointerId, pos);

    if (state.pointers.size === 2) {
      const pts = [...state.pointers.values()];
      const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (state.pinchDistance) state.targetZoom = Math.max(1.2, Math.min(3.2, state.targetZoom * (distance / state.pinchDistance)));
      state.pinchDistance = distance;
      state.moved = true;
      hideTooltip();
      return;
    }

    if (state.dragging && event.pointerId === state.activePointer) {
      const dx = pos.x - state.lastX;
      const dy = pos.y - state.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) state.moved = true;
      state.targetRotationY += dx * .005;
      state.targetRotationX += dy * .004;
      state.velocityY = dx * .0004;
      state.velocityX = dy * .0003;
      state.lastX = pos.x;
      state.lastY = pos.y;
      hideTooltip();
      return;
    }

    if (event.pointerType === 'mouse') {
      state.hoverNode = getHitNode(pos.x, pos.y);
      topologyInputLayer.style.cursor = state.hoverNode ? 'pointer' : 'grab';
      if (state.hoverNode) {
        state.autoResumeAt = performance.now() + 900;
      } else {
        hideTooltip();
      }
    }
  });

  function endPointer(event) {
    const pos = pointerPosition(event);
    const wasTap = !state.moved && state.pointers.size === 1;
    state.pointers.delete(event.pointerId);
    state.dragging = state.pointers.size > 0;
    state.pinchDistance = 0;
    if (wasTap) {
      const hit = getHitNode(pos.x, pos.y);
      if (hit) {
        if (hit.role === 'goal' && Number.isInteger(hit.goalIndex)) {
          state.currentGoalIndex = hit.goalIndex;
          state.currentGoalProgress = goalProfiles[hit.goalIndex]?.progress || 0;
          nodes.filter(node => node.role === 'goal').forEach(node => { node.isSelectedGoal = node === hit; });
          nodes.filter(node => node.role === 'evidence').forEach(node => { node.showLabel = node.goalIndex === hit.goalIndex; });
        }
        state.selectedNode = hit;
        state.hoverNode = hit;
        positionTooltip(hit);
        haptic(10);
      } else {
        state.selectedNode = null;
        hideTooltip();
      }
    }
  }

  topologyInputLayer.addEventListener('pointerup', endPointer);
  topologyInputLayer.addEventListener('pointercancel', endPointer);
  topologyInputLayer.addEventListener('pointerleave', () => {
    if (!state.dragging) {
      state.hoverNode = null;
      state.autoResumeAt = performance.now() + 250;
      hideTooltip();
    }
  });
  topologyInputLayer.addEventListener('wheel', (event) => {
    event.preventDefault();
    state.autoResumeAt = performance.now() + 2600;
    state.targetZoom = Math.max(1.2, Math.min(3.2, state.targetZoom * (event.deltaY > 0 ? .92 : 1.08)));
    dismissInteractionHint();
  }, { passive: false });

  const focusAngles = {
    overview: { y: -.1, x: -.08, zoom: 2.05 },
    goals: { y: -.02, x: -.08, zoom: 2.36 },
    data: { y: .34, x: -.13, zoom: 2.3 },
    memory: { y: -.34, x: -.04, zoom: 2.3 }
  };

  const focusContent = {
    goals: {
      eyebrow: 'PRIMARY INTELLIGENCE',
      title: 'Goal Management',
      description: 'Turn your connected context into clear, achievable next actions.',
      actions: ['Review goal plan', 'Start next action', 'View milestones']
    },
    data: {
      eyebrow: 'CONNECTED CONTEXT',
      title: 'Personal Data',
      description: 'Control the sources and live signals supporting your active goals.',
      actions: ['Connect a source', 'Review permissions', 'Sync now']
    },
    memory: {
      eyebrow: 'ACTIVE AI WORKSPACE',
      title: 'Use Personal AI',
      description: 'Ask the AI to analyze, plan, or act with clear visibility into data, tools, and memory.',
      actions: ['Start a conversation', 'Review active tools', 'Manage long-term memory']
    }
  };

  const goalProfiles = [
    {
      title: 'Business Trip to Beijing Tomorrow', short: 'Beijing trip', status: 'Time-sensitive', progress: 34, scheduleOffset: 1, scheduledTime: '08:30',
      description: 'Arrive in Beijing safely and protect the morning client meeting despite changing travel conditions.',
      sources: 3, memories: 4, outputs: 2, tasks: 3, completed: 1, accent: '255,94,0',
      subgoals: [
        { name: 'Check-in for flight CA1832', done: 1, total: 1, state: 'Completed' },
        { name: 'Confirm hotel reservation in Chaoyang District', done: 0, total: 1, state: 'Needs action' },
        { name: 'Review schedule for morning client meeting', done: 0, total: 1, state: 'At risk' }
      ],
      taskLabels: ['Flight check-in', 'Hotel confirmation', 'Client meeting schedule'],
      recommendation: 'Move the trip to tonight or make the client meeting remote to reduce the weather-delay risk.',
      basis: ['Weather feed', 'Flight status', 'Calendar'],
      observations: [
        { type: 'weather', title: 'Weather warning', detail: 'Heavy rain and thunderstorm warning forecasted for Beijing Capital Airport (PEK) tomorrow morning.', source: 'Beijing weather feed', time: '2m ago' },
        { type: 'flight', title: 'Flight status', detail: 'Flight CA1832 currently shows a 75% delay probability due to weather.', source: 'Live flight tracker', time: 'Now' },
        { type: 'calendar', title: 'Calendar conflict', detail: 'Meeting scheduled at 10:00 AM immediately after the planned landing.', source: 'Work calendar', time: 'Live' }
      ],
      prediction: { probability: 82, risk: 'HIGH RISK', title: 'A flight delay is likely to cause a missed morning meeting in Beijing.', impact: 'Client meeting', window: 'Tomorrow · 10:00 AM', confidence: 'High confidence' },
      suggestions: [
        { id: 'earlier-flight', label: 'TRAVEL SAFEGUARD', title: "Reschedule to tonight's 8:30 PM departure to arrive before the rainstorm.", action: 'Reschedule Flight', updates: 0, options: ['8:30 PM', '10:10 PM', 'Compare all'] },
        { id: 'remote-meeting', label: 'SCHEDULE SAFEGUARD', title: 'Shift tomorrow’s 10:00 AM meeting to a remote video call.', action: 'Send Reschedule Request', updates: 2, options: ['Video call', 'Move to 2 PM', 'Draft only'] }
      ]
    },
    {
      title: 'Become a Better Self', short: 'Better self', status: 'On track', progress: 64, scheduleOffset: 0, scheduledTime: '09:00',
      description: 'Create sustainable progress across health, focused work, and continuous learning.',
      sources: 9, memories: 128, outputs: 7, tasks: 18, completed: 11, accent: '255,140,66',
      subgoals: [
        { name: 'Healthy living', done: 5, total: 7, state: 'Active' },
        { name: 'Healthy work', done: 4, total: 6, state: 'Active' },
        { name: 'Learning advancement', done: 2, total: 5, state: 'Planning' }
      ],
      taskLabels: ['Protect morning focus', 'Complete strength session', 'Review sleep pattern', 'Read for 30 minutes', 'Plan weekly reflection'],
      recommendation: 'Move tomorrow’s focus block 30 minutes earlier based on your recent energy pattern.',
      basis: ['Fitness', 'Calendar', '12 memories']
    },
    {
      title: 'Speak Spanish Confidently', short: 'Spanish fluency', status: 'Building momentum', progress: 48, scheduleOffset: 2, scheduledTime: '19:00',
      description: 'Reach conversational confidence through daily practice and real-world speaking sessions.',
      sources: 5, memories: 36, outputs: 4, tasks: 16, completed: 7, accent: '139,92,246',
      subgoals: [
        { name: 'Build daily vocabulary', done: 5, total: 7, state: 'Active' },
        { name: 'Practice live conversation', done: 1, total: 5, state: 'Needs action' },
        { name: 'Understand native media', done: 1, total: 4, state: 'Planning' }
      ],
      taskLabels: ['Review 20 phrases', 'Book conversation session', 'Listen to a short podcast', 'Record pronunciation sample'],
      recommendation: 'A compatible conversation partner is available Wednesday evening. Review before matching.',
      basis: ['Learning log', 'Availability', 'Goal history']
    },
    {
      title: 'Build Financial Resilience', short: 'Financial resilience', status: 'Needs review', progress: 37,
      description: 'Create a reliable safety buffer and make long-term spending decisions with confidence.',
      sources: 6, memories: 22, outputs: 3, tasks: 12, completed: 4, accent: '255,183,3',
      subgoals: [
        { name: 'Establish an emergency fund', done: 2, total: 5, state: 'Active' },
        { name: 'Understand recurring spending', done: 2, total: 4, state: 'Review' },
        { name: 'Create an investment routine', done: 0, total: 3, state: 'Planning' }
      ],
      taskLabels: ['Review monthly ledger', 'Confirm savings target', 'Classify recurring expenses', 'Draft investment checklist'],
      recommendation: 'Three recurring expenses changed this month. Review them before updating the savings plan.',
      basis: ['Family ledger', 'Transactions', '2 memories']
    },
    {
      title: 'Strengthen Family Connections', short: 'Family connections', status: 'Healthy', progress: 81,
      description: 'Stay meaningfully connected through shared time, thoughtful follow-up, and family rituals.',
      sources: 7, memories: 84, outputs: 6, tasks: 11, completed: 9, accent: '255,124,89',
      subgoals: [
        { name: 'Protect weekly family time', done: 4, total: 4, state: 'Completed' },
        { name: 'Stay present across distance', done: 3, total: 4, state: 'Active' },
        { name: 'Preserve shared memories', done: 2, total: 3, state: 'Active' }
      ],
      taskLabels: ['Confirm Sunday dinner', 'Call parents', 'Organize recent photos', 'Plan next family trip'],
      recommendation: 'Sunday afternoon is open for everyone. Review a proposed family plan before sending.',
      basis: ['Family calendar', 'Photos', '8 memories']
    }
  ];

  const goalIntelligence = {
    'Business Trip to Beijing Tomorrow': { category: 'Travel', updated: 'Live now' },
    'Become a Better Self': {
      category: 'Wellbeing', updated: '8m ago',
      observations: [
        { type: 'context', title: 'Recovery trend', detail: 'Average sleep is 42 minutes below your confirmed target this week.', source: 'Apple Fitness', time: '8m ago' },
        { type: 'calendar', title: 'Focus window', detail: 'Tomorrow has an open 90-minute block before the first meeting.', source: 'Calendar', time: 'Live' },
        { type: 'context', title: 'Work pattern', detail: 'Your strongest focus sessions occurred before 10:00 AM on four recent days.', source: 'Confirmed memory', time: 'Today' }
      ],
      prediction: { probability: 76, risk: 'OPPORTUNITY', title: 'Protecting the early focus window is likely to improve both work output and evening recovery.', impact: 'Energy balance', window: 'Tomorrow morning', confidence: 'Medium-high confidence' },
      suggestions: [
        { id: 'protect-focus', label: 'ENERGY ALIGNMENT', title: 'Protect tomorrow’s 8:30–10:00 AM window for the most important work.', action: 'Reserve Focus Block', updates: 1, options: ['8:00 AM', '8:30 AM', 'Choose time'] },
        { id: 'recovery-plan', label: 'RECOVERY SUPPORT', title: 'Move the strength session to 6:00 PM and set a 10:30 PM wind-down reminder.', action: 'Update Routine', updates: 0, options: ['5:30 PM', '6:00 PM', 'Draft only'] }
      ]
    },
    'Speak Spanish Confidently': {
      category: 'Learning', updated: '12m ago',
      observations: [
        { type: 'context', title: 'Practice streak', detail: 'Vocabulary practice is consistent, but live speaking occurred only once this week.', source: 'Learning log', time: 'Today' },
        { type: 'calendar', title: 'Available session', detail: 'Wednesday evening has a 45-minute open window for conversation practice.', source: 'Calendar', time: 'Live' },
        { type: 'context', title: 'Skill pattern', detail: 'Listening comprehension is improving faster than spontaneous speaking confidence.', source: 'Progress history', time: '12m ago' }
      ],
      prediction: { probability: 73, risk: 'PLATEAU RISK', title: 'Progress will likely plateau unless passive learning is converted into live speaking practice.', impact: 'Speaking confidence', window: 'Next 2 weeks', confidence: 'High confidence' },
      suggestions: [
        { id: 'book-speaking', label: 'ACTIVE PRACTICE', title: 'Book a 30-minute Spanish conversation session for Wednesday evening.', action: 'Book Practice', updates: 1, options: ['6:30 PM', '7:30 PM', 'Find partner'] },
        { id: 'micro-rehearsal', label: 'DAILY REINFORCEMENT', title: 'Add a five-minute spoken recap after each vocabulary session.', action: 'Add to Routine', updates: 0, options: ['After practice', 'Before lunch', 'Adjust plan'] }
      ]
    },
    'Build Financial Resilience': {
      category: 'Finance', updated: '21m ago',
      observations: [
        { type: 'context', title: 'Savings pace', detail: 'This month’s emergency-fund contribution is 18% below the confirmed plan.', source: 'Family ledger', time: '21m ago' },
        { type: 'context', title: 'Recurring costs', detail: 'Three subscriptions increased or renewed during the current billing cycle.', source: 'Transactions', time: 'Today' },
        { type: 'calendar', title: 'Review due', detail: 'The monthly financial review is scheduled for Friday evening.', source: 'Calendar', time: 'Live' }
      ],
      prediction: { probability: 69, risk: 'PLAN DRIFT', title: 'At the current contribution pace, the emergency-fund milestone may be delayed by six weeks.', impact: 'Safety buffer', window: 'Next 3 months', confidence: 'Medium confidence' },
      suggestions: [
        { id: 'review-costs', label: 'SPENDING REVIEW', title: 'Review the three changed subscriptions before Friday’s plan update.', action: 'Open Cost Review', updates: 1, options: ['Review now', 'Friday 6 PM', 'Export list'] },
        { id: 'adjust-saving', label: 'MILESTONE RECOVERY', title: 'Draft a small weekly transfer increase to recover the original timeline.', action: 'Draft Adjustment', updates: 0, options: ['+5% weekly', '+10% weekly', 'Compare'] }
      ]
    },
    'Strengthen Family Connections': {
      category: 'Relationships', updated: '1h ago',
      observations: [
        { type: 'calendar', title: 'Shared availability', detail: 'Sunday afternoon is the only shared open window across the family calendar.', source: 'Family calendar', time: 'Live' },
        { type: 'context', title: 'Contact rhythm', detail: 'Two important family conversations have not had a follow-up this month.', source: 'Confirmed relationship memory', time: '1h ago' },
        { type: 'context', title: 'Recent moments', detail: 'Forty-two recent photos are ready to be organized into a shared memory.', source: 'Selected photos', time: 'Today' }
      ],
      prediction: { probability: 84, risk: 'POSITIVE WINDOW', title: 'A protected Sunday plan is highly likely to strengthen connection without disrupting other commitments.', impact: 'Shared family time', window: 'This Sunday', confidence: 'High confidence' },
      suggestions: [
        { id: 'family-plan', label: 'SHARED TIME', title: 'Draft a simple Sunday family plan using the shared afternoon window.', action: 'Review Family Plan', updates: 0, options: ['Lunch', 'Afternoon', 'Evening'] },
        { id: 'photo-memory', label: 'SHARED MEMORY', title: 'Prepare a private album from the 42 selected photos for family review.', action: 'Prepare Album', updates: 2, options: ['Last 30 days', 'This season', 'Select photos'] }
      ]
    }
  };
  goalProfiles.forEach(goal => Object.assign(goal, goalIntelligence[goal.title] || {}, { archived: false }));
  const deletedGoalTitles = new Set();
  let pendingGoalDeletion = null;
  let goalFormMode = 'create';
  let editingGoalIndex = -1;
  let goalSyncSequence = 0;
  let reasoningUpdateTimer = 0;
  let goalPlanListOpen = false;
  let goalPlanTaskDrawerOpen = false;
  let goalPlanTaskOwner = 'human';
  let goalPlanIntelDetail = null;
  let goalPlanShareOpen = false;
  let goalPlanMoreOpen = false;
  let goalPlanTransitionDirection = 0;
  let goalPlanTransitionTimer = 0;
  let goalPlanVisualEnter = false;
  let goalPlanTaskEditor = null;
  let goalPlanSubgoalEditor = null;
  let goalPlanFocusedTaskId = '';
  try {
    const savedDeletedGoals = JSON.parse(localStorage.getItem('weeple-deleted-goals') || '[]');
    if (Array.isArray(savedDeletedGoals)) savedDeletedGoals.forEach(title => deletedGoalTitles.add(String(title)));
  } catch (error) {
    // Goal deletion still works for the current session when storage is unavailable.
  }
  for (let index = goalProfiles.length - 1; index >= 0; index -= 1) {
    if (deletedGoalTitles.has(goalProfiles[index].title)) goalProfiles.splice(index, 1);
  }
  const pausedMonitoringGoalTitles = new Set();
  try {
    const savedPausedGoals = JSON.parse(localStorage.getItem('weeple-paused-goal-monitoring') || '[]');
    if (Array.isArray(savedPausedGoals)) savedPausedGoals.forEach(title => pausedMonitoringGoalTitles.add(String(title)));
  } catch (error) {
    // Monitoring controls remain available for the current session.
  }
  goalProfiles.forEach(goal => { goal.monitoringPaused = pausedMonitoringGoalTitles.has(goal.title); });
  try {
    const savedGoals = JSON.parse(localStorage.getItem('weeple-custom-goals') || '[]');
    if (Array.isArray(savedGoals)) savedGoals.filter(goal => goal && goal.title && Array.isArray(goal.subgoals)).forEach(goal => goalProfiles.push(goal));
  } catch (error) {
    // The workspace remains fully usable when device storage is unavailable.
  }
  try {
    const savedPlanOverrides = JSON.parse(localStorage.getItem('weeple-goal-plan-overrides') || '{}');
    goalProfiles.forEach(goal => {
      const savedSubgoals = savedPlanOverrides?.[goal.title];
      if (!goal.custom && Array.isArray(savedSubgoals) && savedSubgoals.length) goal.subgoals = savedSubgoals;
    });
  } catch (error) {
    // Confirmed plan edits remain available for the current session.
  }

  function persistCustomGoals() {
    try { localStorage.setItem('weeple-custom-goals', JSON.stringify(goalProfiles.filter(goal => goal.custom))); } catch (error) { /* storage is optional */ }
    try { if (__store) __store.emit('goals:changed', { goals: goalProfiles }); } catch (_e) { /* optional */ }
  }

  function persistGoalPlanOverrides() {
    try {
      const planOverrides = Object.fromEntries(goalProfiles.filter(goal => !goal.custom).map(goal => [goal.title, goal.subgoals]));
      localStorage.setItem('weeple-goal-plan-overrides', JSON.stringify(planOverrides));
    } catch (error) { /* storage is optional */ }
  }

  function persistDeletedGoals() {
    try { localStorage.setItem('weeple-deleted-goals', JSON.stringify([...deletedGoalTitles])); } catch (error) { /* storage is optional */ }
  }

  function persistMonitoringPreferences() {
    try { localStorage.setItem('weeple-paused-goal-monitoring', JSON.stringify([...pausedMonitoringGoalTitles])); } catch (error) { /* storage is optional */ }
  }

  const goalCategorySymbols = { Travel: 'TR', Wellbeing: 'WB', Learning: 'LN', Finance: 'FN', Relationships: 'FM', Project: 'PJ' };

  function buildAdaptiveGoalProfile(outcome, situation, constraints) {
    const intent = `${outcome} ${situation} ${constraints}`.toLowerCase();
    let category = 'Project';
    if (/learn|study|language|skill|course|exam|practice/.test(intent)) category = 'Learning';
    else if (/health|fitness|run|sleep|weight|workout|wellbeing/.test(intent)) category = 'Wellbeing';
    else if (/travel|trip|flight|visit|vacation|journey/.test(intent)) category = 'Travel';
    else if (/money|finance|saving|budget|invest|debt|expense/.test(intent)) category = 'Finance';
    else if (/family|friend|relationship|partner|parent/.test(intent)) category = 'Relationships';

    const templates = {
      Learning: {
        subgoals: ['Define the target skill level', 'Build a repeatable practice routine', 'Test the skill in a real situation'],
        prediction: 'Progress is possible, but consistency and active practice will determine the learning curve.',
        impact: 'Skill development',
        suggestions: [
          { id: 'learning-baseline', label: 'LEARNING BASELINE', title: 'Complete a short baseline check so the practice plan starts at the right level.', action: 'Start Baseline', updates: 0, options: ['5 minutes', '15 minutes', 'Choose test'] },
          { id: 'learning-routine', label: 'PRACTICE DESIGN', title: 'Reserve three small practice windows instead of one long weekly session.', action: 'Draft Routine', updates: 1, options: ['Morning', 'Evening', 'Choose days'] }
        ]
      },
      Wellbeing: {
        subgoals: ['Confirm the wellbeing baseline', 'Choose one sustainable daily behavior', 'Review recovery and progress weekly'],
        prediction: 'A small repeatable behavior is more likely to remain sustainable than a high-intensity first plan.',
        impact: 'Sustainable wellbeing',
        suggestions: [
          { id: 'health-baseline', label: 'SAFE START', title: 'Confirm your current routine and constraints before changing intensity.', action: 'Review Baseline', updates: 0, options: ['Activity', 'Sleep', 'Full review'] },
          { id: 'health-routine', label: 'DAILY BEHAVIOR', title: 'Draft one low-friction daily behavior aligned with your available time.', action: 'Draft Routine', updates: 1, options: ['10 minutes', '20 minutes', 'Choose time'] }
        ]
      },
      Travel: {
        subgoals: ['Confirm dates and destination', 'Secure transport and accommodation', 'Prepare schedule and contingency plan'],
        prediction: 'Travel readiness depends on timing, reservations, and live conditions that have not been authorized yet.',
        impact: 'Travel readiness',
        suggestions: [
          { id: 'travel-details', label: 'TRIP FOUNDATION', title: 'Confirm the date, destination, and non-negotiable arrival time.', action: 'Confirm Details', updates: 0, options: ['Add dates', 'Add destination', 'Add both'] },
          { id: 'travel-context', label: 'LIVE TRAVEL CONTEXT', title: 'Connect only the calendar and travel sources needed for disruption monitoring.', action: 'Choose Sources', updates: 2, options: ['Calendar', 'Travel only', 'Review access'] }
        ]
      },
      Finance: {
        subgoals: ['Define the financial target', 'Understand the current cash-flow baseline', 'Create a reviewable contribution plan'],
        prediction: 'The target cannot be forecast reliably until the amount, timeline, and starting baseline are confirmed.',
        impact: 'Financial timeline',
        suggestions: [
          { id: 'finance-target', label: 'TARGET CLARITY', title: 'Confirm the target amount and desired completion date.', action: 'Set Target', updates: 0, options: ['Amount', 'Date', 'Set both'] },
          { id: 'finance-baseline', label: 'PRIVATE BASELINE', title: 'Choose whether to enter a summary manually or authorize a selected ledger.', action: 'Choose Baseline', updates: 1, options: ['Enter manually', 'Select ledger', 'Not now'] }
        ]
      },
      Relationships: {
        subgoals: ['Clarify the connection you want to strengthen', 'Protect meaningful shared time', 'Create a thoughtful follow-up rhythm'],
        prediction: 'Consistent, intentional contact is likely to matter more than increasing the number of reminders.',
        impact: 'Relationship quality',
        suggestions: [
          { id: 'relationship-intent', label: 'HUMAN INTENT', title: 'Describe what meaningful connection would look like for this relationship.', action: 'Clarify Intent', updates: 0, options: ['Shared time', 'Follow-up', 'Both'] },
          { id: 'relationship-time', label: 'SHARED TIME', title: 'Find one suitable window without exposing private calendar details.', action: 'Check Availability', updates: 1, options: ['This week', 'Weekend', 'Choose range'] }
        ]
      },
      Project: {
        subgoals: ['Clarify measurable success', 'Build the first useful milestone', 'Review evidence and adjust the plan'],
        prediction: 'The first milestone is achievable, but timing confidence depends on scope and available capacity.',
        impact: 'First milestone',
        suggestions: [
          { id: 'project-success', label: 'SUCCESS CRITERIA', title: 'Define one measurable result that proves this goal is moving forward.', action: 'Define Result', updates: 0, options: ['This week', 'This month', 'Choose date'] },
          { id: 'project-milestone', label: 'FIRST MILESTONE', title: 'Draft the smallest useful milestone that can produce evidence quickly.', action: 'Draft Milestone', updates: 1, options: ['1 week', '2 weeks', 'Custom'] }
        ]
      }
    };
    const template = templates[category];
    const contextSummary = situation || constraints || 'Only the confirmed goal title is available so far.';
    return {
      title: outcome, short: outcome.slice(0, 24), category, updated: 'Created now', archived: false, custom: true,
      status: 'Awaiting context', progress: 0, description: situation || `A new ${category.toLowerCase()} goal.`,
      sources: 0, memories: 0, outputs: 1, tasks: 3, completed: 0, accent: category === 'Learning' ? '139,92,246' : category === 'Wellbeing' ? '16,185,129' : category === 'Finance' ? '255,183,3' : category === 'Relationships' ? '255,124,89' : '255,94,0',
      subgoals: template.subgoals.map(name => ({ name, done: 0, total: 1, state: 'Proposed', origin: 'ai', confirmed: false })),
      taskLabels: template.subgoals,
      recommendation: template.suggestions[0].title,
      basis: ['Goal description', situation ? 'Current situation' : 'Situation not supplied', constraints ? 'Confirmed constraints' : 'No constraints supplied'],
      observations: [
        { type: 'context', title: 'Confirmed goal brief', detail: contextSummary, source: 'User-confirmed input', time: 'Now' },
        { type: 'calendar', title: 'Schedule not connected', detail: 'No calendar context is used until you explicitly authorize it for this goal.', source: 'Permission boundary', time: 'Private' },
        { type: 'context', title: `${category} context needed`, detail: `Weeple can improve this ${category.toLowerCase()} forecast after you choose the minimum useful source.`, source: 'AI context audit', time: 'Optional' }
      ],
      prediction: { probability: 56, risk: 'EARLY INFERENCE', title: template.prediction, impact: template.impact, window: 'After first review', confidence: 'Low-medium confidence' },
      suggestions: template.suggestions
    };
  }

  function getGoalUpdateStatus(goal) {
    const unresolved = (goal.suggestions || []).filter(suggestion => !suggestion.decision).length;
    if (/time-sensitive|needs review|at risk/i.test(goal.status || '')) return { key: 'attention', label: 'Action required', today: true };
    if (goal.monitoringPaused) return { key: 'paused', label: 'Monitoring paused', today: false };
    if (unresolved && /Wellbeing|Learning|Project/.test(goal.category || '')) return { key: 'updated', label: 'AI updated plan', today: true };
    if (unresolved) return { key: 'decision', label: `${unresolved} decision${unresolved === 1 ? '' : 's'} ready`, today: true };
    return { key: 'quiet', label: 'No new changes', today: false };
  }

  function renderGoalCollection() {
    const query = state.goalSearch.toLowerCase();
    const visible = goalProfiles.map((goal, index) => ({ goal, index })).filter(({ goal }) => {
      if ((state.goalFilter === 'active' || state.goalFilter === 'today') && goal.archived) return false;
      if (state.goalFilter === 'today' && !getGoalUpdateStatus(goal).today) return false;
      return !query || `${goal.title} ${goal.category || ''}`.toLowerCase().includes(query);
    });
    goalCollectionCount.textContent = `${goalProfiles.length} goal${goalProfiles.length === 1 ? '' : 's'}`;
    const focusedGoal = goalProfiles[state.currentGoalIndex];
    if (focusedGoal && goalFocusPicker) {
      const focusedState = getGoalAIState(focusedGoal);
      goalFocusPosition.textContent = `Goal ${state.currentGoalIndex + 1} of ${goalProfiles.length}`;
      goalFocusTitle.textContent = focusedGoal.title;
      goalFocusStatus.textContent = focusedState.label;
      goalFocusPrevious.disabled = state.currentGoalIndex <= 0;
      goalFocusNext.disabled = state.currentGoalIndex >= goalProfiles.length - 1;
    }
    goalCollectionList.innerHTML = visible.length ? visible.map(({ goal, index }) => {
      const update = getGoalUpdateStatus(goal);
      const needsAttention = update.key === 'attention';
      const aiState = getGoalAIState(goal);
      return `<button class="goal-collection-item${index === state.currentGoalIndex ? ' active' : ''}${needsAttention ? ' needs-attention' : ''}" type="button" data-goal-select="${index}" data-goal-title="${escapeGoalText(goal.title)}" data-ai-state="${aiState.key}" style="--goal-accent:${goal.accent}" aria-label="Open ${escapeGoalText(goal.title)} · ${escapeGoalText(aiState.label)}"><i class="goal-simple-marker">${goalCategorySymbols[goal.category] || 'GO'}</i><span class="goal-collection-copy"><b>${escapeGoalText(goal.title)}</b><small>${escapeGoalText(aiState.label)}</small></span></button>`;
    }).join('') : '<p class="goal-library-empty">No goals match this search.</p>';
    goalCollectionList.querySelectorAll('[data-goal-select]').forEach(button => button.addEventListener('click', () => {
      selectGoal(Number(button.dataset.goalSelect));
      closeGoalPicker();
    }));
  }

  function closeGoalPicker() {
    goalLibrary?.classList.remove('picker-open');
    goalFocusPicker?.setAttribute('aria-expanded', 'false');
    goalPickerPanel?.setAttribute('aria-hidden', 'true');
  }

  function toggleGoalPicker(force) {
    const open = typeof force === 'boolean' ? force : !goalLibrary?.classList.contains('picker-open');
    goalLibrary?.classList.toggle('picker-open', open);
    goalFocusPicker?.setAttribute('aria-expanded', String(open));
    goalPickerPanel?.setAttribute('aria-hidden', String(!open));
    if (open) window.setTimeout(() => goalSearch?.focus(), 80);
  }

  function renderGoalRail() {
    goalRailList.innerHTML = goalProfiles.map((goal, index) => `
      <button class="goal-rail-item${index === state.currentGoalIndex ? ' active' : ''}" type="button" data-goal-index="${index}" style="--goal-rgb:${goal.accent}" aria-label="Open ${goal.title}" title="${goal.title}">
        <span class="rail-mini-map"><i></i><i></i><i></i><i></i><i></i></span>
        <small>${goal.progress}%</small>
      </button>
    `).join('');
    goalRailList.querySelectorAll('[data-goal-index]').forEach((button) => {
      button.addEventListener('click', () => selectGoal(Number(button.dataset.goalIndex)));
    });
  }

  function renderGoalInspector(goal) {
    const matchingSubgoal = goal.subgoals.find(subgoal => subgoal.collaboration) || goal.subgoals[goal.subgoals.length - 1];
    goalInspectorContent.innerHTML = `
      <header class="goal-detail-header">
        <span><i></i>EXAMPLE · USER-CONFIRMED GOAL</span>
        <small>${goal.status}</small>
        <h2>${goal.title}</h2>
        <p>${goal.description}</p>
      </header>
      <section class="goal-progress-summary">
        <div class="goal-progress-ring" style="--progress:${goal.progress}; --goal-rgb:${goal.accent}"><strong>${goal.progress}<small>%</small></strong></div>
        <div><small>CURRENT TRAJECTORY</small><strong>${goal.completed} of ${goal.tasks} tasks complete</strong><span>AI is preparing the next best action</span></div>
      </section>
      <section class="goal-metrics" aria-label="Goal context">
        <span><strong>${goal.sources}</strong><small>Data sources</small></span>
        <span><strong>${goal.memories}</strong><small>Memories</small></span>
        <span><strong>${goal.outputs}</strong><small>AI outputs</small></span>
      </section>
      <section class="goal-subgoals">
        <header><strong>Direct subgoals</strong><span>${goal.subgoals.length} active paths</span></header>
        ${goal.subgoals.map((subgoal, index) => `
          <button type="button" data-subgoal-index="${index}">
            <i>${index + 1}</i><span><strong>${subgoal.name}</strong><small>${subgoal.done}/${subgoal.total} execution tasks · ${subgoal.state}</small></span><b>${Math.round(subgoal.done / subgoal.total * 100)}%</b>
          </button>
        `).join('')}
      </section>
      <section class="goal-ai-proposal">
        <header><span><i></i>AI RECOMMENDATION</span><b>Needs confirmation</b></header>
        <p>${goal.recommendation}</p>
        <div class="proposal-basis"><small>BASED ON</small>${goal.basis.map(source => `<span>${source}</span>`).join('')}</div>
        <button class="goal-ai-review" type="button">Review recommendation <span>→</span></button>
      </section>
      <button class="goal-collaboration${matchingSubgoal.collaborationEnabled ? ' enabled' : ''}" type="button" data-collaboration-subgoal="${matchingSubgoal.name}">
        <span><i></i><b>Collaboration matching</b><small>${matchingSubgoal.name} · ${matchingSubgoal.collaborationEnabled ? 'De-identified matching is active' : 'Private until you opt in'}</small></span><em>${matchingSubgoal.collaborationEnabled ? 'On' : 'Off'}</em>
      </button>
      <button class="goal-primary-action" type="button">Open full goal plan <span>→</span></button>
    `;

    goalInspectorContent.querySelectorAll('[data-subgoal-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const subgoal = goal.subgoals[Number(button.dataset.subgoalIndex)];
        const node = nodes.find(candidate => candidate.cluster === 'goals' && candidate.title === subgoal.name);
        if (node) state.selectedNode = node;
        goalInspectorContent.querySelectorAll('[data-subgoal-index]').forEach(item => item.classList.toggle('active', item === button));
        __showToast(`${subgoal.name} selected`);
      });
    });
    goalInspectorContent.querySelector('.goal-ai-review').addEventListener('click', (event) => {
      const button = event.currentTarget;
      if (button.classList.contains('is-loading')) return;
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
      window.setTimeout(() => {
        button.classList.remove('is-loading');
        button.removeAttribute('aria-busy');
        __showToast('AI recommendation opened for your confirmation');
      }, 620);
    });
    goalInspectorContent.querySelector('.goal-collaboration').addEventListener('click', (event) => {
      const subgoal = event.currentTarget.dataset.collaborationSubgoal;
      collaborationSheet.dataset.subgoal = subgoal;
      if (matchingSubgoal.collaborationEnabled) {
        collaborationSheet.dataset.mode = 'candidate';
        collaborationTitle.textContent = 'Review a de-identified match?';
        collaborationDescription.textContent = `A potential collaborator complements “${subgoal}.” Identity remains hidden at this stage.`;
        consentRules.innerHTML = '<span><i>87%</i><b>Complementary goals</b><small>Wants real product experience while building product-management capability.</small></span><span><i>6h</i><b>Compatible availability</b><small>Six overlapping hours across the next two weeks.</small></span><span><i>01</i><b>Progressive disclosure</b><small>Expressing interest shares no identity or contact details until interest is mutual.</small></span>';
        collaborationCancel.textContent = 'Not now';
        collaborationConfirm.textContent = 'Express interest';
      } else {
        collaborationSheet.dataset.mode = 'opt-in';
        collaborationTitle.textContent = 'Open this subgoal to collaboration?';
        collaborationDescription.textContent = `Review what may be shared for “${subgoal}” before choosing to join private matching.`;
        consentRules.innerHTML = defaultConsentRules;
        collaborationCancel.textContent = 'Keep private';
        collaborationConfirm.textContent = 'Review & opt in';
      }
      collaborationSheet.classList.add('visible');
      collaborationSheet.setAttribute('aria-hidden', 'false');
      goalsWorkspace.classList.add('consent-open');
      collaborationClose.focus();
    });
    goalInspectorContent.querySelector('.goal-primary-action').addEventListener('click', () => __showToast('Full execution plan opened'));
  }

  function escapeGoalText(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  const observationIcons = {
    weather: '<svg viewBox="0 0 24 24"><path d="M7 17h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.2 1.5A3.3 3.3 0 0 0 7 17Z"/><path d="m8 20-1 2m5-2-1 2m5-2-1 2"/></svg>',
    flight: '<svg viewBox="0 0 24 24"><path d="m3 11 8-2 4-6 2 1-2 6 5 2c1 .4 1.3 1.4.6 2.1-.3.3-.8.5-1.3.4L14 14l-4 6-2-1 2-6-6-.5Z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18"/></svg>',
    context: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>'
  };

  const subgoalDraftsByCategory = {
    Travel: ['Protect the arrival contingency', 'Prepare a fallback communication plan'],
    Learning: ['Create a real-world practice checkpoint', 'Schedule an evidence-based progress review'],
    Wellbeing: ['Protect a sustainable recovery window', 'Review the routine against current energy'],
    Finance: ['Create a milestone recovery option', 'Review changes affecting the confirmed target'],
    Relationships: ['Prepare a meaningful follow-up', 'Protect the next shared availability window'],
    Project: ['Validate the next milestone with evidence', 'Resolve the highest-impact dependency']
  };

  function goalPlanSlug(value) {
    return String(value || 'goal').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 44) || 'goal';
  }

  function goalPlanDateKey(goal, dayOffset = 0) {
    if (goal?.scheduledDate) return goal.scheduledDate;
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + (Number.isInteger(goal?.scheduleOffset) ? goal.scheduleOffset : dayOffset));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function shiftGoalTime(time, minutes) {
    const [hour, minute] = String(time || '09:00').split(':').map(Number);
    const total = Math.max(0, Math.min(1439, (hour || 0) * 60 + (minute || 0) + minutes));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  function resolveGoalArtwork(goal) {
    const key = ['Travel', 'Wellbeing', 'Learning', 'Finance', 'Relationships', 'Project'].includes(goal?.category) ? goal.category.toLowerCase() : 'project';
    const descriptions = {
      travel: 'A prepared traveler approaching a modern airport at blue hour.',
      wellbeing: 'A calm morning wellbeing routine overlooking a garden.',
      learning: 'A focused learner practicing confidently in a modern study.',
      finance: 'A calm financial planning session in a refined home office.',
      relationships: 'A family sharing meaningful time in warm evening light.',
      project: 'A focused creator reviewing a tangible project prototype.'
    };
    return { url: `assets/goals/${key}.png`, alt: descriptions[key], key };
  }

  function goalPlanTasks(goal, owner) {
    ensureGoalCommandModel(goal);
    return goal.subgoals.flatMap((subgoal, subgoalIndex) => subgoal.executionTasks.map((task, taskIndex) => ({ task, subgoal, subgoalIndex, taskIndex })))
      .filter(entry => !owner || entry.task.owner === owner);
  }

  function goalPlanTaskMoment(task) {
    return task.owner === 'ai' ? task.startsAt : task.dueAt;
  }

  function formatGoalPlanMoment(value, includeDate = true) {
    if (!value) return 'Schedule needed';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value).replace('T', ' ');
    const date = new Intl.DateTimeFormat(undefined, includeDate ? { month: 'short', day: 'numeric' } : {}).format(parsed);
    const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(parsed);
    return includeDate ? `${date} · ${time}` : time;
  }

  function goalPlanCountdown(goal) {
    const target = new Date(`${goalPlanDateKey(goal)}T${goal?.scheduledTime || '23:59'}`);
    const difference = target.getTime() - Date.now();
    if (!Number.isFinite(difference)) return 'Date ready';
    if (difference <= 0) return 'Due now';
    const hours = Math.ceil(difference / 3600000);
    if (hours < 24) return `${hours}h left`;
    const days = Math.ceil(hours / 24);
    return `${days}d left`;
  }

  function deriveGoalObservations(goal) {
    const observations = [...(goal.observations || [])];
    const existingTitles = new Set(observations.map(item => item.title));
    if (Number.isInteger(goal.scheduleOffset) && goal.scheduleOffset <= 1 && !existingTitles.has('Deadline proximity')) {
      observations.push({ type: 'calendar', title: 'Deadline proximity', detail: 'The target window is close enough that timing now has a stronger influence on the plan.', source: 'Goal schedule', time: 'Live', influence: 86 });
    }
    if (Number(goal.sources || 0) >= 8 && !existingTitles.has('Context coverage')) {
      observations.push({ type: 'context', title: 'Context coverage', detail: `${goal.sources} authorized sources are contributing current context to this goal.`, source: 'Authorized sources', time: 'Now', influence: 54 });
    }
    if (goal.category === 'Finance' && !existingTitles.has('Constraint pressure')) {
      observations.push({ type: 'context', title: 'Constraint pressure', detail: 'The confirmed budget and timeline are narrowing the available recovery options.', source: 'Goal constraints', time: 'Current', influence: 63 });
    }
    return observations.slice(0, 6);
  }

  function syncPredictionSuggestions(goal) {
    goal.suggestions = Array.isArray(goal.suggestions) ? goal.suggestions : [];
    const suggestionId = `${goal.id}-prediction-move`;
    const existingIndex = goal.suggestions.findIndex(item => item.id === suggestionId);
    const probability = Number(goal.prediction?.probability || 0);
    const shouldAdd = probability >= 80 || (probability > 0 && probability < 70);
    if (!shouldAdd) {
      if (existingIndex >= 0) goal.suggestions.splice(existingIndex, 1);
      return;
    }
    const direction = probability >= 80 ? 'momentum' : 'review';
    const templates = {
      Travel: { label: 'BACKUP PATH', action: 'Prepare Backup', momentum: 'Prepare a backup route while the strongest travel window is still open.', review: 'Add a short travel check before the next booking decision.' },
      Wellbeing: { label: 'DAILY RHYTHM', action: 'Set Daily Cue', momentum: 'Turn the strongest healthy pattern into one repeatable daily cue.', review: 'Add a gentle progress check before changing the routine.' },
      Learning: { label: 'SKILL CHECK', action: 'Plan Skill Check', momentum: 'Use the current learning momentum in one real practice challenge.', review: 'Schedule a short skill check before adjusting the learning plan.' },
      Finance: { label: 'PLAN CHECK', action: 'Schedule Review', momentum: 'Protect the current financial momentum with a simple review checkpoint.', review: 'Add a short financial review before the forecast window closes.' },
      Relationships: { label: 'CONNECTION CUE', action: 'Protect Moment', momentum: 'Protect one meaningful shared moment while availability is strong.', review: 'Choose one simple check-in to strengthen the current connection rhythm.' },
      Project: { label: 'MILESTONE CHECK', action: 'Review Milestone', momentum: 'Use the current momentum to prepare the next visible milestone.', review: 'Add a quick project review before committing more time.' }
    };
    const template = templates[goal.category] || templates.Project;
    const generated = { id: suggestionId, label: template.label, title: template[direction], action: template.action, updates: Math.max(0, goal.openSubgoalIndex || 0), options: ['Today', 'Tomorrow', 'Choose time'], predictionGenerated: true };
    if (existingIndex >= 0) Object.assign(goal.suggestions[existingIndex], generated);
    else goal.suggestions.push(generated);
  }

  function ensureGoalCommandModel(goal) {
    goal.id = goal.id || `goal-${goalPlanSlug(goal.title)}`;
    goal.category = goal.category || 'Project';
    goal.outcome = goal.outcome || goal.description || goal.title;
    goal.currentSituation = goal.currentSituation || goal.description || 'AI is establishing the current baseline.';
    goal.constraints = goal.constraints || (goal.category === 'Travel' ? 'Timing, safety, and confirmed reservations' : 'User-confirmed time, privacy, and resource limits');
    goal.taskLabels = Array.isArray(goal.taskLabels) ? goal.taskLabels : [];
    goal.draftSubgoals = Array.isArray(goal.draftSubgoals) ? goal.draftSubgoals : [];
    syncPredictionSuggestions(goal);
    goal.subgoals.forEach((subgoal, subgoalIndex) => {
      subgoal.id = subgoal.id || `${goal.id}-subgoal-${subgoalIndex + 1}-${goalPlanSlug(subgoal.name)}`;
      const total = Math.max(1, Number(subgoal.total) || 1);
      const completeCount = Math.max(0, Math.min(total, Number(subgoal.done) || 0));
      if (!Array.isArray(subgoal.executionTasks)) {
        const baseTask = goal.taskLabels?.[subgoalIndex] || `Advance ${subgoal.name}`;
        subgoal.executionTasks = Array.from({ length: total }, (_, taskIndex) => ({
          name: taskIndex === 0 ? baseTask : `${baseTask} - step ${taskIndex + 1}`,
          done: taskIndex < completeCount,
          state: taskIndex < completeCount ? 'Completed' : taskIndex === completeCount ? 'Ready now' : 'Queued'
        }));
      }
      const baseDate = goalPlanDateKey(goal, subgoalIndex);
      const baseTime = goal.scheduledTime || '09:00';
      subgoal.executionTasks.forEach((task, taskIndex) => {
        task.id = task.id || `${subgoal.id}-task-${taskIndex + 1}-${goalPlanSlug(task.name)}`;
        task.owner = task.owner === 'ai' ? 'ai' : 'human';
        if (task.owner === 'ai') {
          task.aiState = task.aiState || (task.done ? 'prepared' : 'queued');
          task.startsAt = task.startsAt || `${baseDate}T${shiftGoalTime(baseTime, subgoalIndex * 35 + taskIndex * 15)}`;
          task.expectedAt = task.expectedAt || `${baseDate}T${shiftGoalTime(baseTime, subgoalIndex * 35 + taskIndex * 15 + 45)}`;
          task.done = task.aiState === 'prepared';
        } else {
          task.dueAt = task.dueAt || `${baseDate}T${shiftGoalTime(baseTime, subgoalIndex * 45 + taskIndex * 25)}`;
          task.state = task.done ? 'Completed' : task.state || 'Ready now';
        }
      });
      if (!subgoal.aiSeeded && !subgoal.executionTasks.some(task => task.owner === 'ai')) {
        const aiReady = completeCount >= total;
        subgoal.executionTasks.push({
          id: `${subgoal.id}-ai-support`,
          name: `Prepare support for ${subgoal.name}`,
          owner: 'ai',
          aiState: aiReady ? 'prepared' : subgoalIndex === 0 ? 'running' : 'queued',
          done: aiReady,
          state: aiReady ? 'Completed' : subgoalIndex === 0 ? 'Working' : 'Queued',
          startsAt: `${baseDate}T${shiftGoalTime(baseTime, subgoalIndex * 45 - 20)}`,
          expectedAt: `${baseDate}T${shiftGoalTime(baseTime, subgoalIndex * 45 + 25)}`
        });
        subgoal.aiSeeded = true;
      }
      subgoal.origin = subgoal.origin === 'user' ? 'user' : 'ai';
      if (typeof subgoal.confirmed !== 'boolean') {
        const reviewStates = new Set(['Planning', 'Proposed', 'Needs action', 'At risk', 'Review']);
        subgoal.confirmed = subgoal.origin === 'user' || !reviewStates.has(subgoal.state);
      }
      subgoal.total = subgoal.executionTasks.length;
      subgoal.done = subgoal.executionTasks.filter(task => task.done).length;
      if (subgoal.done >= subgoal.total) subgoal.state = 'Completed';
    });
    if (!Number.isFinite(Number(goal.completedThisMonth))) {
      goal.completedThisMonth = goal.subgoals.reduce((total, subgoal) => total + subgoal.executionTasks.filter(task => task.done).length, 0);
    }
    const openSubgoal = goal.subgoals[goal.openSubgoalIndex];
    if (!Number.isInteger(goal.openSubgoalIndex) || !openSubgoal || openSubgoal.done >= openSubgoal.total) {
      const nextIndex = goal.subgoals.findIndex(subgoal => subgoal.done < subgoal.total);
      goal.openSubgoalIndex = nextIndex;
    }
  }

  function syncGoalTaskStats(goal) {
    ensureGoalCommandModel(goal);
    goal.subgoals.forEach(subgoal => {
      subgoal.total = subgoal.executionTasks.length;
      subgoal.done = subgoal.executionTasks.filter(task => task.done).length;
      subgoal.state = subgoal.done >= subgoal.total ? 'Completed' : subgoal.executionTasks.some(task => !task.done) ? 'Active' : subgoal.state;
    });
    const openSubgoal = goal.subgoals[goal.openSubgoalIndex];
    if (!openSubgoal || openSubgoal.done >= openSubgoal.total) {
      goal.openSubgoalIndex = goal.subgoals.findIndex(subgoal => subgoal.done < subgoal.total);
    }
  }

  function migrateGoalPlanStorage() {
    goalProfiles.forEach(ensureGoalCommandModel);
    persistCustomGoals();
    persistGoalPlanOverrides();
    try { localStorage.setItem('weeple-goal-plan-schema', '2'); } catch (error) { /* storage is optional */ }
  }
  migrateGoalPlanStorage();

  function renderGoalSupport(goal) {
    if (!goalSupportPanel) return;
    const observations = goal.observations || [];
    if (state.goalSupportView === 'related') {
      goalSupportPanel.innerHTML = `<div class="related-metrics"><span><strong>${goal.sources || observations.length}</strong><small>Connected sources</small></span><span><strong>${goal.outputs || 0}</strong><small>Prepared outputs</small></span><span><strong>${goal.memories || 0}</strong><small>Relevant memories</small></span></div>`;
      return;
    }
    if (state.goalSupportView === 'collaboration') {
      const eligibleIndex = goal.subgoals.findIndex(subgoal => subgoal.collaborationEnabled);
      const selectedIndex = eligibleIndex >= 0 ? eligibleIndex : Math.max(0, goal.subgoals.length - 1);
      const subgoal = goal.subgoals[selectedIndex];
      goalSupportPanel.innerHTML = subgoal ? `<div class="collaboration-summary"><span><b>${subgoal.collaborationEnabled ? 'Private matching is active' : 'Collaboration is opt-in'}</b><small>Only the direct subgoal "${escapeGoalText(subgoal.name)}" can be published. Identity stays hidden until interest is mutual.</small></span><button type="button" data-support-collaboration="${selectedIndex}">${subgoal.collaborationEnabled ? 'Review matches' : 'Review & opt in'}</button></div>` : '<div class="collaboration-summary"><span><b>No eligible subgoal yet</b><small>Confirm a direct subgoal before opening collaboration matching.</small></span></div>';
      return;
    }
    const unresolved = (goal.suggestions || []).filter(suggestion => !suggestion.decision).length;
    goalSupportPanel.innerHTML = `<div class="support-feed"><article class="support-item"><i></i><span><b>Monitoring ${goal.sources || observations.length} sources</b><small>Safe background work - automatic</small></span></article><article class="support-item complete"><i></i><span><b>Context analysis current</b><small>${escapeGoalText(goal.updated || 'Updated now')}</small></span></article><article class="support-item pending"><i></i><span><b>${unresolved} decision${unresolved === 1 ? '' : 's'} need review</b><small>External actions wait for approval</small></span></article></div>`;
  }

  function renderGoalMonitoringPopover(goal) {
    const observations = goal?.observations || [];
    goalMonitoringPopover.innerHTML = `<header><span><i></i><b>${goal.monitoringPaused ? 'Monitoring paused' : 'AI monitoring active'}</b></span><small>${goal.monitoringPaused ? 'No new signals are being processed for this goal.' : 'Only authorized sources support this goal.'}</small></header><div class="monitoring-source-list">${observations.slice(0, 3).map(observation => `<span><i></i><b>${escapeGoalText(observation.source)}</b><small>${escapeGoalText(observation.time)}</small></span>`).join('') || '<span><i></i><b>No source connected</b><small>Private by default</small></span>'}</div><footer><button type="button" data-monitoring-action="sources">Review sources</button><button class="monitoring-toggle" type="button" data-monitoring-action="toggle">${goal.monitoringPaused ? 'Resume monitoring' : 'Pause monitoring'}</button></footer>`;
  }

  function closeGoalMonitoringPopover() {
    goalMonitoringPopover.classList.remove('visible');
    goalMonitoringPopover.setAttribute('aria-hidden', 'true');
    goalMonitoringButton.setAttribute('aria-expanded', 'false');
  }

  function getSuggestionExecutionDetails(goal, suggestion) {
    const serviceBySuggestion = {
      'earlier-flight': 'Airline booking',
      'remote-meeting': 'Work calendar + email',
      'protect-focus': 'Work calendar',
      'recovery-plan': 'Calendar + reminders',
      'book-speaking': 'Calendar + learning partner',
      'micro-rehearsal': 'Learning routine',
      'review-costs': 'Selected family ledger',
      'adjust-saving': 'Private finance plan',
      'family-plan': 'Family calendar',
      'photo-memory': 'Selected photos'
    };
    const serviceByCategory = {
      Travel: 'Travel service', Learning: 'Learning workspace', Wellbeing: 'Health plan + calendar',
      Finance: 'Selected finance source', Relationships: 'Private calendar', Project: 'Project workspace'
    };
    const actionText = suggestion.selectedOption ? `${suggestion.action} · ${suggestion.selectedOption}` : suggestion.action;
    const external = /send|reschedule|book|reserve|update/i.test(actionText);
    return {
      action: actionText,
      service: suggestion.service || serviceBySuggestion[suggestion.id] || serviceByCategory[goal.category] || 'Weeple workspace',
      reversible: suggestion.reversible || (external ? 'Reviewable before final submission' : 'Yes · Undo remains available')
    };
  }

  function getGoalResultModel(goal) {
    const conciseTaskName = (name) => String(name || 'Goal action').replace(/\s+[–-]\s+step\s+\d+$/i, '').trim();
    const allTasks = goal.subgoals.flatMap((subgoal, subgoalIndex) => (subgoal.executionTasks || []).map(task => ({ ...task, subgoalIndex, subgoalName: subgoal.name })));
    const completedTasks = allTasks.filter(task => task.done);
    const pendingTasks = allTasks.filter(task => !task.done);
    const unresolvedSuggestions = (goal.suggestions || []).filter(suggestion => !suggestion.decision);
    const activeExecution = (goal.suggestions || []).find(suggestion => suggestion.decision === 'confirmed' && suggestion.executionState !== 'completed');
    const completedSubgoals = goal.subgoals.filter(subgoal => subgoal.done >= subgoal.total).length;
    const sourceCount = Number(goal.sources || (goal.observations || []).length || 0);
    const remainingCount = pendingTasks.length;
    const actionsThisMonth = Math.max(0, Number(goal.completedThisMonth ?? completedTasks.length));
    const prediction = goal.prediction || {};
    const primarySuggestion = unresolvedSuggestions[0];
    const targetSubgoal = primarySuggestion ? goal.subgoals[primarySuggestion.updates]?.name : pendingTasks[0]?.subgoalName;
    const categoryMotivation = {
      Travel: ['Your journey is getting safer.', 'Each confirmed step protects your arrival.'],
      Wellbeing: ['Your consistency is becoming a habit.', 'Small wins are building a stronger routine.'],
      Learning: ['Your confidence is growing.', 'Active practice is turning effort into skill.'],
      Finance: ['Your financial foundation is strengthening.', 'Each review makes the plan more resilient.'],
      Relationships: ['Your effort is creating connection.', 'Thoughtful follow-through keeps people close.']
    }[goal.category] || ['Your goal is moving forward.', 'Every confirmed step strengthens the plan.'];

    let motivation = categoryMotivation[0];
    let motivationDetail = categoryMotivation[1];
    let momentum = actionsThisMonth ? `${goal.progress}% · ${actionsThisMonth} action${actionsThisMonth === 1 ? '' : 's'} completed` : `${goal.progress}% · Ready to start`;
    if (goal.progress >= 100) {
      momentum = '100% · Goal achieved';
      motivation = 'You reached the outcome.';
      motivationDetail = 'Your completed work and results are ready to review.';
    } else if (activeExecution) {
      motivation = 'Weeple is moving this forward.';
      motivationDetail = `Weeple is ${activeExecution.executionState === 'executing' ? 'executing' : 'preparing'} the approved next move.`;
    } else if (unresolvedSuggestions.length) {
      motivationDetail = `${unresolvedSuggestions.length === 1 ? 'One useful decision is' : `${unresolvedSuggestions.length} useful decisions are`} ready for ${prediction.impact || 'the next milestone'}.`;
    } else if (completedTasks.length) {
      motivationDetail = goal.progress >= 70 ? `The ${prediction.impact || 'outcome'} is getting close.` : categoryMotivation[1];
    }

    const completedTitle = completedTasks.length ? conciseTaskName(completedTasks[completedTasks.length - 1].name) : 'Confirmed goal plan organized';
    const completedDetail = completedTasks.length
      ? `Result retained under ${completedTasks[completedTasks.length - 1].subgoalName}.`
      : `${goal.subgoals.length} AI-created subgoals are ready in your confirmed plan.`;
    const workingTitle = activeExecution
      ? `${activeExecution.executionState === 'executing' ? 'Executing' : 'Preparing'} ${activeExecution.action}`
      : goal.monitoringPaused ? 'Goal monitoring is paused' : `Monitoring ${sourceCount} authorized source${sourceCount === 1 ? '' : 's'}`;
    const workingDetail = activeExecution
      ? 'Progress will update automatically when the approved work completes.'
      : goal.monitoringPaused ? 'Resume monitoring when you want live context updates.' : 'AI is watching for changes that could affect this goal.';
    const nextTitle = unresolvedSuggestions[0]
      ? `${unresolvedSuggestions[0].action} is ready for your approval`
      : conciseTaskName(pendingTasks[0]?.name || 'Review the completed outcome');
    const nextDetail = unresolvedSuggestions[0]
      ? 'Nothing external happens until you confirm it.'
      : pendingTasks[0] ? `Next confirmed action under ${pendingTasks[0].subgoalName}.` : 'AI will preserve the results and supporting context.';

    return {
      allTasks, completedTasks, pendingTasks, unresolvedSuggestions, activeExecution, completedSubgoals, sourceCount, actionsThisMonth,
      momentum, motivation, motivationDetail,
      results: [
        { type: 'completed', label: 'MOMENTUM CREATED', title: actionsThisMonth ? `${actionsThisMonth} action${actionsThisMonth === 1 ? '' : 's'} moved this goal forward` : 'A confirmed path is ready to create momentum', detail: completedTasks.length ? (completedSubgoals ? `${completedSubgoals} finished milestone${completedSubgoals === 1 ? '' : 's'} and ${completedTasks.length} completed action${completedTasks.length === 1 ? '' : 's'} remain connected to the outcome.` : `${completedTasks.length} completed action${completedTasks.length === 1 ? '' : 's'} remain connected to the outcome.`) : completedDetail, state: actionsThisMonth ? 'This month' : 'Ready', symbol: '↗', rgb: '16,185,129', drawer: 'plan' },
        { type: 'working', label: 'VALUE PRESERVED', title: `${Number(goal.outputs || completedTasks.length || 1)} useful result${Number(goal.outputs || completedTasks.length || 1) === 1 ? '' : 's'} retained for this goal`, detail: `Plans, decisions, and context stay reusable instead of disappearing into an activity log.`, state: 'Retained', symbol: '◆', rgb: '139,92,246', drawer: 'activity' },
        { type: 'next', label: primarySuggestion ? 'NEXT LEVER READY' : 'OUTCOME PROTECTED', title: primarySuggestion ? `One decision can advance ${targetSubgoal || prediction.impact || 'the next milestone'} now` : `${sourceCount} authorized signals are protecting the confirmed plan`, detail: primarySuggestion ? `${prediction.probability || 'Current'}% context confidence · the highest-leverage option is prepared without taking control away from you.` : workingDetail, state: primarySuggestion ? 'Review' : 'Protected', symbol: '✦', rgb: '255,94,0', drawer: primarySuggestion ? 'reasoning' : 'sources' }
      ]
    };
  }

  function getGoalAIState(goal, model = null) {
    const resultModel = model || getGoalResultModel(goal);
    if (goal.progress >= 100) return { key: 'complete', label: 'Complete' };
    if (resultModel.activeExecution) return { key: 'working', label: 'Working' };
    if (goal.monitoringPaused) return { key: 'paused', label: 'Paused' };
    if (resultModel.unresolvedSuggestions.length) return { key: 'waiting', label: 'Waiting for you' };
    return { key: 'monitoring', label: 'Monitoring' };
  }

  function renderGoalResultsSurface(goal) {
    if (!goalResultStream || !goalPrimaryAction) return;
    const model = getGoalResultModel(goal);
    const observations = goal.observations || [];
    const primarySuggestion = model.unresolvedSuggestions[0];
    const primarySuggestionIndex = primarySuggestion ? goal.suggestions.indexOf(primarySuggestion) : -1;

    goalMomentumLabel.textContent = model.momentum;
    const aiState = getGoalAIState(goal, model);
    if (goalAIState) {
      goalAIState.dataset.state = aiState.key;
      goalAIState.innerHTML = `<i></i><b>${escapeGoalText(aiState.label)}</b>`;
    }
    goalMotivationMessage.textContent = model.motivation;
    goalMotivationDetail.textContent = model.motivationDetail;
    if (goalTrajectory) {
      goalTrajectory.style.setProperty('--trajectory', goal.progress);
      goalTrajectory.dataset.state = model.activeExecution ? 'working' : model.unresolvedSuggestions.length ? 'decision' : goal.progress >= 100 ? 'complete' : 'progress';
      goalTrajectory.setAttribute('aria-label', `${goal.progress}% of the goal journey complete. ${model.motivation}`);
    }
    goalResultsSummary.textContent = goal.updated || 'Updated now';
    const aiSubgoalCount = goal.subgoals.filter(subgoal => subgoal.origin !== 'user').length;
    const userSubgoalCount = goal.subgoals.length - aiSubgoalCount;
    const pendingSubgoalCount = goal.subgoals.filter(subgoal => subgoal.origin !== 'user' && subgoal.confirmed === false).length;
    goalPlanCount.textContent = pendingSubgoalCount
      ? `${pendingSubgoalCount} awaiting confirmation · ${goal.subgoals.length} total`
      : `${aiSubgoalCount} AI-created${userSubgoalCount ? ` · ${userSubgoalCount} yours` : ''}`;
    if (goalBriefSubgoalCount) goalBriefSubgoalCount.textContent = goal.subgoals.length;
    goalReasoningCount.textContent = `${observations.length} observation${observations.length === 1 ? '' : 's'}`;
    goalSourceCount.textContent = `${model.sourceCount} authorized`;

    const completedTask = model.completedTasks[model.completedTasks.length - 1];
    const completedName = completedTask ? String(completedTask.name).replace(/\s+[–-]\s+step\s+\d+$/i, '').trim() : 'Confirmed goal plan organized';
    const currentTitle = model.activeExecution
      ? `${model.activeExecution.executionState === 'executing' ? 'Completing' : 'Preparing'} ${model.activeExecution.action}`
      : goal.monitoringPaused ? 'AI monitoring is paused' : `Monitoring ${model.sourceCount} authorized sources`;

    const currentObservation = observations[0];
    const currentPrediction = goal.prediction || {};
    if (goalLogicGoalTitle) goalLogicGoalTitle.textContent = goal.title;
    if (goalLogicObservationTitle) goalLogicObservationTitle.textContent = currentObservation?.title || 'No important context change';
    if (goalLogicObservationMeta) goalLogicObservationMeta.textContent = currentObservation
      ? `${currentObservation.source || 'Authorized source'} · ${currentObservation.time || 'Current'}`
      : 'AI is still monitoring authorized context';
    if (goalLogicPredictionTitle) goalLogicPredictionTitle.textContent = currentPrediction.title || 'The current plan remains achievable';
    if (goalLogicPredictionMeta) goalLogicPredictionMeta.textContent = currentPrediction.probability
      ? `${currentPrediction.probability}% likelihood · ${currentPrediction.confidence || 'AI inference'}`
      : 'AI inference from current context';
    if (goalLogicDecisionTitle) goalLogicDecisionTitle.textContent = model.activeExecution
      ? model.activeExecution.action
      : primarySuggestion?.title || (model.pendingTasks[0]?.name || 'No decision is needed right now');
    if (goalLogicDecisionMeta) goalLogicDecisionMeta.textContent = model.activeExecution
      ? 'Approved · Weeple is working now'
      : primarySuggestion ? 'Ready for your approval' : 'Weeple will alert you when a decision matters';
    if (goalBriefHeadline) {
      goalBriefHeadline.textContent = model.activeExecution
        ? `${model.activeExecution.action} is now in progress.`
        : primarySuggestion
          ? (currentPrediction.title || 'Weeple found a useful improvement for your plan.')
          : 'Your goal is moving forward without needing your attention.';
    }
    if (goalBriefExplanation) {
      goalBriefExplanation.textContent = model.activeExecution
        ? 'You already approved this work. Weeple will update the goal when it is complete.'
        : currentObservation
          ? `Weeple noticed ${currentObservation.title.toLowerCase()} from ${currentObservation.source || 'an authorized source'} and prepared one useful next move.`
          : `Weeple is monitoring ${model.sourceCount} authorized source${model.sourceCount === 1 ? '' : 's'} and will only interrupt you when something matters.`;
    }
    if (goalLogicFlow) {
      goalLogicFlow.dataset.state = model.activeExecution ? 'working' : primarySuggestion ? 'decision' : 'monitoring';
    }

    goalResultStream.innerHTML = `<button class="goal-result-item completed" type="button" data-result-detail="activity" style="--result-rgb:16,185,129" aria-label="Done for you: ${escapeGoalText(completedName)}"><i class="goal-result-symbol">✓</i><span class="goal-result-copy"><small>DONE FOR YOU</small><b>${escapeGoalText(completedName)}</b><em>${completedTask ? 'Kept with this goal so you do not need to track it.' : 'The goal structure is ready.'}</em></span><strong>Open</strong></button>
      <button class="goal-result-item working" type="button" data-result-detail="sources" style="--result-rgb:139,92,246" aria-label="Working quietly: ${escapeGoalText(currentTitle)}"><i class="goal-result-symbol"></i><span class="goal-result-copy"><small>WORKING QUIETLY</small><b>${escapeGoalText(currentTitle)}</b><em>${model.activeExecution ? 'You will be updated when it is finished.' : 'You will only be interrupted when something matters.'}</em></span><strong>${model.activeExecution ? 'Working' : goal.monitoringPaused ? 'Paused' : 'Live'}</strong></button>`;

    if (primarySuggestion && !model.activeExecution) {
      const execution = getSuggestionExecutionDetails(goal, primarySuggestion);
      const prediction = goal.prediction || {};
      const targetSubgoal = goal.subgoals[primarySuggestion.updates]?.name || 'Current goal plan';
      const strongestObservation = observations[0];
      const whyNow = strongestObservation
        ? `${strongestObservation.title} changed the context. Weeple combined it with ${model.sourceCount} authorized source${model.sourceCount === 1 ? '' : 's'}${prediction.probability ? ` and a ${prediction.probability}% likelihood forecast` : ''}.`
        : `Weeple combined ${model.sourceCount} authorized source${model.sourceCount === 1 ? '' : 's'} to identify the highest-leverage next step.`;
      goalDecisionState.textContent = 'Your approval';
      goalPrimaryAction.innerHTML = `<article class="goal-result-action-card" data-result-suggestion-index="${primarySuggestionIndex}">
        <span>YOUR DECISION</span>
        <h2 id="goalPrimaryActionTitle">${escapeGoalText(primarySuggestion.title)}</h2>
        <p>Expected benefit: ${escapeGoalText(prediction.impact || targetSubgoal)}. <button class="goal-why-trigger" type="button" data-result-action="why" aria-expanded="false">Why this?<span>+</span></button></p>
        <div class="goal-why-now"><i></i><div><p>${escapeGoalText(whyNow)}</p><small>Uses ${escapeGoalText(execution.service)} · ${escapeGoalText(execution.reversible)}</small><button class="goal-adjust-link" type="button" data-result-action="adjust" aria-expanded="false">Adjust this option</button></div></div>
        <div class="goal-primary-adjuster">${(primarySuggestion.options || []).map(option => `<button type="button" data-result-option="${escapeGoalText(option)}">${escapeGoalText(option)}</button>`).join('')}</div>
        <div class="goal-primary-buttons"><button class="primary" type="button" data-result-action="confirm">${escapeGoalText(primarySuggestion.selectedOption ? `Confirm ${primarySuggestion.selectedOption}` : primarySuggestion.action)}</button></div>
      </article>`;
    } else if (model.activeExecution) {
      goalDecisionState.textContent = 'AI working';
      goalPrimaryAction.innerHTML = `<article class="goal-result-action-card working"><span>APPROVED WORK IN PROGRESS</span><h2 id="goalPrimaryActionTitle">${escapeGoalText(model.activeExecution.action)}</h2><p>Weeple is handling the approved work now. Progress and related results will update automatically.</p><div class="goal-primary-buttons quiet"><button type="button" data-result-action="activity">View AI activity</button><button type="button" data-result-action="plan">Goal plan</button></div></article>`;
    } else {
      goalDecisionState.textContent = 'No approval needed';
      const nextTask = model.pendingTasks[0];
      goalPrimaryAction.innerHTML = `<article class="goal-result-action-card"><span>${nextTask ? 'NEXT CONFIRMED ACTION' : 'CURRENT OUTCOME'}</span><h2 id="goalPrimaryActionTitle">${escapeGoalText(nextTask?.name || 'Your confirmed plan is complete')}</h2><p>${nextTask ? 'Continue when you are ready. AI will keep monitoring relevant changes in the background.' : 'Review the completed work, outputs, and supporting context whenever you need them.'}</p><div class="goal-primary-buttons quiet"><button type="button" data-result-action="plan">View goal plan</button><button type="button" data-result-action="activity">Activity</button></div></article>`;
    }
  }

  function renderGoalResultDrawer(type) {
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal || !goalResultDrawer) return;
    ensureGoalCommandModel(goal);
    const model = getGoalResultModel(goal);
    const observations = goal.observations || [];
    const titles = {
      plan: ['YOUR GOAL PLAN', 'View and edit subgoals'], reasoning: ['TRANSPARENT AI', 'Why this recommendation?'],
      activity: ['AI WORK LOG', 'Completed and current work'], sources: ['AUTHORIZED CONTEXT', 'Connected sources']
    };
    const [eyebrow, title] = titles[type] || titles.plan;
    goalResultDrawer.dataset.view = type;
    goalResultDrawerEyebrow.textContent = eyebrow;
    goalResultDrawerTitle.textContent = title;
    if (type === 'reasoning') {
      const prediction = goal.prediction || {};
      goalResultDrawerContent.innerHTML = `<div class="goal-detail-grid">${observations.map(observation => `<article class="goal-detail-card"><span>OBSERVATION · ${escapeGoalText(observation.time || 'Current')}</span><h3>${escapeGoalText(observation.title)}</h3><p>${escapeGoalText(observation.detail)}</p><footer>${escapeGoalText(observation.source)}</footer></article>`).join('')}<article class="goal-detail-card"><span>AI PREDICTION · ${escapeGoalText(prediction.confidence || 'Current')}</span><h3>${escapeGoalText(prediction.title || 'The plan remains achievable.')}</h3><p>${prediction.probability || 0}% likelihood · ${escapeGoalText(prediction.risk || 'Current forecast')}</p><footer>Impact: ${escapeGoalText(prediction.impact || 'Goal progress')}</footer></article></div>`;
    } else if (type === 'activity') {
      const activityCards = [...model.completedTasks.slice(-3).reverse().map(task => ({ label: 'COMPLETED', title: task.name, detail: task.subgoalName })), ...(model.activeExecution ? [{ label: 'WORKING NOW', title: model.activeExecution.action, detail: model.activeExecution.executionState }] : [{ label: goal.monitoringPaused ? 'PAUSED' : 'MONITORING', title: `${model.sourceCount} authorized sources`, detail: goal.monitoringPaused ? 'Live context is paused' : 'Watching for relevant changes' }])];
      goalResultDrawerContent.innerHTML = `<div class="goal-detail-grid">${activityCards.map(item => `<article class="goal-detail-card"><span>${escapeGoalText(item.label)}</span><h3>${escapeGoalText(item.title)}</h3><p>${escapeGoalText(item.detail)}</p></article>`).join('')}</div>`;
    } else if (type === 'sources') {
      goalResultDrawerContent.innerHTML = `<div class="goal-detail-grid">${observations.map(observation => `<article class="goal-detail-card"><span>AUTHORIZED SOURCE</span><h3>${escapeGoalText(observation.source)}</h3><p>${escapeGoalText(observation.title)}</p><footer>${escapeGoalText(observation.time || 'Current')} · Used only for this goal</footer></article>`).join('') || '<article class="goal-detail-card"><span>PRIVATE BY DEFAULT</span><h3>No connected source</h3><p>Choose the minimum useful context when you want more proactive support.</p></article>'}</div>`;
    } else {
      goalResultDrawerContent.innerHTML = `<section class="subgoal-manager-intro"><span><i></i>YOUR PLAN · YOU STAY IN CONTROL</span><h3>Direct subgoals</h3><p>Confirm AI suggestions individually, edit anything, or add a subgoal of your own.</p><div class="subgoal-manager-toolbar"><button class="subgoal-add-trigger" type="button" data-subgoal-add aria-expanded="false"><span>+</span>Add your own subgoal</button></div></section><form class="subgoal-add-form" data-subgoal-add-form><label for="newSubgoalName">New subgoal</label><input id="newSubgoalName" name="subgoalName" maxlength="120" placeholder="What else should this goal include?" autocomplete="off"><div><button class="save" type="submit">Add to my plan</button><button type="button" data-subgoal-add-cancel>Cancel</button></div></form><div class="subgoal-manager-list">${goal.subgoals.map((subgoal, index) => {
        const complete = subgoal.done >= subgoal.total;
        const progress = subgoal.total ? Math.round((subgoal.done / subgoal.total) * 100) : 0;
        const userCreated = subgoal.origin === 'user';
        const confirmed = userCreated || subgoal.confirmed !== false;
        const stateLabel = complete ? 'Completed' : !confirmed ? 'Needs confirmation' : escapeGoalText(subgoal.state || 'Active');
        return `<article class="subgoal-manager-card${!confirmed ? ' is-unconfirmed' : ''}${userCreated ? ' user-created' : ''}" data-subgoal-card="${index}"><header><span>${userCreated ? 'YOUR SUBGOAL' : `AI SUBGOAL ${String(index + 1).padStart(2, '0')}`}</span><em class="${complete ? 'complete' : !confirmed ? 'pending-confirmation' : ''}">${stateLabel}</em></header><div class="subgoal-manager-name"><h3>${escapeGoalText(subgoal.name)}</h3><div>${!confirmed ? `<button class="subgoal-confirm" type="button" data-subgoal-confirm="${index}">Confirm</button>` : ''}<button type="button" data-subgoal-edit="${index}">Edit</button><button type="button" data-subgoal-remove="${index}">Remove</button></div></div><form class="subgoal-edit-form" data-subgoal-form="${index}"><label for="subgoalEdit${index}">Subgoal name</label><input id="subgoalEdit${index}" value="${escapeGoalText(subgoal.name)}" maxlength="120"><div><button class="save" type="submit">Save changes</button><button type="button" data-subgoal-cancel="${index}">Cancel</button></div></form><div class="subgoal-manager-progress"><i style="--subgoal-progress:${progress}"></i><span>${subgoal.done} of ${subgoal.total} actions complete</span></div><footer><span>${userCreated ? 'Created by you' : 'AI-generated'}</span><i></i><span>${confirmed ? 'In your confirmed plan' : 'Waiting for your confirmation'}</span></footer></article>`;
      }).join('')}</div>`;
    }
    goalResultDrawer.classList.add('visible');
    goalResultDrawer.setAttribute('aria-hidden', 'false');
    goalResultDrawerClose.focus();
  }

  function closeGoalResultDrawer() {
    if (!goalResultDrawer) return;
    goalResultDrawer.classList.remove('visible');
    goalResultDrawer.setAttribute('aria-hidden', 'true');
  }

  function renderGoalTimeline(goal) {
    if (!goalTimeline) return;
    const unresolved = (goal.suggestions || []).filter(suggestion => !suggestion.decision).length;
    const planConfirmed = goal.subgoals.length > 0 && goal.subgoals.every(subgoal => subgoal.confirmed !== false);
    const hasContext = (goal.observations || []).length > 0 && Number(goal.sources || 0) > 0;
    const stages = [
      { label: 'Goal created', detail: 'User confirmed', complete: true },
      { label: planConfirmed ? 'AI plan confirmed' : 'AI plan awaiting review', detail: `${goal.subgoals.length} direct subgoals`, complete: planConfirmed },
      { label: hasContext ? 'Context changed' : 'Context needed', detail: hasContext ? (goal.updated || 'Updated now') : 'Connect a source', complete: hasContext },
      { label: unresolved ? 'Decision required' : 'Decision reviewed', detail: unresolved ? `${unresolved} approval${unresolved === 1 ? '' : 's'} ready` : 'No action pending', complete: unresolved === 0 }
    ];
    let currentAssigned = false;
    goalTimeline.innerHTML = stages.map((stage, index) => {
      let stateClass = 'done';
      if (!stage.complete && !currentAssigned) { stateClass = 'current'; currentAssigned = true; }
      else if (!stage.complete) stateClass = 'upcoming';
      if (index === stages.length - 1 && unresolved && !currentAssigned) { stateClass = 'current'; currentAssigned = true; }
      return `<li class="${stateClass}"><i>${stateClass === 'done' ? '✓' : String(index + 1).padStart(2, '0')}</i><span><b>${escapeGoalText(stage.label)}</b><small>${escapeGoalText(stage.detail)}</small></span></li>`;
    }).join('');
  }

  function renderGoalHardwareState(goal) {
    if (!goalHardwareState) return;
    const activeExecution = (goal.suggestions || []).find(suggestion => suggestion.executionState === 'preparing' || suggestion.executionState === 'executing');
    const sourceError = Number(goal.sources || 0) === 0 || !(goal.observations || []).length || (goal.observations || []).some(observation => /failed|error|not connected/i.test(`${observation.title} ${observation.detail}`));
    let hardwareState = { key: 'ready', title: 'Context current', detail: 'Authorized sources are available' };
    if (!navigator.onLine) hardwareState = { key: 'offline', title: 'Offline mode', detail: 'Using the last secure snapshot' };
    else if (state.goalSyncing === 'loading') hardwareState = { key: 'loading', title: 'Loading goal', detail: 'Restoring the latest workspace' };
    else if (state.goalSyncing === 'syncing') hardwareState = { key: 'syncing', title: 'Syncing context', detail: 'Checking authorized sources' };
    else if (activeExecution) hardwareState = { key: 'preparing', title: activeExecution.executionState === 'executing' ? 'AI action in progress' : 'AI is preparing', detail: activeExecution.action };
    else if (goal.monitoringPaused) hardwareState = { key: 'paused', title: 'Monitoring paused', detail: 'Live context is not updating' };
    else if (sourceError) hardwareState = { key: 'source-error', title: 'Source attention needed', detail: 'Connect the minimum useful context' };
    goalHardwareState.dataset.state = hardwareState.key;
    goalHardwareState.innerHTML = `<i></i><span><b>${escapeGoalText(hardwareState.title)}</b><small>${escapeGoalText(hardwareState.detail)}</small></span>`;
  }

  function renderGoalEdgeCues() {
    if (!goalPreviousCue || !goalNextCue) return;
    const previousGoal = goalProfiles[state.currentGoalIndex - 1];
    const nextGoal = goalProfiles[state.currentGoalIndex + 1];
    goalPreviousCue.hidden = !previousGoal;
    goalNextCue.hidden = !nextGoal;
    if (previousGoal) {
      goalPreviousCue.querySelector('small').textContent = previousGoal.short || previousGoal.title;
      goalPreviousCue.setAttribute('aria-label', `Previous goal: ${previousGoal.title}`);
    }
    if (nextGoal) {
      goalNextCue.querySelector('small').textContent = nextGoal.short || nextGoal.title;
      goalNextCue.setAttribute('aria-label', `Next goal: ${nextGoal.title}`);
    }
  }

  function renderGoalProposalInbox(goal) {
    if (!goalProposalInbox) return;
    if (!goal.draftSubgoals.length) {
      const totalTasks = goal.subgoals.reduce((total, subgoal) => total + subgoal.total, 0);
      const completedTasks = goal.subgoals.reduce((total, subgoal) => total + subgoal.done, 0);
      const remainingTasks = Math.max(0, totalTasks - completedTasks);
      goalProposalInbox.innerHTML = `<div class="plan-overview"><i>AI</i><span><b>${completedTasks} of ${totalTasks} tasks complete</b><small>${remainingTasks ? `${remainingTasks} remaining · One step is open at a time` : 'Everything in this plan is complete'}</small></span><button type="button" data-generate-subgoals>Refine</button></div>`;
      return;
    }
    goalProposalInbox.innerHTML = `<div class="proposal-inbox-summary"><i class="proposal-inbox-symbol">${goal.draftSubgoals.length}</i><span><b>Proposed direct subgoals</b><small>Nothing enters your confirmed plan until you approve it.</small></span></div>${goal.draftSubgoals.map((draft, index) => `<article class="proposal-draft" data-proposal-index="${index}"><span>AI PROPOSAL - APPROVAL REQUIRED</span><h4>${escapeGoalText(draft.name)}</h4><div class="proposal-actions"><button class="proposal-confirm" type="button" data-proposal-action="confirm">Confirm</button><button type="button" data-proposal-action="adjust">Adjust</button><button type="button" data-proposal-action="reject">Reject</button></div></article>`).join('')}`;
  }

  function goalPlanTaskEditorMarkup(goal) {
    if (!goalPlanTaskEditor) return '';
    const existing = goal.subgoals[goalPlanTaskEditor.subgoalIndex]?.executionTasks?.[goalPlanTaskEditor.taskIndex];
    const owner = existing?.owner || goalPlanTaskEditor.owner || goalPlanTaskOwner;
    const moment = owner === 'ai' ? existing?.startsAt : existing?.dueAt;
    const finish = existing?.expectedAt;
    const [date = goalPlanDateKey(goal), time = goal.scheduledTime || '09:00'] = String(moment || `${goalPlanDateKey(goal)}T${goal.scheduledTime || '09:00'}`).split('T');
    const finishTime = String(finish || `${date}T${shiftGoalTime(time, 45)}`).split('T')[1] || shiftGoalTime(time, 45);
    return `<form class="goal-plan-task-form" data-goal-task-form data-edit-subgoal="${goalPlanTaskEditor.subgoalIndex ?? 0}" data-edit-task="${Number.isInteger(goalPlanTaskEditor.taskIndex) ? goalPlanTaskEditor.taskIndex : -1}">
      <header><span><small>${existing ? 'EDIT TASK' : 'NEW TASK'}</small><b>${owner === 'ai' ? 'AI work window' : 'Your next action'}</b></span><button type="button" data-goal-task-editor-close aria-label="Close task editor">&times;</button></header>
      <div class="goal-plan-task-fields">
        <label class="task-name"><span>TASK</span><input name="taskName" maxlength="64" required value="${escapeGoalText(existing?.name || '')}" placeholder="Short action"></label>
        <label><span>SUBGOAL</span><select name="subgoalIndex">${goal.subgoals.map((subgoal, index) => `<option value="${index}"${index === (goalPlanTaskEditor.subgoalIndex ?? 0) ? ' selected' : ''}>${escapeGoalText(subgoal.name)}</option>`).join('')}</select></label>
        <fieldset><legend>OWNER</legend><label><input type="radio" name="taskOwner" value="human"${owner === 'human' ? ' checked' : ''}><span class="human">YOU</span></label><label><input type="radio" name="taskOwner" value="ai"${owner === 'ai' ? ' checked' : ''}><span class="ai">AI</span></label></fieldset>
        <label><span>DATE</span><input name="taskDate" type="date" required value="${date}"></label>
        <label><span>${owner === 'ai' ? 'START' : 'DUE'}</span><input name="taskTime" type="time" required value="${time.slice(0, 5)}"></label>
        <label class="task-ai-finish${owner === 'ai' ? ' visible' : ''}"><span>FINISH</span><input name="taskEndTime" type="time" value="${finishTime.slice(0, 5)}"></label>
      </div>
      <footer><button type="button" data-goal-task-editor-close>Cancel</button><button class="primary" type="submit">${existing ? 'Save task' : 'Add task'}</button></footer>
    </form>`;
  }

  function goalPlanTaskGroupsMarkup(goal, owner) {
    let visibleCount = 0;
    const groups = goal.subgoals.map((subgoal, subgoalIndex) => {
      if (subgoal.rejected) return '';
      const tasks = subgoal.executionTasks.map((task, taskIndex) => ({ task, taskIndex })).filter(entry => entry.task.owner === owner);
      visibleCount += tasks.length;
      const confirmed = subgoal.origin === 'user' || subgoal.confirmed;
      return `<section class="goal-plan-task-group">
        <header><span><i class="${subgoal.origin === 'ai' ? 'ai' : 'human'}">${subgoal.origin === 'ai' ? 'AI' : 'YOU'}</i><b>${escapeGoalText(subgoal.name)}</b></span><div>${!confirmed && subgoal.origin === 'ai' ? `<button class="accept" type="button" data-game-subgoal-accept="${subgoalIndex}">Accept</button><button type="button" data-game-subgoal-reject="${subgoalIndex}">Reject</button>` : ''}<button type="button" data-game-subgoal-edit="${subgoalIndex}">Edit</button></div></header>
        <div>${tasks.map(({ task, taskIndex }) => {
          const state = owner === 'ai' ? task.aiState : task.done ? 'done' : 'todo';
          const schedule = owner === 'ai' ? `${formatGoalPlanMoment(task.startsAt)}–${formatGoalPlanMoment(task.expectedAt, false)}` : formatGoalPlanMoment(task.dueAt);
          return `<article class="goal-plan-task-row ${state}${task.id === goalPlanFocusedTaskId ? ' focused' : ''}" data-goal-task-id="${task.id}">
            <button class="goal-plan-task-state" type="button" data-goal-task-action="${owner === 'ai' ? 'cycle' : 'toggle'}" data-task-path="${subgoalIndex}:${taskIndex}" aria-label="${owner === 'ai' ? `${state} AI task` : task.done ? 'Reopen task' : 'Complete task'}"><i></i></button>
            <span><b title="${escapeGoalText(task.name)}">${escapeGoalText(task.name)}</b><small><em>${owner === 'ai' ? 'AI' : 'YOU'}</em>${schedule}</small></span>
            <strong>${owner === 'ai' ? state : task.done ? 'Done' : 'To do'}</strong>
            <div>${owner === 'ai' ? `<button class="ai-control" type="button" data-goal-task-action="${state === 'running' ? 'pause' : state === 'prepared' ? 'review' : 'run'}" data-task-path="${subgoalIndex}:${taskIndex}">${state === 'running' ? 'Pause' : state === 'prepared' ? 'Review' : 'Run'}</button>` : ''}<button type="button" data-goal-task-action="edit" data-task-path="${subgoalIndex}:${taskIndex}" aria-label="Edit or reschedule task">Edit</button><button type="button" data-goal-task-action="delete" data-task-path="${subgoalIndex}:${taskIndex}" aria-label="Delete task">Delete</button></div>
          </article>`;
        }).join('') || `<span class="goal-plan-group-empty">No ${owner === 'ai' ? 'AI work' : 'personal task'} in this milestone</span>`}</div>
      </section>`;
    }).join('');
    const rejected = goal.subgoals.map((subgoal, index) => ({ subgoal, index })).filter(entry => entry.subgoal.rejected);
    const rejectedMarkup = rejected.length ? `<section class="goal-plan-rejected"><header><small>REMOVED FROM PLAN</small><b>${rejected.length}</b></header>${rejected.map(({ subgoal, index }) => `<span><i>×</i><b>${escapeGoalText(subgoal.name)}</b><button type="button" data-game-subgoal-restore="${index}">Restore</button><button type="button" data-game-subgoal-delete="${index}">Delete</button></span>`).join('')}</section>` : '';
    return (groups || `<div class="goal-plan-empty"><i>${owner === 'ai' ? 'AI' : 'YOU'}</i><b>No ${owner === 'ai' ? 'AI work' : 'personal tasks'} yet</b><button type="button" data-goal-task-add>Add task</button></div>`) + rejectedMarkup;
  }

  function goalPlanSubgoalEditorMarkup(goal) {
    if (goalPlanSubgoalEditor === null) return '';
    const index = Number(goalPlanSubgoalEditor);
    const subgoal = Number.isInteger(index) && index >= 0 ? goal.subgoals[index] : null;
    return `<form class="goal-plan-subgoal-form" data-goal-subgoal-form data-subgoal-index="${subgoal ? index : -1}">
      <header><span><small>${subgoal ? 'EDIT SUBGOAL' : 'NEW SUBGOAL'}</small><b>${subgoal ? 'Shape this milestone' : 'Add your own milestone'}</b></span><button type="button" data-goal-subgoal-editor-close aria-label="Close subgoal editor">&times;</button></header>
      <label><span>SUBGOAL</span><input name="subgoalName" maxlength="70" required value="${escapeGoalText(subgoal?.name || '')}" placeholder="One clear milestone"></label>
      <footer><button type="button" data-goal-subgoal-editor-close>Cancel</button><button class="primary" type="submit">${subgoal ? 'Save subgoal' : 'Add subgoal'}</button></footer>
    </form>`;
  }

  function goalPlanIntelligenceDrawerMarkup(goal, scoredObservations) {
    if (!goalPlanIntelDetail) return '';
    const prediction = goal.prediction;
    if (goalPlanIntelDetail.type === 'task') {
      const subgoal = goal.subgoals[goalPlanIntelDetail.subgoalIndex];
      const task = subgoal?.executionTasks?.[goalPlanIntelDetail.taskIndex];
      if (!task) return '';
      return `<aside class="goal-plan-intel-drawer" role="dialog" aria-modal="true" aria-label="AI task output"><button class="goal-plan-intel-scrim" type="button" data-goal-intel-close aria-label="Close AI task output"></button><section>
        <header><span><small>AI OUTPUT</small><h3>${escapeGoalText(task.name)}</h3></span><button type="button" data-goal-intel-close aria-label="Close">&times;</button></header>
        <div class="goal-plan-suggestion-icon"><i>AI</i><span><small>${escapeGoalText(String(task.aiState || 'queued').toUpperCase())}</small><b>${escapeGoalText(subgoal.name)}</b></span></div>
        <div class="goal-plan-fact-grid"><span><small>START</small><b>${formatGoalPlanMoment(task.startsAt)}</b></span><span><small>EXPECTED</small><b>${formatGoalPlanMoment(task.expectedAt)}</b></span></div>
        <article><small>PREPARED OUTPUT</small><p>${task.aiState === 'prepared' ? 'The preparation is ready for your review. Nothing external has been sent.' : task.aiState === 'running' ? 'Weeple is preparing this now. You can pause it at any time.' : 'This preparation is queued and waiting to run.'}</p></article>
        <div class="goal-plan-detail-actions"><button type="button" data-goal-intel-close>Close</button>${task.aiState === 'prepared' ? '<button class="primary" type="button" data-goal-intel-close>Reviewed</button>' : ''}</div>
        <footer><i></i>No external action without your confirmation</footer>
      </section></aside>`;
    }
    if (goalPlanIntelDetail.type === 'observation') {
      const observation = scoredObservations[goalPlanIntelDetail.index] || scoredObservations[0];
      if (!observation) return '';
      const suggestion = goal.suggestions?.find(item => !item.decision) || goal.suggestions?.[0];
      return `<aside class="goal-plan-intel-drawer" role="dialog" aria-modal="true" aria-label="Observation detail"><button class="goal-plan-intel-scrim" type="button" data-goal-intel-close aria-label="Close observation detail"></button><section>
        <header><span><small>OBSERVATION</small><h3>${escapeGoalText(observation.title)}</h3></span><button type="button" data-goal-intel-close aria-label="Close">&times;</button></header>
        <div class="goal-plan-driver-score" style="--driver:${observation.influence}"><strong>${observation.influence}</strong><span><b>Influence</b><i><em></em></i></span></div>
        <div class="goal-plan-fact-grid"><span><small>SOURCE</small><b>${escapeGoalText(observation.source)}</b></span><span><small>UPDATED</small><b>${escapeGoalText(observation.time)}</b></span></div>
        <div class="goal-plan-reason-path"><span><i>1</i><b>Signal</b></span><em></em><span><i>2</i><b>${escapeGoalText(prediction.risk)}</b></span><em></em><span><i>3</i><b>${escapeGoalText(suggestion?.action || 'Next move')}</b></span></div>
        <article><small>INFLUENCED BECAUSE</small><p>${escapeGoalText(observation.detail)}</p></article>
        <footer><i></i>Authorized for this goal only</footer>
      </section></aside>`;
    }
    if (goalPlanIntelDetail.type === 'suggestion') {
      const suggestion = goal.suggestions?.[goalPlanIntelDetail.index];
      if (!suggestion) return '';
      const scheduled = String(suggestion.scheduledAt || `${goalPlanDateKey(goal)}T${goal.scheduledTime || '09:00'}`).split('T');
      return `<aside class="goal-plan-intel-drawer" role="dialog" aria-modal="true" aria-label="Suggestion details"><button class="goal-plan-intel-scrim" type="button" data-goal-intel-close aria-label="Close suggestion details"></button><section>
        <header><span><small>NEXT MOVE</small><h3>${escapeGoalText(suggestion.action || suggestion.title)}</h3></span><button type="button" data-goal-intel-close aria-label="Close">&times;</button></header>
        <div class="goal-plan-suggestion-icon"><i>→</i><span><small>${escapeGoalText(suggestion.label)}</small><b>${escapeGoalText(suggestion.title)}</b></span></div>
        <form class="goal-plan-suggestion-schedule" data-goal-suggestion-schedule data-suggestion-index="${goalPlanIntelDetail.index}"><label><span>DATE</span><input name="suggestionDate" type="date" required value="${scheduled[0]}"></label><label><span>TIME</span><input name="suggestionTime" type="time" required value="${(scheduled[1] || '09:00').slice(0,5)}"></label><label class="goal-plan-approval"><input name="suggestionApproval" type="checkbox" checked disabled><span><i></i><b>Ask before external action</b></span></label><button type="submit">Save timing</button></form>
        <article><small>EXPECTED EFFECT</small><p>${escapeGoalText(goal.prediction?.impact || 'Improves the next milestone')}</p></article>
        <div class="goal-plan-detail-actions">${suggestion.decision ? `<em>${suggestion.decision === 'confirmed' ? 'Approved' : 'Skipped'}</em>` : `<button type="button" data-game-suggestion="reject" data-suggestion-index="${goalPlanIntelDetail.index}">Skip</button><button class="primary" type="button" data-game-suggestion="confirm" data-suggestion-index="${goalPlanIntelDetail.index}">Do it</button>`}</div>
        <footer><i></i>External AI actions remain blocked until confirmed</footer>
      </section></aside>`;
    }
    const ranked = [...scoredObservations].sort((a, b) => b.influence - a.influence);
    return `<aside class="goal-plan-intel-drawer" role="dialog" aria-modal="true" aria-label="Prediction detail"><button class="goal-plan-intel-scrim" type="button" data-goal-intel-close aria-label="Close prediction detail"></button><section>
      <header><span><small>WHY THIS PREDICTION?</small><h3>${escapeGoalText(prediction.risk)}</h3></span><button type="button" data-goal-intel-close aria-label="Close">&times;</button></header>
      <div class="goal-plan-prediction-detail"><div class="goal-plan-prediction-ring" style="--prediction:${prediction.probability}"><strong>${prediction.probability}<small>%</small></strong></div><span><small>${escapeGoalText(prediction.confidence)}</small><b>${escapeGoalText(prediction.window)}</b></span></div>
      <div class="goal-plan-driver-list">${ranked.map((item, index) => `<span style="--driver:${item.influence}"><i>${index + 1}</i><b>${escapeGoalText(item.title)}</b><em>${item.influence}</em><small><strong></strong></small></span>`).join('')}</div>
      <div class="goal-plan-factor-grid"><span><i>⏱</i><b>Timing</b><em>${goalPlanCountdown(goal)}</em></span><span><i>◔</i><b>Progress</b><em>${goal.progress}%</em></span><span><i>◇</i><b>Constraints</b><em>Included</em></span></div>
      <article><small>WHAT IT MEANS</small><p>${escapeGoalText(prediction.title)}</p></article>
      <footer><i></i>AI inference · not a confirmed fact</footer>
    </section></aside>`;
  }

  function goalPlanShareMarkup(goal, artwork, progress) {
    if (!goalPlanShareOpen) return '';
    return `<aside class="goal-plan-share" role="dialog" aria-modal="true" aria-label="Share goal achievement"><button class="goal-plan-share-scrim" type="button" data-goal-share-close aria-label="Close share preview"></button><section>
      <header><span><small>PRIVACY-REVIEWED SHARE</small><h3>Share your momentum</h3></span><button type="button" data-goal-share-close aria-label="Close">&times;</button></header>
      <div class="goal-plan-share-card" style="--share-image:url('${artwork.url}')"><span><small>${escapeGoalText(goal.category)}</small><h4>${escapeGoalText(goal.title)}</h4></span><output><strong>${progress}%</strong><small>${formatGoalPlanMoment(`${goalPlanDateKey(goal)}T${goal.scheduledTime || '23:59'}`)}</small></output></div>
      <div class="goal-plan-share-safe"><i>✓</i><span><b>Private details removed</b><small>No observations, sources, tasks, or prediction evidence.</small></span></div>
      <footer><button type="button" data-goal-share-close>Cancel</button><button class="download" type="button" data-goal-share-download>Download</button><button class="primary" type="button" data-goal-share-confirm>Share</button></footer>
    </section></aside>`;
  }

  function renderGoalGameBoardLegacy(goal) {
    if (!goalGameContent) return;
    ensureGoalCommandModel(goal);
    const observations = goal.observations || [];
    const prediction = goal.prediction || { probability: 58, risk: 'BUILDING', title: 'The first milestone is achievable.', impact: 'Next milestone', window: 'Next review', confidence: 'Medium confidence' };
    const suggestions = goal.suggestions || [];
    const activeSubgoals = goal.subgoals.filter(subgoal => !subgoal.rejected);
    const nextSubgoal = activeSubgoals.find(subgoal => subgoal.done < subgoal.total) || activeSubgoals[0];
    const completedTasks = activeSubgoals.reduce((total, subgoal) => total + subgoal.done, 0);
    const totalTasks = activeSubgoals.reduce((total, subgoal) => total + subgoal.total, 0);
    const progress = Math.round(completedTasks / Math.max(1, totalTasks) * 100);
    const scheduleLabel = Number(goal.scheduleOffset) === 0 ? 'Today' : Number(goal.scheduleOffset) === 1 ? 'Tomorrow' : prediction.window || 'Next review';
    const compactSubgoalName = (name) => {
      const concise = String(name || '')
        .replace(/^(check-in for|confirm|review|build|practice|understand|establish|create|protect|stay|preserve)\s+/i, '')
        .replace(/^(an?|the)\s+/i, '')
        .replace(/^healthy\s+/i, '')
        .replace(/\s+advancement$/i, '')
        .trim();
      return concise.split(/\s+/).filter(word => !/^(for|in|across)$/i.test(word)).slice(0, 2).join(' ') || String(name || 'Next step');
    };
    const howLabel = activeSubgoals.length
      ? activeSubgoals.slice(0, 3).map(subgoal => compactSubgoalName(subgoal.name)).join(' · ')
      : 'Choose the first subgoal';
    const predictionSummary = [prediction.impact, prediction.window].filter(Boolean).join(' · ') || prediction.title;
    const goalPraise = {
      Travel: {
        early: ['Smart preparation!', 'You are protecting the journey before it begins.'],
        steady: ['Travel plan taking shape!', 'Every confirmation makes the arrival smoother.'],
        close: ['Ready for the journey!', 'Your important travel details are nearly secured.']
      },
      Wellbeing: {
        early: ['A meaningful start!', 'Small healthy choices are already adding up.'],
        steady: ['Strong momentum!', 'Your consistency is becoming a lasting routine.'],
        close: ['Remarkable consistency!', 'Your daily choices are creating real change.']
      },
      Learning: {
        early: ['Keep exploring!', 'Every practice session is building confidence.'],
        steady: ['Your skill is growing!', 'Focused practice is turning into fluency.'],
        close: ['Impressive progress!', 'You are close to owning this new skill.']
      },
      Finance: {
        early: ['A stronger foundation!', 'Each smart review improves your resilience.'],
        steady: ['Your plan is strengthening!', 'Consistent choices are building security.'],
        close: ['Financial momentum!', 'Your safety buffer is within reach.']
      },
      Relationships: {
        early: ['Connection starts here!', 'Thoughtful effort always matters.'],
        steady: ['Meaningful momentum!', 'Your follow-through is bringing people closer.'],
        close: ['Beautiful progress!', 'Your care is creating stronger connections.']
      }
    }[goal.category] || {
      early: ['Great progress!', 'Every completed step counts.'],
      steady: ['Strong momentum!', 'Your consistent work is paying off.'],
      close: ['Outstanding!', 'You are close to the finish.']
    };
    const conclusion = /high risk/i.test(String(prediction.risk))
      ? ['Good catch!', 'You still have time to protect the plan.']
      : progress >= 80 ? goalPraise.close : progress >= 50 ? goalPraise.steady : goalPraise.early;
    const scoredObservations = observations.slice(0, 3).map((observation, index) => ({
      ...observation,
      influence: Number(observation.influence) || Math.max(54, 92 - index * 17)
    }));
    const highestInfluence = Math.max(0, ...scoredObservations.map(observation => observation.influence));

    goalGameContent.innerHTML = `
      <header class="goal-game-hud">
        <span><i></i><small>GOAL JOURNEY</small><b>Mission runway</b></span>
        <div class="goal-game-status"><i></i><strong>${progress}%</strong><span>${completedTasks} actions complete</span></div>
      </header>
      <div class="goal-game-layout goal-runway-layout">
        <aside class="goal-blueprint" aria-label="Goal definition">
          <header><small>MISSION BRIEF</small><h3>Goal blueprint</h3></header>
          <article class="goal-blueprint-card what"><span>01</span><div><small>WHAT</small><b>${escapeGoalText(goal.title)}</b></div></article>
          <article class="goal-blueprint-card how"><span>02</span><div><small>HOW</small><b>${escapeGoalText(howLabel)}</b></div></article>
          <article class="goal-blueprint-card when"><span>03</span><div><small>WHEN</small><b>${escapeGoalText(`${scheduleLabel}${goal.scheduledTime ? ` - ${goal.scheduledTime}` : ''}`)}</b></div></article>
          <article class="goal-blueprint-card result" style="--result-score:${prediction.probability}">
            <span>04</span>
            <div class="goal-result-copy"><small>RESULT - AI PREDICTION</small><b>${escapeGoalText(prediction.risk)}</b><em>${escapeGoalText(predictionSummary)}</em></div>
            <div class="goal-result-score"><strong>${prediction.probability}<small>%</small></strong></div>
          </article>
        </aside>

        <section class="goal-quest-panel game-panel">
          <header><span><small>YOUR ROUTE</small><h3>AI subgoals</h3></span><button type="button" data-game-subgoal-add><i>+</i>Add subgoal</button></header>
          <div class="goal-quest-list">
            ${goal.subgoals.map((subgoal, index) => {
              const complete = subgoal.done >= subgoal.total;
              const userCreated = subgoal.origin === 'user';
              const rejected = Boolean(subgoal.rejected);
              const confirmed = userCreated || subgoal.confirmed;
              const stateLabel = rejected ? 'Rejected' : complete ? 'Complete' : confirmed ? 'Accepted' : 'Review';
              const subgoalProgress = Math.round(subgoal.done / Math.max(1, subgoal.total) * 100);
              return `<article class="goal-quest${rejected ? ' rejected' : ''}${complete ? ' complete' : ''}${!confirmed && !rejected ? ' needs-review' : ''}" style="--quest-progress:${subgoalProgress}">
                <i class="goal-quest-index">${complete ? '&#10003;' : String(index + 1).padStart(2, '0')}</i>
                <span><small><i class="goal-origin-badge ${userCreated ? 'user' : 'ai'}">${userCreated ? 'YOU' : 'AI'}</i>${stateLabel}</small><b>${escapeGoalText(subgoal.name)}</b><i class="goal-quest-meter"><em></em></i></span>
                <em>${subgoalProgress}%</em>
                <div class="goal-quest-actions">
                  ${!userCreated && !confirmed && !rejected ? `<button class="accept" type="button" data-game-subgoal-accept="${index}">Accept</button><button type="button" data-game-subgoal-reject="${index}">Reject</button>` : ''}
                  ${rejected ? `<button class="accept" type="button" data-game-subgoal-restore="${index}">Restore</button>` : ''}
                  <button type="button" data-game-subgoal-edit="${index}">Edit</button>
                  <button class="delete" type="button" data-game-subgoal-delete="${index}">Delete</button>
                </div>
              </article>`;
            }).join('')}
          </div>
          <footer class="goal-praise">
            <span class="goal-trophy" aria-hidden="true"><i>&#9733;</i></span>
            <span><small>CONCLUSION</small><b>${conclusion[0]}</b><em>${conclusion[1]}</em></span>
            <output class="goal-conclusion-progress" aria-label="${progress}% goal progress"><strong>${progress}%</strong><small>Goal progress</small></output>
          </footer>
        </section>

        <aside class="goal-intelligence-stage">
          <section class="goal-intel-panel game-panel">
            <header><span><small>LIVE SIGNALS</small><h3>Observations</h3></span><em>${scoredObservations.length}</em></header>
            <div class="goal-influence-list">
              ${scoredObservations.map(observation => `<article class="goal-influence${observation.influence === highestInfluence ? ' strongest' : ''}">
                <span class="observation-symbol">${observationIcons[observation.type] || observationIcons.context}</span>
                <div><b>${escapeGoalText(observation.title)}</b><small>${observation.influence === highestInfluence ? '<strong>HIGH IMPACT</strong>' : ''}${escapeGoalText(observation.source)}</small><i><em style="width:${observation.influence}%"></em></i></div>
                <strong>${observation.influence}</strong>
              </article>`).join('') || '<div class="goal-game-empty">No observation yet</div>'}
            </div>
          </section>

          <section class="goal-action-panel game-panel">
            <header><span><small>RECOMMENDED</small><h3>Next moves</h3></span><em>${suggestions.filter(item => !item.decision).length} ready</em></header>
            <div class="goal-game-suggestions">
              ${suggestions.slice(0, 2).map((suggestion, index) => {
                const confirmed = suggestion.decision === 'confirmed';
                const rejected = suggestion.decision === 'rejected';
                return `<article class="goal-game-suggestion${confirmed ? ' confirmed' : ''}${rejected ? ' rejected' : ''}" title="${escapeGoalText(suggestion.title)}">
                  <i>${confirmed ? '&#10003;' : rejected ? '&times;' : index + 1}</i><span><small>${escapeGoalText(suggestion.label)}</small><b>${escapeGoalText(suggestion.action || suggestion.title)}</b></span>
                  <div>${!suggestion.decision ? `<button class="accept" type="button" data-game-suggestion="confirm" data-suggestion-index="${index}">Do it</button><button type="button" data-game-suggestion="reject" data-suggestion-index="${index}">Skip</button>` : `<em>${confirmed ? 'Accepted' : 'Skipped'}</em>`}</div>
                </article>`;
              }).join('') || '<div class="goal-game-empty">No action needed</div>'}
            </div>
          </section>
        </aside>
      </div>
    `;
  }

  function goalVisualTransitionState() {
    if (goalPlanTransitionDirection < 0) return 'previous';
    if (goalPlanTransitionDirection > 0) return 'next';
    if (goalPlanVisualEnter) return 'enter';
    return 'idle';
  }

  function finishGoalVisualTransition() {
    goalPlanTransitionDirection = 0;
    goalPlanVisualEnter = false;
    const visual = goalGameContent?.querySelector('.goal-plan-visual');
    if (!visual) return;
    visual.classList.remove('goal-switch-previous', 'goal-switch-next');
    visual.dataset.goalTransition = 'idle';
  }

  function kickGoalVisualAnimation() {
    if (reduceMotion) return;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const visual = goalGameContent?.querySelector('.goal-plan-visual');
        if (!visual) return;
        visual.querySelectorAll('img, .goal-plan-image-shade, .goal-plan-image-title, .goal-plan-image-progress, .goal-plan-next').forEach((element) => {
          if (getComputedStyle(element).animationName === 'none') return;
          element.style.animation = 'none';
          void element.offsetWidth;
          element.style.removeProperty('animation');
        });
      });
    });
  }

  function renderGoalGameBoard(goal) {
    if (!goalGameContent) return;
    ensureGoalCommandModel(goal);
    const observations = deriveGoalObservations(goal);
    const prediction = goal.prediction || { probability: 58, risk: 'BUILDING', title: 'The first milestone is achievable.', impact: 'Next milestone', window: 'Next review', confidence: 'Medium confidence' };
    const suggestions = goal.suggestions || [];
    const activeSubgoals = goal.subgoals.filter(subgoal => !subgoal.rejected);
    const allTasks = activeSubgoals.flatMap(subgoal => subgoal.executionTasks);
    const humanTasks = allTasks.filter(task => task.owner === 'human');
    const aiTasks = allTasks.filter(task => task.owner === 'ai');
    const completedTasks = allTasks.filter(task => task.owner === 'human' ? task.done : task.aiState === 'prepared').length;
    const progress = Math.round(completedTasks / Math.max(1, allTasks.length) * 100);
    goal.progress = progress;
    goal.completed = completedTasks;
    goal.tasks = allTasks.length;
    const nextHuman = humanTasks.filter(task => !task.done).sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))[0];
    const nextAi = aiTasks.find(task => task.aiState === 'running') || aiTasks.find(task => task.aiState === 'queued');
    const nextTask = nextHuman || nextAi;
    const activeAiCount = aiTasks.filter(task => ['queued', 'running', 'blocked'].includes(task.aiState)).length;
    const artwork = resolveGoalArtwork(goal);
    const deadline = `${goalPlanDateKey(goal)}T${goal.scheduledTime || '23:59'}`;
    const scoredObservations = observations.map((observation, index) => ({ ...observation, influence: Number(observation.influence) || Math.max(42, 92 - index * 13) }));
    const highestInfluence = Math.max(0, ...scoredObservations.map(item => item.influence));
    const rankedObservations = scoredObservations.map((observation, index) => ({ ...observation, originalIndex: index })).sort((a, b) => b.influence - a.influence);
    const taskDrawerLabel = goalPlanTaskOwner === 'ai' ? 'AI tasks' : 'Your tasks';
    const previousGoal = goalProfiles[state.currentGoalIndex - 1];
    const nextGoal = goalProfiles[state.currentGoalIndex + 1];

    const goalSwitcherMarkup = `<div class="goal-plan-edge-switcher">
      <button class="goal-plan-edge-handle" type="button" data-goal-list-toggle aria-expanded="${String(goalPlanListOpen)}" aria-label="Open goal list"><span>Goals</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg></button>
      ${goalPlanListOpen ? `<button class="goal-plan-list-scrim" type="button" data-goal-list-close aria-label="Close goal list"></button><section class="goal-plan-list" aria-label="Choose a goal"><header><span><small>YOUR GOALS</small><b>Choose your mission</b></span><div><button type="button" data-goal-create aria-label="Add goal">+</button><button type="button" data-goal-list-close aria-label="Close goal list">&times;</button></div></header><label><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg><input type="search" data-goal-plan-search placeholder="Find a goal" autocomplete="off"></label><div>${goalProfiles.map((profile, index) => { ensureGoalCommandModel(profile); return `<button class="goal-plan-list-item${index === state.currentGoalIndex ? ' active' : ''}" type="button" data-goal-plan-select="${index}" data-goal-search-value="${escapeGoalText(profile.title.toLowerCase())}"><i>${goalCategorySymbols[profile.category] || 'GO'}</i><span><b>${escapeGoalText(profile.title)}</b><small>${formatGoalPlanMoment(`${goalPlanDateKey(profile)}T${profile.scheduledTime || '23:59'}`)}</small></span><em>${profile.progress || 0}%</em></button>`; }).join('')}</div><footer><button type="button" data-goal-create><i>+</i>Add goal</button></footer></section>` : ''}
    </div>`;

    goalGameContent.innerHTML = `<div class="goal-plan-shell${goalPlanTaskDrawerOpen ? ' task-open' : ''}${goalPlanListOpen ? ' goal-list-open' : ''}" style="--observation-count:${scoredObservations.length};--suggestion-count:${Math.min(3, suggestions.length)}">
      ${goalSwitcherMarkup}
      <main class="goal-plan-stage">
        <section class="goal-plan-visual${goalPlanTransitionDirection < 0 ? ' goal-switch-previous' : goalPlanTransitionDirection > 0 ? ' goal-switch-next' : ''}" data-goal-transition="${goalVisualTransitionState()}" aria-label="Goal visualization">
          <img src="${artwork.url}" alt="${artwork.alt}">
          <div class="goal-plan-image-shade"></div>
          <div class="goal-plan-image-title"><small>${escapeGoalText(goal.category)} GOAL</small><h1 title="${escapeGoalText(goal.title)}">${escapeGoalText(goal.title)}</h1></div>
          <span class="goal-plan-live"><i></i>${goal.monitoringPaused ? 'PAUSED' : 'GOAL ACTIVE'}</span>
          <div class="goal-plan-image-actions">
            <button class="goal-plan-image-share" type="button" data-goal-plan-share aria-label="Share goal"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.5-4.4M8.2 13.2l7.5 4.4"/></svg><span>Share</span></button>
            <div class="goal-plan-image-more"><button type="button" data-goal-plan-more aria-haspopup="menu" aria-expanded="${String(goalPlanMoreOpen)}" aria-label="More goal actions"><i></i><i></i><i></i></button>${goalPlanMoreOpen ? `<div role="menu" aria-label="Goal actions"><button type="button" role="menuitem" data-goal-plan-edit><span>Edit goal</span></button><button class="delete" type="button" role="menuitem" data-goal-plan-delete><span>Delete goal</span></button></div>` : ''}</div>
          </div>
          <div class="goal-plan-image-progress"><span><small>PROGRESS</small><b>${progress}%</b></span><i><em style="width:${progress}%"></em></i></div>
          <div class="goal-plan-image-deadline"><small>DEADLINE</small><b>${goalPlanCountdown(goal)}</b><em>${formatGoalPlanMoment(deadline)}</em></div>
          <div class="goal-plan-next"><i>→</i><span><small>NEXT MOVE</small><b title="${escapeGoalText(nextTask?.name || 'Review progress')}">${escapeGoalText(nextTask?.name || 'Review progress')}</b></span></div>
          <nav class="goal-plan-art-navigation" aria-label="Switch goals">
            ${previousGoal ? `<button class="previous" type="button" data-goal-direction="-1" aria-label="Previous goal: ${escapeGoalText(previousGoal.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>` : ''}
            ${nextGoal ? `<button class="next" type="button" data-goal-direction="1" aria-label="Next goal: ${escapeGoalText(nextGoal.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>` : ''}
          </nav>
        </section>

        <aside class="goal-plan-intelligence">
          <section class="goal-plan-observation" aria-label="Live goal observations">
            <header><span><small><i aria-hidden="true"></i>LIVE SIGNALS</small><b>Observations</b></span><button type="button" data-goal-observation-open="${rankedObservations[0]?.originalIndex || 0}" aria-label="Open strongest observation">${scoredObservations.length}</button></header>
            <div class="goal-observation-monitor"><span><i aria-hidden="true"><em></em><em></em><em></em></i>Analyzing now</span><small>INFLUENCE ON PREDICTION</small></div>
            <div class="goal-observation-stream">
              ${rankedObservations.map((observation, rank) => {
                const signalIcon = observation.type === 'calendar'
                  ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="3"/><path d="M8 3v6M16 3v6M4 10h16"/></svg>'
                  : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4 4 0 0 0-4 4v1a4 4 0 0 0-2 7.46A4 4 0 0 0 10 21h2V3Z"/><path d="M12 6h2a3 3 0 0 1 3 3v1a3.5 3.5 0 0 1 1 6.85A3.5 3.5 0 0 1 14.5 21H12M8 8h4M7 14h5M12 11h4M12 17h5"/></svg>';
                return `<button class="goal-observation-signal${rank === 0 ? ' strongest' : ''}" type="button" data-goal-observation-index="${observation.originalIndex}" aria-label="Open ${escapeGoalText(observation.title)}, ${observation.influence}% influence" style="--signal:${observation.influence};--signal-delay:${rank * 70}ms"><i>${signalIcon}</i><span><b title="${escapeGoalText(observation.title)}">${escapeGoalText(observation.title)}</b><small title="${escapeGoalText(observation.source)}">${rank === 0 ? 'TOP DRIVER' : escapeGoalText(observation.source)}</small><em><u></u></em></span><strong>${observation.influence}<small>%</small></strong></button>`;
              }).join('') || '<div class="goal-observation-empty"><i></i><span><b>Waiting for signals</b><small>Connect a source to begin</small></span></div>'}
            </div>
            <footer><span><i></i>${scoredObservations.length} signals connected</span><b>Tap to explore <i>→</i></b></footer>
          </section>

          <button class="goal-plan-prediction" type="button" data-goal-prediction-open aria-label="Open prediction reasoning">
            <div class="goal-plan-prediction-ring" style="--prediction:${prediction.probability}"><i class="prediction-comet" aria-hidden="true"></i><strong>${prediction.probability}<small>%</small></strong></div>
            <span><small>AI PREDICTION</small><b>${escapeGoalText(prediction.risk)}</b><em title="${escapeGoalText(prediction.title)}">${escapeGoalText(prediction.title)}</em></span><i>›</i>
          </button>

          <section class="goal-plan-suggestions"><header><i class="goal-suggestion-spark" aria-hidden="true">✦</i><span><small>NEXT MOVES</small><b>Suggestions</b></span><em>${suggestions.filter(item => !item.decision).length}</em></header><div>${suggestions.slice(0, 3).map((suggestion, index) => `<article class="${suggestion.decision || ''}" data-goal-suggestion-open="${index}"><i>${suggestion.decision === 'confirmed' ? '✓' : index + 1}</i><span><small>${escapeGoalText(suggestion.label)}</small><b title="${escapeGoalText(suggestion.title)}">${escapeGoalText(suggestion.action || suggestion.title)}</b></span><div>${suggestion.decision ? `<em>${suggestion.decision === 'confirmed' ? 'Done' : 'Skipped'}</em>` : `<button class="primary" type="button" data-game-suggestion="confirm" data-suggestion-index="${index}">Do it</button><button type="button" data-game-suggestion="reject" data-suggestion-index="${index}">Skip</button>`}</div></article>`).join('') || '<span class="goal-plan-no-suggestion">All clear</span>'}</div></section>
        </aside>
      </main>

      <section class="goal-plan-task-dock${goalPlanTaskDrawerOpen ? ' open' : ''}">
        <button class="goal-plan-task-summary" type="button" data-goal-task-drawer-toggle aria-expanded="${String(goalPlanTaskDrawerOpen)}"><span><i class="human">YOU</i><b>${humanTasks.filter(task => !task.done).length}</b><small>to do</small></span><span><i class="ai">AI</i><b>${activeAiCount}</b><small>active</small></span><em></em><strong title="${escapeGoalText(nextTask?.name || 'All current work reviewed')}">${escapeGoalText(nextTask?.name || 'All current work reviewed')}</strong><small>${nextTask ? formatGoalPlanMoment(goalPlanTaskMoment(nextTask)) : 'Up to date'}</small><i class="chevron">⌃</i></button>
        ${goalPlanTaskDrawerOpen ? `<div class="goal-plan-task-drawer"><header><div role="tablist" aria-label="Task owner"><button class="${goalPlanTaskOwner === 'human' ? 'active' : ''}" type="button" data-goal-task-owner="human"><i>YOU</i>Your tasks <em>${humanTasks.length}</em></button><button class="${goalPlanTaskOwner === 'ai' ? 'active' : ''}" type="button" data-goal-task-owner="ai"><i>AI</i>AI tasks <em>${aiTasks.length}</em></button></div><span><button type="button" data-game-subgoal-add>+ Subgoal</button><button class="primary" type="button" data-goal-task-add>+ Task</button><button type="button" data-goal-task-drawer-close aria-label="Close task drawer">&times;</button></span></header><div class="goal-plan-task-content" aria-label="${taskDrawerLabel}">${goalPlanTaskGroupsMarkup(goal, goalPlanTaskOwner)}</div>${goalPlanTaskEditorMarkup(goal)}${goalPlanSubgoalEditorMarkup(goal)}</div>` : ''}
      </section>
      ${goalPlanIntelligenceDrawerMarkup(goal, scoredObservations)}
      ${goalPlanShareMarkup(goal, artwork, progress)}
    </div>`;
    const shouldAnimate = goalPlanTransitionDirection !== 0 || goalPlanVisualEnter;
    if (goalPlanVisualEnter && !goalPlanTransitionDirection) goalPlanVisualEnter = false;
    if (shouldAnimate) kickGoalVisualAnimation();
  }

  function renderGoalCommandCenter(goal) {
    ensureGoalCommandModel(goal);
    const observations = goal.observations || [
      { type: 'context', title: 'Goal context ready', detail: 'The confirmed outcome and constraints are available for reasoning.', source: 'Confirmed goal', time: 'Now' }
    ];
    const prediction = goal.prediction || { probability: 58, risk: 'EARLY INFERENCE', title: 'The next milestone is achievable, but additional context may change the timing.', impact: 'Next milestone', window: 'Next review', confidence: 'Medium confidence' };
    const suggestions = goal.suggestions || [];
    const nextSubgoal = goal.subgoals.find(subgoal => subgoal.done < subgoal.total) || goal.subgoals[goal.subgoals.length - 1];
    const totalTasks = goal.subgoals.reduce((total, subgoal) => total + subgoal.total, 0);
    const completedTasks = goal.subgoals.reduce((total, subgoal) => total + subgoal.done, 0);
    const primarySuggestion = suggestions.find(suggestion => !suggestion.decision);
    const nextExecutionTask = nextSubgoal?.executionTasks?.find(task => !task.done);
    goal.progress = Math.round(completedTasks / Math.max(1, totalTasks) * 100);
    goal.tasks = totalTasks;
    goal.completed = completedTasks;

    goalCommandTitle.textContent = goal.title;
    goalCommandOutcome.textContent = goal.outcome;
    goalCategoryLabel.textContent = String(goal.category || 'Goal').toUpperCase();
    goalUpdatedLabel.textContent = goal.updated || 'Updated now';
    goalCommandStatus.textContent = goal.status;
    goalNextMilestone.textContent = nextSubgoal ? `Next: ${nextSubgoal.name}` : 'All confirmed subgoals complete';
    if (goalJourneyNow) goalJourneyNow.textContent = nextSubgoal ? `Next · ${nextSubgoal.name}` : 'Outcome reached';
    const nextActionLabel = primarySuggestion ? `Review ${primarySuggestion.action}` : nextExecutionTask ? `Continue ${nextExecutionTask.name}` : 'Review goal progress';
    goalNextAction.innerHTML = `${escapeGoalText(nextActionLabel.length > 34 ? `${nextActionLabel.slice(0, 32)}...` : nextActionLabel)} <span>→</span>`;
    goalNextAction.setAttribute('aria-label', nextActionLabel);
    goalCommandProgress.style.setProperty('--progress', goal.progress);
    goalCommandProgress.innerHTML = `<strong>${goal.progress}<small>%</small></strong>`;
    goalCommandMeta.innerHTML = `<span><i></i>${goal.sources || observations.length} connected sources</span><span>${escapeGoalText(goal.constraints)}</span><span>${suggestions.filter(item => !item.decision).length} approvals ready</span>`;
    if (goalMonitoringStatus) goalMonitoringStatus.textContent = `${goal.sources || observations.length} connected sources - ${goal.updated || 'updated now'}`;
    goalMonitoringLabel.textContent = goal.monitoringPaused ? 'AI monitoring paused' : 'Safe work runs automatically';
    goalMonitoringDescription.textContent = goal.monitoringPaused ? 'Tap to resume or review sources' : 'External actions always ask first';
    goalMonitoringButton.classList.toggle('paused', Boolean(goal.monitoringPaused));
    renderGoalTimeline(goal);
    renderGoalHardwareState(goal);
    renderGoalEdgeCues();

    // The compact Goal workspace is the only visible presentation. Keeping the
    // retired multi-panel UI out of the hot path makes goal switching immediate.
    renderGoalResultsSurface(goal);
    renderGoalGameBoard(goal);
    return;

    activeGoalTitle.textContent = goal.title;
    activeGoalStatus.textContent = goal.status;
    const completedSubgoalCount = goal.subgoals.filter(subgoal => subgoal.done >= subgoal.total).length;
    goalCompletionSummary.textContent = `${completedSubgoalCount} of ${goal.subgoals.length} subgoals complete`;
    renderGoalProposalInbox(goal);
    reasoningSubgoalList.innerHTML = `<div class="subgoal-path-overview" aria-label="AI-created plan: ${completedSubgoalCount} of ${goal.subgoals.length} subgoals complete"><div class="subgoal-path-ring" style="--path-progress:${goal.progress}"><strong>AI</strong></div><span><small>AI-CREATED PLAN</small><b>${completedSubgoalCount} of ${goal.subgoals.length} subgoals complete</b></span></div>` + goal.subgoals.map((subgoal, subgoalIndex) => {
      const percentage = Math.round(subgoal.done / Math.max(1, subgoal.total) * 100);
      const completed = percentage === 100;
      const status = completed ? 'Completed' : subgoal.state || 'In progress';
      return `<button class="simple-subgoal${completed ? ' done' : ''}" type="button" data-simple-subgoal="${subgoalIndex}" aria-pressed="${String(completed)}"><i><span>${completed ? '✓' : subgoalIndex + 1}</span></i><span><b>${escapeGoalText(subgoal.name)}</b><small>${escapeGoalText(status)}</small></span><em>${escapeGoalText(status)}</em></button>`;
    }).join('');
    scheduleGoalCanvasPathSync();

    reasoningObservationList.innerHTML = `<div class="observation-signal-map" aria-label="${observations.length} live context signals"><div class="signal-orbit"><i></i><i></i><i></i><span><strong>${observations.length}</strong><small>LIVE SIGNALS</small></span></div></div>` + observations.slice(0, 3).map((observation, observationIndex) => `<button class="simple-observation" type="button" data-observation-expand="${observationIndex}" aria-expanded="false"><span class="observation-symbol">${observationIcons[observation.type] || observationIcons.context}</span><div><b>${escapeGoalText(observation.title)}</b><small><i></i>${escapeGoalText(observation.time)}</small><p><em>${escapeGoalText(observation.source)}</em>${escapeGoalText(observation.detail)}</p></div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></button>`).join('');

    reasoningPredictionContent.innerHTML = `<article class="simple-prediction" data-prediction-toggle role="button" tabindex="0" aria-expanded="false" style="--prediction-value:${prediction.probability}"><div class="prediction-visual"><div class="prediction-gauge"><strong>${prediction.probability}<small>%</small></strong><span>LIKELIHOOD</span></div><div class="prediction-state"><small>AI FORECAST</small><b><i></i>${escapeGoalText(prediction.risk)}</b></div></div><h3>${escapeGoalText(prediction.title)}</h3><div class="prediction-facts"><span><small>IMPACT</small><b>${escapeGoalText(prediction.impact)}</b></span><span><small>WINDOW</small><b>${escapeGoalText(prediction.window)}</b></span></div><footer><span>${escapeGoalText(prediction.confidence)}</span><i><b></b></i></footer></article>`;

    const orderedSuggestions = suggestions.map((suggestion, index) => ({ suggestion, index })).sort((a, b) => Number(Boolean(a.suggestion.decision)) - Number(Boolean(b.suggestion.decision)));
    reasoningSuggestionList.innerHTML = orderedSuggestions.map(({ suggestion, index }, displayIndex) => {
      const settled = suggestion.decision === 'confirmed' || suggestion.decision === 'rejected';
      const running = suggestion.decision === 'confirmed' && suggestion.executionState !== 'completed';
      const stateClass = suggestion.decision === 'confirmed' ? ` is-confirmed${running ? ' is-running' : ''}` : suggestion.decision === 'rejected' ? ' is-rejected' : '';
      const resultText = suggestion.decision === 'confirmed' ? suggestion.executionState === 'preparing' ? 'Preparing the approved action...' : suggestion.executionState === 'executing' ? 'Executing securely - progress will update when complete' : 'Completed - related subgoal and progress updated' : suggestion.decision === 'rejected' ? 'Rejected - no external action taken' : 'Approval required before external execution';
      const confirmLabel = suggestion.selectedOption ? `Confirm ${suggestion.selectedOption}` : suggestion.action;
      const updatedPath = goal.subgoals[suggestion.updates]?.name || 'Goal plan';
      return `<article class="suggestion-card simple${stateClass}" data-suggestion-index="${index}" data-updates-subgoal="${suggestion.updates}"><header><span><i></i>${escapeGoalText(suggestion.label)}</span><small>${running ? 'AI working' : `Option ${String(displayIndex + 1).padStart(2, '0')}`}</small></header><div class="suggestion-visual"><i>→</i><span><small>BEST NEXT MOVE</small><h3>${escapeGoalText(suggestion.title)}</h3></span></div><div class="suggestion-impact"><span><i></i><small>ADVANCES</small><b>${escapeGoalText(updatedPath)}</b></span><span><i></i><small>CONTROL</small><b>Approval required</b></span></div><div class="suggestion-actions"><button class="suggestion-confirm" type="button" data-suggestion-decision="confirm"${settled ? ' disabled' : ''}>${escapeGoalText(confirmLabel)}</button><button type="button" data-suggestion-decision="adjust" aria-expanded="false"${settled ? ' disabled' : ''}>Adjust</button><button class="suggestion-reject" type="button" data-suggestion-decision="reject"${settled ? ' disabled' : ''}>Reject</button></div><div class="suggestion-adjuster">${(suggestion.options || []).map(option => `<button type="button" data-suggestion-option="${escapeGoalText(option)}"${settled ? ' disabled' : ''}>${escapeGoalText(option)}</button>`).join('')}</div><div class="suggestion-result" aria-live="polite"><i>${suggestion.decision === 'rejected' ? '×' : running ? '•' : '✓'}</i><span>${resultText}</span></div></article>`;
    }).join('') || '<div class="proposal-inbox-summary"><i class="proposal-inbox-symbol">AI</i><span><b>No action required</b><small>Weeple is continuing safe monitoring in the background.</small></span></div>';
    reasoningSuggestionList.classList.remove('show-all');
    if (suggestions.length > 1) {
      const alternativeCount = suggestions.length - 1;
      reasoningSuggestionList.insertAdjacentHTML('beforeend', `<button class="suggestion-more-toggle" type="button" data-toggle-suggestions aria-expanded="false" aria-label="View ${alternativeCount} alternative recommendation${alternativeCount === 1 ? '' : 's'}">${alternativeCount === 1 ? 'View alternative' : `${alternativeCount} alternatives`}</button>`);
    }
    const unresolvedSuggestionCount = suggestions.filter(suggestion => !suggestion.decision).length;
    suggestionCount.textContent = unresolvedSuggestionCount > 1 ? `1 best + ${unresolvedSuggestionCount - 1} more` : unresolvedSuggestionCount === 1 ? 'Ready' : 'Reviewed';
    if (aiReasoningStatus) aiReasoningStatus.textContent = `${Math.min(3, observations.length)} observation${observations.length === 1 ? '' : 's'} · ${unresolvedSuggestionCount} suggestion${unresolvedSuggestionCount === 1 ? '' : 's'}`;
    renderGoalResultsSurface(goal);
    renderGoalSupport(goal);
  }

  function updateGoalCompletionSummary(goal) {
    const completed = goal.subgoals.reduce((total, subgoal) => total + subgoal.done, 0);
    const taskTotal = goal.subgoals.reduce((total, subgoal) => total + subgoal.total, 0);
    goal.completed = completed;
    goal.tasks = taskTotal;
    goal.progress = Math.round(completed / Math.max(1, taskTotal) * 100);
    state.currentGoalProgress = goal.progress;
    const completedSubgoals = goal.subgoals.filter(subgoal => subgoal.done >= subgoal.total).length;
    goalCompletionSummary.textContent = `${completedSubgoals} of ${goal.subgoals.length} subgoals complete`;
    if (goalCollectionList) renderGoalCollection();
  }

  function renderReasoningDashboard(goal) {
    const observations = goal.observations || [
      { type: 'context', title: 'Goal context ready', detail: 'The goal description and constraints are available for reasoning.', source: 'Confirmed goal', time: 'Now' },
      { type: 'calendar', title: 'Calendar checked', detail: 'No scheduling conflict has been confirmed for this new goal yet.', source: 'Calendar', time: 'Live' },
      { type: 'context', title: 'More context useful', detail: 'Connect only the sources needed to improve this prediction.', source: 'Permission control', time: 'Optional' }
    ];
    const prediction = goal.prediction || { probability: 58, risk: 'NEEDS CONTEXT', title: 'The first milestone is achievable, but timing confidence is limited until more context is confirmed.', impact: 'First milestone', window: 'Next review', confidence: 'Medium confidence' };
    const suggestions = goal.suggestions || [
      { id: 'define-success', label: 'CLARIFY OUTCOME', title: 'Confirm one measurable success criterion before beginning execution.', action: 'Confirm Criterion', updates: 0, options: ['This week', 'This month', 'Set date'] },
      { id: 'protect-review', label: 'PROTECT PROGRESS', title: 'Reserve a short weekly review to keep this goal current.', action: 'Reserve Review', updates: Math.min(2, goal.subgoals.length - 1), options: ['Friday', 'Sunday', 'Choose time'] }
    ];
    const driverSets = {
      Travel: [['Weather disruption', 88], ['Flight reliability', 75], ['Arrival buffer', 18]],
      Wellbeing: [['Recovery level', 62], ['Focus alignment', 81], ['Routine load', 44]],
      Learning: [['Active practice', 36], ['Consistency', 78], ['Feedback quality', 51]],
      Finance: [['Savings pace', 63], ['Recurring costs', 71], ['Timeline buffer', 42]],
      Relationships: [['Shared availability', 84], ['Follow-up rhythm', 58], ['Recent context', 72]],
      Project: [['Scope clarity', 56], ['Available capacity', 64], ['Evidence strength', 39]]
    };
    const predictionDrivers = prediction.drivers || driverSets[goal.category] || driverSets.Project;
    const driverMarkup = predictionDrivers.map(([label, value]) => `<span><b>${escapeGoalText(label)}</b><i style="--driver:${value}%"></i><em>${value}</em></span>`).join('');

    activeGoalTitle.textContent = goal.title;
    activeGoalStatus.textContent = goal.status;
    reasoningSubgoalList.innerHTML = goal.subgoals.map((subgoal, index) => {
      const done = subgoal.done >= subgoal.total;
      return `<button class="reasoning-subgoal${done ? ' done' : ''}" type="button" data-reasoning-subgoal="${index}" aria-pressed="${String(done)}"><span class="subgoal-check"><svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9"/></svg></span><span><b>${escapeGoalText(subgoal.name)}</b><small>${done ? 'Completed' : `${subgoal.done}/${subgoal.total} steps · ${escapeGoalText(subgoal.state || 'AI generated')}`}</small></span><em>${done ? 'READY' : `${Math.round(subgoal.done / Math.max(1, subgoal.total) * 100)}%`}</em></button>`;
    }).join('');
    updateGoalCompletionSummary(goal);

    reasoningObservationList.innerHTML = observations.map(observation => `<article class="observation-card"><header><span class="observation-symbol">${observationIcons[observation.type] || observationIcons.context}</span><time>${escapeGoalText(observation.time)}</time></header><h3>${escapeGoalText(observation.title)}</h3><p>${escapeGoalText(observation.detail)}</p><footer><i></i>${escapeGoalText(observation.source)}</footer></article>`).join('');

    reasoningPredictionContent.innerHTML = `<article class="prediction-hero"><div class="risk-orbit" style="--risk:${prediction.probability}"><strong>${prediction.probability}<small>%</small></strong></div><span>${escapeGoalText(prediction.risk)}</span><h3>${escapeGoalText(prediction.title)}</h3></article><div class="prediction-impact"><span><small>PRIMARY IMPACT</small><strong>${escapeGoalText(prediction.impact)}</strong></span><span><small>RISK WINDOW</small><strong>${escapeGoalText(prediction.window)}</strong></span></div><button class="prediction-explain" id="predictionExplain" type="button" aria-expanded="false">Why this prediction?<svg viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg></button><div class="prediction-evidence" id="predictionEvidence"><div><span><i></i>Goal timing and constraints were evaluated together.</span><span><i></i>Authorized observations and confirmed memories adjusted the score.</span><span><i></i>${escapeGoalText(prediction.confidence)} · This is an inference, not a fact.</span></div></div><section class="prediction-drivers"><header><small>REASONING DRIVERS</small><span>Goal-specific weighting</span></header><div>${driverMarkup}</div></section>`;

    reasoningSuggestionList.innerHTML = suggestions.map((suggestion, index) => {
      const settled = suggestion.decision === 'confirmed' || suggestion.decision === 'rejected';
      const stateClass = suggestion.decision === 'confirmed' ? ' is-confirmed' : suggestion.decision === 'rejected' ? ' is-rejected' : '';
      const resultText = suggestion.decision === 'confirmed' ? 'Confirmed · related subgoal updated' : suggestion.decision === 'rejected' ? 'Suggestion rejected · no action taken' : 'Ready for your decision';
      const confirmLabel = suggestion.selectedOption ? `Confirm ${suggestion.selectedOption}` : suggestion.action;
      return `<article class="suggestion-card${stateClass}" data-suggestion-index="${index}" data-updates-subgoal="${suggestion.updates}"><header><span><i></i>${escapeGoalText(suggestion.label)}</span><small>AI proposal ${String(index + 1).padStart(2, '0')}</small></header><h3>${escapeGoalText(suggestion.title)}</h3><p class="suggestion-rationale"><i></i>Tailored to this goal’s current context and risk profile.</p><div class="suggestion-actions"><button class="suggestion-confirm" type="button" data-suggestion-decision="confirm" aria-label="Confirm: ${escapeGoalText(confirmLabel)}"${settled ? ' disabled' : ''}>${escapeGoalText(confirmLabel)}</button><button type="button" data-suggestion-decision="adjust" aria-expanded="false"${settled ? ' disabled' : ''}>Adjust</button><button class="suggestion-reject" type="button" data-suggestion-decision="reject"${settled ? ' disabled' : ''}>Reject</button></div><div class="suggestion-adjuster">${suggestion.options.map(option => `<button type="button" data-suggestion-option="${escapeGoalText(option)}"${settled ? ' disabled' : ''}>${escapeGoalText(option)}</button>`).join('')}</div><div class="suggestion-result"><i>${suggestion.decision === 'rejected' ? '×' : '✓'}</i><span>${resultText}</span></div></article>`;
    }).join('');
    const unresolvedSuggestions = suggestions.filter(suggestion => !suggestion.decision).length;
    suggestionCount.textContent = unresolvedSuggestions ? `${unresolvedSuggestions} ready` : 'Reviewed';
  }

  function selectGoal(index, announce = true) {
    if (!goalProfiles.length) { renderEmptyGoalWorkspace(); return; }
    const safeIndex = Math.max(0, Math.min(goalProfiles.length - 1, index));
    const goal = goalProfiles[safeIndex];
    const syncSequence = ++goalSyncSequence;
    state.goalSyncing = announce ? 'loading' : false;
    closeGoalMonitoringPopover();
    closeGoalResultDrawer();
    goalsWorkspace.classList.remove('no-goals');
    goalMenuButton.disabled = false;
    goalMoreButton.disabled = false;
    goalDeleteButton.disabled = false;
    goalNextAction.innerHTML = 'Review next decision <span>→</span>';
    state.currentGoalIndex = safeIndex;
    state.currentGoalProgress = goal.progress;
    invalidateTopology();
    const core = nodes.find(node => node.id === 'goals-core');
    state.selectedNode = core || null;
    state.hoverNode = null;
    hideTooltip();
    renderGoalCommandCenter(goal);
    renderGoalCollection();
    triggerReasoningUpdate(announce ? 'Refreshing this goal’s context' : 'Current context synthesized');
    document.documentElement.style.setProperty('--goal-rgb', goal.accent);
    if (announce) {
      __showToast(`${goal.title} opened`);
      window.setTimeout(() => {
        if (syncSequence !== goalSyncSequence || goalProfiles[state.currentGoalIndex] !== goal) return;
        state.goalSyncing = 'syncing';
        renderGoalHardwareState(goal);
      }, reduceMotion ? 0 : 170);
      window.setTimeout(() => {
        if (syncSequence !== goalSyncSequence || goalProfiles[state.currentGoalIndex] !== goal) return;
        state.goalSyncing = false;
        renderGoalHardwareState(goal);
      }, reduceMotion ? 0 : 620);
    }
  }

  function resetGoalNodes() {
    state.currentGoalIndex = Math.max(0, Math.min(goalProfiles.length - 1, state.currentGoalIndex));
    topologyDirty = true;
  }

  function openCommandCollaboration(goal, subgoalIndex) {
    const subgoal = goal?.subgoals[subgoalIndex];
    if (!subgoal) return;
    collaborationSheet.dataset.subgoal = subgoal.name;
    if (subgoal.collaborationEnabled) {
      collaborationSheet.dataset.mode = 'candidate';
      collaborationTitle.textContent = 'Review a de-identified match?';
      collaborationDescription.textContent = `A potential collaborator complements "${subgoal.name}." Identity remains hidden at this stage.`;
      consentRules.innerHTML = '<span><i>87%</i><b>Complementary goals</b><small>The match has compatible intent, capability, and collaboration preferences.</small></span><span><i>6h</i><b>Compatible availability</b><small>Six overlapping hours are available across the next two weeks.</small></span><span><i>01</i><b>Progressive disclosure</b><small>No identity or contact detail is shared until interest is mutual.</small></span>';
      collaborationCancel.textContent = 'Not now';
      collaborationConfirm.textContent = 'Express interest';
    } else {
      collaborationSheet.dataset.mode = 'opt-in';
      collaborationTitle.textContent = 'Open this direct subgoal to collaboration?';
      collaborationDescription.textContent = `Review the minimum information that may be shared for "${subgoal.name}" before opting in.`;
      consentRules.innerHTML = defaultConsentRules;
      collaborationCancel.textContent = 'Keep private';
      collaborationConfirm.textContent = 'Review & opt in';
    }
    collaborationSheet.classList.add('visible');
    collaborationSheet.setAttribute('aria-hidden', 'false');
    goalsWorkspace.classList.add('consent-open');
    collaborationClose.focus();
  }

  function triggerReasoningUpdate(message = 'New context synthesized') {
    window.clearTimeout(reasoningUpdateTimer);
    goalPrimaryActionPanel?.classList.remove('is-generating');
    if (goalPrimaryActionPanel) void goalPrimaryActionPanel.offsetWidth;
    goalPrimaryActionPanel?.classList.add('is-generating');
    if (goalDecisionState) goalDecisionState.textContent = 'Synthesizing';
    if (goalAIState) {
      goalAIState.dataset.state = 'working';
      goalAIState.innerHTML = '<i></i><b>Working</b>';
    }
    if (aiReasoningMessage) aiReasoningMessage.textContent = message;
    reasoningUpdateTimer = window.setTimeout(() => {
      goalPrimaryActionPanel?.classList.remove('is-generating');
      const currentGoal = goalProfiles[state.currentGoalIndex];
      if (currentGoal) renderGoalResultsSurface(currentGoal);
      if (aiReasoningMessage) aiReasoningMessage.textContent = 'Current context synthesized';
    }, reduceMotion ? 500 : 1750);
  }

  function confirmGoalSuggestion(goal, suggestion) {
    if (!goal || !suggestion || suggestion.decision) return false;
    suggestion.decision = 'confirmed';
    suggestion.executionState = 'preparing';
    persistCustomGoals();
    renderGoalCommandCenter(goal);
    renderGoalCollection();
    triggerReasoningUpdate('Plan updated from your decision');
    haptic(14);
    __showToast(`${suggestion.action} approved - AI is preparing`);
    window.setTimeout(() => {
      if (!goalProfiles.includes(goal) || suggestion.decision !== 'confirmed') return;
      suggestion.executionState = 'executing';
      if (goalProfiles[state.currentGoalIndex] === goal) renderGoalCommandCenter(goal);
      __showToast(`${suggestion.action} is executing securely`);
      window.setTimeout(() => {
        if (!goalProfiles.includes(goal) || suggestion.decision !== 'confirmed') return;
        const subgoal = goal.subgoals[Number(suggestion.updates)];
        if (subgoal) {
          ensureGoalCommandModel(goal);
          const previouslyComplete = subgoal.executionTasks.filter(task => task.done).length;
          subgoal.executionTasks.forEach(task => { task.done = true; task.state = 'Completed'; });
          subgoal.confirmed = true;
          goal.completedThisMonth = Math.max(0, Number(goal.completedThisMonth || 0) + subgoal.executionTasks.length - previouslyComplete);
          syncGoalTaskStats(goal);
          updateGoalCompletionSummary(goal);
          persistGoalPlanOverrides();
        }
        suggestion.executionState = 'completed';
        persistCustomGoals();
        if (goalProfiles[state.currentGoalIndex] === goal) renderGoalCommandCenter(goal);
        renderGoalCollection();
        haptic(12);
        __showToast(`${suggestion.action} completed - goal plan updated`);
      }, reduceMotion ? 0 : 1700);
    }, reduceMotion ? 0 : 850);
    return true;
  }

  function closeGoalActionMenu() {
    goalActionMenu.classList.remove('visible');
    goalActionMenu.setAttribute('aria-hidden', 'true');
    goalMoreButton.setAttribute('aria-expanded', 'false');
  }

  function openGoalDeleteSheet() {
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;
    closeGoalActionMenu();
    goalDeleteTitle.textContent = `Delete "${goal.title}"?`;
    goalDeleteDescription.textContent = `This removes "${goal.title}", its direct subgoals, execution tasks, and prepared outputs from this device.`;
    goalDeleteSheet.classList.add('visible');
    goalDeleteSheet.setAttribute('aria-hidden', 'false');
    goalsWorkspace.classList.add('delete-open');
    window.setTimeout(() => goalDeleteCancel.focus(), 100);
  }

  function closeGoalDeleteSheet() {
    goalDeleteSheet.classList.remove('visible');
    goalDeleteSheet.setAttribute('aria-hidden', 'true');
    goalsWorkspace.classList.remove('delete-open');
  }

  function renderEmptyGoalWorkspace() {
    goalsWorkspace.classList.add('no-goals');
    if (goalGameContent) goalGameContent.innerHTML = '<div class="goal-game-empty-state"><b>Create your first goal</b><button type="button" data-empty-goal-add>New goal</button></div>';
    renderGoalCollection();
    renderGoalRail();
    goalCommandTitle.textContent = 'Create your first goal';
    goalCommandOutcome.textContent = 'Describe the outcome you want. Weeple will propose a simple path for your review.';
    goalCategoryLabel.textContent = 'GET STARTED';
    goalUpdatedLabel.textContent = 'No active goals';
    goalCommandMeta.innerHTML = '<span><i></i>No connected goal context</span>';
    goalCommandProgress.style.setProperty('--progress', 0);
    goalCommandProgress.innerHTML = '<strong>0<small>%</small></strong>';
    goalCommandStatus.textContent = 'Ready when you are';
    goalNextMilestone.textContent = 'Next: describe a desired outcome';
    goalNextAction.innerHTML = 'Create a goal <span>+</span>';
    goalMenuButton.disabled = true;
    goalMoreButton.disabled = true;
    goalDeleteButton.disabled = true;
    activeGoalTitle.textContent = 'No active goal';
    activeGoalStatus.textContent = 'Not started';
    goalCompletionSummary.textContent = '0 tasks';
    goalProposalInbox.innerHTML = '<div class="empty-goal-callout"><span><b>Start with the outcome</b><small>AI will propose direct subgoals, but nothing is added until you confirm it.</small></span><button type="button" data-empty-goal-add>Create goal</button></div>';
    reasoningSubgoalList.innerHTML = '';
    reasoningPredictionContent.innerHTML = '';
    reasoningSuggestionList.innerHTML = '';
    suggestionCount.textContent = 'No goal';
    goalSupportPanel.innerHTML = '';
    if (goalMomentumLabel) goalMomentumLabel.textContent = 'GET STARTED';
    if (goalMotivationMessage) goalMotivationMessage.textContent = 'A clear outcome is enough to begin.';
    if (goalMotivationDetail) goalMotivationDetail.textContent = 'Weeple will propose a simple plan for your review.';
    if (goalResultStream) goalResultStream.innerHTML = '<button class="goal-result-item next" type="button" data-empty-goal-add style="--result-rgb:255,94,0"><i class="goal-result-symbol">+</i><span class="goal-result-copy"><small>FIRST STEP</small><b>Create a goal</b><em>Describe the result you want to achieve.</em></span><strong>Start</strong></button>';
    if (goalPrimaryAction) goalPrimaryAction.innerHTML = '<article class="goal-result-action-card"><span>READY WHEN YOU ARE</span><h2 id="goalPrimaryActionTitle">Start with the outcome</h2><p>AI will propose direct subgoals and useful next actions, but nothing is confirmed without you.</p><div class="goal-primary-buttons"><button class="primary" type="button" data-empty-goal-add>Create a goal</button></div></article>';
  }

  function finalizePendingGoalDeletion() {
    if (!pendingGoalDeletion) return;
    const { goal } = pendingGoalDeletion;
    clearTimeout(pendingGoalDeletion.timer);
    if (!goal.custom) deletedGoalTitles.add(goal.title);
    persistDeletedGoals();
    persistCustomGoals();
    pendingGoalDeletion = null;
  }

  function undoGoalDeletion() {
    if (!pendingGoalDeletion) return;
    const { goal, index, timer } = pendingGoalDeletion;
    clearTimeout(timer);
    pendingGoalDeletion = null;
    deletedGoalTitles.delete(goal.title);
    goalProfiles.splice(Math.min(index, goalProfiles.length), 0, goal);
    persistDeletedGoals();
    persistCustomGoals();
    selectGoal(goalProfiles.indexOf(goal), false);
    haptic(10);
    __showToast(`${goal.title} restored`);
  }

  function deleteSelectedGoal() {
    finalizePendingGoalDeletion();
    const deleteIndex = state.currentGoalIndex;
    const goal = goalProfiles[deleteIndex];
    if (!goal) return;
    goalProfiles.splice(deleteIndex, 1);
    persistCustomGoals();
    closeGoalDeleteSheet();
    if (goalProfiles.length) selectGoal(Math.min(deleteIndex, goalProfiles.length - 1), false);
    else renderEmptyGoalWorkspace();
    pendingGoalDeletion = { goal, index: deleteIndex, timer: window.setTimeout(finalizePendingGoalDeletion, 8500) };
    haptic(14);
    __showToast(`${goal.title} deleted`, { actionLabel: 'Undo', duration: 8000, onAction: undoGoalDeletion });
  }

  function closeCollaborationSheet() {
    collaborationSheet.classList.remove('visible');
    collaborationSheet.setAttribute('aria-hidden', 'true');
    goalsWorkspace.classList.remove('consent-open');
  }

  function openGoalCreateSheet() {
    goalFormMode = 'create';
    editingGoalIndex = -1;
    state.goalProposalReady = false;
    goalCreateForm.reset();
    goalCreateSheet.dataset.mode = 'create';
    goalCreateTitle.textContent = 'Describe the outcome—not the hierarchy.';
    goalCreateDescription.textContent = 'Weeple may propose direct subgoals and execution tasks, but nothing is added until you confirm it.';
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    newGoalDateInput.min = localToday;
    newGoalTimeInput.disabled = true;
    goalProposalPreview.innerHTML = '<i></i><span><strong>AI proposal not generated yet</strong><small>Your description stays editable until you confirm the goal.</small></span>';
    goalProposeButton.textContent = 'Propose direct subgoals';
    goalCreateSheet.classList.add('visible');
    goalCreateSheet.setAttribute('aria-hidden', 'false');
    goalsWorkspace.classList.add('goal-create-open');
    window.setTimeout(() => document.getElementById('newGoalOutcome').focus(), 120);
  }

  function openGoalEditSheet() {
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;
    ensureGoalCommandModel(goal);
    goalFormMode = 'edit';
    editingGoalIndex = state.currentGoalIndex;
    state.goalProposalReady = true;
    goalCreateForm.reset();
    goalCreateSheet.dataset.mode = 'edit';
    goalCreateTitle.textContent = 'Edit this goal without losing its progress.';
    goalCreateDescription.textContent = 'Update the goal or its constraints. The confirmed plan, completed work, and current AI context stay connected.';
    document.getElementById('newGoalOutcome').value = goal.title || '';
    document.getElementById('newGoalSituation').value = goal.currentSituation || goal.description || '';
    document.getElementById('newGoalConstraints').value = goal.constraints || '';
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    newGoalDateInput.min = localToday;
    let goalDate = goal.scheduledDate || '';
    if (!goalDate && Number.isFinite(goal.scheduleOffset)) {
      const scheduled = new Date(today.getFullYear(), today.getMonth(), today.getDate() + goal.scheduleOffset);
      goalDate = `${scheduled.getFullYear()}-${String(scheduled.getMonth() + 1).padStart(2, '0')}-${String(scheduled.getDate()).padStart(2, '0')}`;
    }
    newGoalDateInput.value = goalDate;
    newGoalTimeInput.disabled = !goalDate;
    newGoalTimeInput.value = goalDate ? (goal.scheduledTime || '') : '';
    goalProposalPreview.innerHTML = '<i></i><span><strong>Current AI plan will be preserved</strong><small>Completed work, observations, predictions, and approved actions remain attached to this goal.</small></span>';
    goalProposeButton.textContent = 'Save goal changes';
    goalCreateSheet.classList.add('visible');
    goalCreateSheet.setAttribute('aria-hidden', 'false');
    goalsWorkspace.classList.add('goal-create-open');
    haptic(5);
    window.setTimeout(() => document.getElementById('newGoalOutcome').focus(), 120);
  }

  function closeGoalCreateSheet() {
    goalCreateSheet.classList.remove('visible');
    goalCreateSheet.setAttribute('aria-hidden', 'true');
    goalsWorkspace.classList.remove('goal-create-open');
  }

  function formatGoalSchedule(dateValue, timeValue) {
    if (!dateValue) return '';
    const date = new Date(`${dateValue}T12:00:00`);
    const dateLabel = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    if (!timeValue) return dateLabel;
    const [hours, minutes] = timeValue.split(':').map(Number);
    const timedDate = new Date(date);
    timedDate.setHours(hours, minutes, 0, 0);
    return `${dateLabel} · ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(timedDate)}`;
  }

  function openGoalsWorkspace(goalIndex = state.currentGoalIndex, announce = true) {
    state.goalWorkspaceActive = true;
    stopTopologyLoop();
    goalsWorkspace.classList.add('visible');
    goalsWorkspace.setAttribute('aria-hidden', 'false');
    osShell.classList.add('goals-page');
    goalPlanVisualEnter = true;
    selectGoal(goalIndex, false);
    focusCluster('goals', false);
    showGoalUseHint();
    if (announce) __showToast('Goal universe opened');
  }

  function closeGoalsWorkspace() {
    if (!state.goalWorkspaceActive) return;
    state.goalWorkspaceActive = false;
    goalsWorkspace.classList.remove('visible');
    goalsWorkspace.setAttribute('aria-hidden', 'true');
    osShell.classList.remove('goals-page');
    closeCollaborationSheet();
    closeGoalCreateSheet();
    resetGoalNodes();
  }

  const dataSources = [
    { id: 'iphone', name: 'Xiaomi Phone', category: 'device', type: 'Personal device', method: 'Local device bridge', status: 'Connected', statusType: 'connected', lastSync: '2m ago', assets: '286 signals', scopes: ['App activity', 'Selected photos', 'Device health'], purposes: ['Daily context', 'Goal support'], usedBy: 'Morning brief · 09:10' },
    { id: 'macbook', name: 'Work Laptop', category: 'device', type: 'Personal device', method: 'Encrypted LAN', status: 'Connected', statusType: 'connected', lastSync: '6m ago', assets: '42 work items', scopes: ['Selected folders', 'Work activity'], purposes: ['Project planning'], usedBy: 'Product recommendation · Now' },
    { id: 'dashcam', name: 'Dash Cam', category: 'device', type: 'Storage device', method: 'USB connection', status: 'Needs attention', statusType: 'attention', lastSync: 'Failed 1h ago', assets: '0 new assets', scopes: ['Selected recordings'], purposes: ['Travel archive'], usedBy: 'No AI task used this source' },
    { id: 'documents', name: 'Personal Documents', category: 'files', type: 'Files & folders', method: 'Explicit local selection', status: 'Connected', statusType: 'connected', lastSync: '12m ago', assets: '124 files', scopes: ['Selected documents'], purposes: ['Local semantic search'], usedBy: 'Research summary · Today' },
    { id: 'research', name: 'Product Research', category: 'files', type: 'Knowledge materials', method: 'Watched local folder', status: 'Processing', statusType: 'processing', lastSync: 'Processing now', assets: '38 notes', scopes: ['Research folder'], purposes: ['Product goal'], usedBy: 'Prototype recommendation · Now' },
    { id: 'calendar', name: 'Calendar', category: 'productivity', type: 'Calendar & productivity', method: 'Official API', status: 'Connected', statusType: 'connected', lastSync: 'Live', assets: '18 upcoming events', scopes: ['Event title', 'Time & availability'], purposes: ['Planning', 'Reminders'], usedBy: 'Today plan · Now' },
    { id: 'notion', name: 'Notion Workspace', category: 'productivity', type: 'Productivity service', method: 'MCP extension', status: 'Connected', statusType: 'connected', lastSync: '14m ago', assets: '62 pages', scopes: ['Selected workspace'], purposes: ['Project context'], usedBy: 'Weekly review · Yesterday' },
    { id: 'fitness', name: 'Apple Fitness', category: 'health', type: 'Health & lifestyle', method: 'Account authorization', status: 'Connected', statusType: 'connected', lastSync: '8m ago', assets: '42 metrics', scopes: ['Activity', 'Sleep summary'], purposes: ['Health goal'], usedBy: 'Recovery insight · 08:40' },
    { id: 'identity', name: 'Digital Identity', category: 'identity', type: 'Public identity candidates', method: 'Maigret discovery', status: 'Review required', statusType: 'attention', lastSync: 'Yesterday', assets: '4 candidates', scopes: ['Public usernames only'], purposes: ['Identity review'], usedBy: 'Not available to AI until confirmed' },
    { id: 'wechat', name: 'WeChat', category: 'communication', type: 'Communication data', method: 'Authorized adapter', status: 'Connected', statusType: 'connected', lastSync: '21m ago', assets: 'Selected conversations', scopes: ['Chosen chats only'], purposes: ['Relationship context'], usedBy: 'Family reminder · Yesterday' },
    { id: 'drive', name: 'Cloud Drive', category: 'files', type: 'Third-party service', method: 'Official API', status: 'Connected', statusType: 'connected', lastSync: '33m ago', assets: '86 files', scopes: ['Selected folders'], purposes: ['Document retrieval'], usedBy: 'Meeting preparation · Today' },
    { id: 'web', name: 'DeepSearch', category: 'identity', type: 'External public information', method: 'On-demand tool', status: 'Available on demand', statusType: 'idle', lastSync: 'Never runs automatically', assets: '0 retained results', scopes: ['Per-task query only'], purposes: ['Current research'], usedBy: 'External use always disclosed' }
  ];

  function sourceStatusLabel(source) {
    if (source.aiEnabled === false && source.statusType !== 'revoked') return '<span class="source-status paused"><i></i>Paused</span>';
    return `<span class="source-status ${source.statusType}"><i></i>${source.status}</span>`;
  }

  function sourceAdapterIcon(source) {
    const icons = {
      iphone: '<rect x="8" y="3" width="16" height="26" rx="4"/><path d="M14 7h4M15 25h2"/>',
      macbook: '<rect x="5" y="6" width="22" height="15" rx="2"/><path d="M3 25h26l-2 3H5l-2-3Z"/>',
      dashcam: '<path d="M7 10h18a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3Z"/><circle cx="17" cy="18" r="5"/><path d="m9 10 2-4h9l2 4"/>',
      documents: '<path d="M9 3h11l7 7v19H9z"/><path d="M20 3v8h7M13 17h10M13 22h10"/>',
      research: '<path d="M8 4h14a3 3 0 0 1 3 3v9"/><path d="M8 4a3 3 0 0 0-3 3v20h12"/><circle cx="22" cy="22" r="5"/><path d="m26 26 4 4"/>',
      calendar: '<rect x="4" y="6" width="24" height="23" rx="4"/><path d="M4 13h24M10 3v6M22 3v6M10 18h4v4h-4z"/>',
      notion: '<rect x="5" y="4" width="24" height="26" rx="3"/><path d="M10 24V10l12 14V10"/>',
      fitness: '<path d="M17 28S5 21 5 13a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 8-10 15-10 15Z"/><path d="m9 18 4-1 2-5 4 10 2-5 4-1"/>',
      identity: '<circle cx="16" cy="11" r="6"/><path d="M5 29c1-7 5-10 11-10s10 3 11 10"/><path d="m23 7 2 2 4-4"/>',
      wechat: '<path d="M4 14c0-6 5-10 12-10s12 4 12 10-5 10-12 10c-2 0-4-.4-5.5-1.2L6 25l1.2-4C5.2 19.2 4 16.8 4 14Z"/><path d="M17 20c0-4 3.5-7 8-7s7 3 7 7-3 7-7 7c-1.3 0-2.5-.2-3.6-.7L18 28l.8-3c-1.1-1.3-1.8-3-1.8-5Z"/>',
      drive: '<path d="m16 4 6 10H10L16 4Z"/><path d="m10 14-6 10h12l6-10H10Z"/><path d="m22 14 6 10H16l6-10Z"/>',
      web: '<circle cx="16" cy="16" r="13"/><path d="M3 16h26M16 3c4 4 6 8 6 13s-2 9-6 13c-4-4-6-8-6-13s2-9 6-13Z"/>'
    };
    return `<svg viewBox="0 0 32 32" aria-hidden="true">${icons[source.id] || icons.web}</svg>`;
  }

  function reconnectSource(source, button) {
    if (!source || source.statusType !== 'revoked' || button?.disabled) return;
    if (button) {
      button.disabled = true;
      button.textContent = 'Reconnecting...';
    }
    window.setTimeout(() => {
      source.status = 'Connected';
      source.statusType = 'connected';
      source.aiEnabled = true;
      source.lastSync = 'Reconnected now';
      source.usedBy = 'Available for future authorized AI tasks';
      renderSourceGrid();
      if (state.selectedSourceId === source.id) renderSourceInspector(source);
      __showToast(`${source.name} reconnected securely`);
    }, 650);
  }

  function renderSourceGrid() {
    const visibleSources = state.sourceFilter === 'all' ? dataSources : dataSources.filter(source => source.category === state.sourceFilter);
    sourceCount.textContent = `${visibleSources.length} source${visibleSources.length === 1 ? '' : 's'}`;
    sourceGrid.innerHTML = visibleSources.map((source, index) => `
      <article class="source-card${source.aiEnabled === false ? ' is-paused' : ''}" data-source-id="${source.id}" style="--card-order:${index}">
        <span class="source-mini-icon ${source.category}">${sourceAdapterIcon(source)}</span>
        <span class="source-card-copy"><strong>${source.name}</strong>${sourceStatusLabel(source)}</span>
        <footer>
          <span><small>Last sync</small><b>${source.lastSync}</b></span>
          <button class="manage" type="button" data-source-manage="${source.id}" aria-haspopup="dialog"><span>Manage</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 5 5 5-5 5"/></svg></button>
        </footer>
      </article>
    `).join('');
    sourceGrid.querySelectorAll('.source-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch') return;
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty('--glass-x', `${x * 100}%`);
        card.style.setProperty('--glass-y', `${y * 100}%`);
        card.style.setProperty('--tilt-x', `${(0.5 - y) * 3.5}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 4.5}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });
    sourceGrid.querySelectorAll('[data-source-manage]').forEach(button => button.addEventListener('click', () => selectSource(button.dataset.sourceManage, button)));
  }

  function renderSourceInspector(source) {
    const revoked = source.statusType === 'revoked';
    sourceInspectorContent.innerHTML = `
      <header class="source-detail-header"><span><i></i>AUTHORIZATION DETAIL</span>${sourceStatusLabel(source)}<h2 id="sourceInspectorTitle">${source.name}</h2><p>${source.type} · ${source.method}</p></header>
      ${revoked ? '<div class="revoked-banner"><i></i><span><strong>Access revoked</strong><small>This source is excluded from every future AI task.</small></span></div>' : ''}
      <section class="source-detail-block"><header><strong>Authorized scope</strong><span>Minimum access</span></header>${source.scopes.map((scope, index) => `<button class="scope-toggle${revoked ? '' : ' on'}" type="button" data-scope-index="${index}" aria-pressed="${String(!revoked)}"><span><i></i>${scope}</span><em></em></button>`).join('')}</section>
      <section class="source-detail-block"><header><strong>Allowed purposes</strong><span>You control this</span></header><div class="purpose-chips">${source.purposes.map(purpose => `<span>${purpose}</span>`).join('')}</div></section>
      <section class="source-use-log"><small>RECENT AI USE</small><strong>${source.usedBy}</strong><span>Last synchronization: ${source.lastSync}</span></section>
      <section class="source-processing"><span><i></i><b>Processing location</b><small>${source.category === 'identity' ? 'Public discovery with review gate' : 'Encrypted local processing where available'}</small></span><em>${source.assets}</em></section>
      <div class="source-detail-actions">${revoked ? '<button class="source-sync source-reconnect" type="button">Reconnect source</button>' : '<button class="source-sync" type="button">Sync now</button>'}<button class="source-revoke" type="button" ${revoked ? 'disabled' : ''}>Revoke access</button></div>
    `;
    sourceInspectorContent.querySelectorAll('.scope-toggle').forEach(button => button.addEventListener('click', () => {
      if (revoked) return;
      const on = button.classList.toggle('on');
      button.setAttribute('aria-pressed', String(on));
      __showToast(`${button.textContent.trim()} ${on ? 'allowed' : 'excluded from future tasks'}`);
    }));
    const syncButton = sourceInspectorContent.querySelector('.source-sync');
    syncButton.addEventListener('click', () => {
      if (syncButton.classList.contains('source-reconnect')) { reconnectSource(source, syncButton); return; }
      if (syncButton.disabled || syncButton.classList.contains('is-loading')) return;
      syncButton.classList.add('is-loading');
      syncButton.textContent = 'Synchronizing…';
      window.setTimeout(() => { syncButton.classList.remove('is-loading'); syncButton.textContent = 'Sync now'; __showToast(`${source.name} synchronized securely`); }, 760);
    });
    const revokeButton = sourceInspectorContent.querySelector('.source-revoke');
    revokeButton.addEventListener('click', () => {
      if (revokeButton.disabled) return;
      if (!revokeButton.classList.contains('confirming')) {
        revokeButton.classList.add('confirming');
        revokeButton.textContent = 'Confirm revoke';
        __showToast('Confirm to stop all future AI use of this source');
        return;
      }
      source.status = 'Revoked'; source.statusType = 'revoked'; source.aiEnabled = false; source.lastSync = 'Access stopped'; source.usedBy = 'Future AI use is blocked';
      renderSourceGrid(); renderSourceInspector(source); __showToast(`${source.name} access revoked`);
    });
  }

  let sourceInspectorTriggerId = '';

  function selectSource(id, trigger = null) {
    const source = dataSources.find(item => item.id === id) || dataSources[0];
    state.selectedSourceId = source.id;
    sourceInspectorTriggerId = trigger?.dataset.sourceManage || source.id;
    renderSourceInspector(source);
    sourceInspector.classList.add('visible');
    sourceInspector.setAttribute('aria-hidden', 'false');
    dataWorkspace.classList.add('inspector-open');
    window.requestAnimationFrame(() => sourceInspectorClose?.focus());
  }

  function closeSourceInspector(restoreFocus = true) {
    if (!sourceInspector?.classList.contains('visible')) return;
    sourceInspector.classList.remove('visible');
    sourceInspector.setAttribute('aria-hidden', 'true');
    dataWorkspace.classList.remove('inspector-open');
    if (restoreFocus && sourceInspectorTriggerId) {
      window.requestAnimationFrame(() => sourceGrid.querySelector(`[data-source-manage="${sourceInspectorTriggerId}"]`)?.focus());
    }
  }

  function openConnectionWizard() {
    connectionWizard.classList.add('visible');
    connectionWizard.setAttribute('aria-hidden', 'false');
    dataWorkspace.classList.add('wizard-open');
  }

  function closeConnectionWizard() {
    connectionWizard.classList.remove('visible');
    connectionWizard.setAttribute('aria-hidden', 'true');
    dataWorkspace.classList.remove('wizard-open');
    wizardContinue.disabled = true;
    connectionWizard.querySelectorAll('[data-wizard-source]').forEach(item => item.classList.remove('active'));
  }

  const memories = [
    { id: 1, type: 'goal', title: 'Product outcome', detail: 'Wants the personal AI product to produce a verifiable first result quickly.', source: 'Confirmed from goal setup', use: true },
    { id: 2, type: 'preference', title: 'Deep-work preference', detail: 'Best focus time is 9:30–11:30 on weekdays.', source: 'Confirmed from calendar pattern', use: true },
    { id: 3, type: 'relationship', title: 'Family planning preference', detail: 'Protect Sunday afternoon for shared family time when possible.', source: 'User-confirmed correction', use: true },
    { id: 4, type: 'preference', title: 'Recommendation style', detail: 'Prefers concise recommendations with evidence and one clear next action.', source: 'Derived, then confirmed', use: true },
    { id: 5, type: 'goal', title: 'Spanish practice', detail: 'Conversational confidence is more important than test performance.', source: 'Goal description', use: false }
  ];

  function renderMemories(filter = 'all') {
    const visible = filter === 'all' ? memories : memories.filter(memory => memory.type === filter);
    memoryList.innerHTML = visible.map(memory => `
      <article class="memory-item" data-memory-id="${memory.id}"><header><span>${memory.type.toUpperCase()}</span><em>${memory.source}</em></header><p>${memory.detail}</p><footer><button class="memory-use${memory.use ? ' on' : ''}" type="button" aria-pressed="${memory.use}"><i></i>${memory.use ? 'Available to AI' : 'Excluded from AI'}</button><button class="memory-edit" type="button">Correct</button><button class="memory-delete" type="button">Delete</button></footer></article>
    `).join('');
    memoryList.querySelectorAll('.memory-item').forEach(item => {
      const memory = memories.find(entry => entry.id === Number(item.dataset.memoryId));
      item.querySelector('.memory-use').addEventListener('click', event => {
        memory.use = !memory.use; renderMemories(filter); __showToast(memory.use ? 'Memory available to future AI tasks' : 'Memory excluded from future AI tasks');
      });
      item.querySelector('.memory-edit').addEventListener('click', openMemoryProposal);
      item.querySelector('.memory-delete').addEventListener('click', event => {
        const button = event.currentTarget;
        if (!button.classList.contains('confirming')) { button.classList.add('confirming'); button.textContent = 'Confirm'; return; }
        const index = memories.indexOf(memory); if (index >= 0) memories.splice(index, 1); renderMemories(filter); __showToast('Memory permanently deleted');
      });
    });
  }

  function openMemoryDrawer() {
    memoryDrawer.classList.add('visible'); memoryDrawer.setAttribute('aria-hidden', 'false'); useWorkspace.classList.add('memory-open'); renderMemories();
  }
  function closeMemoryDrawer() { memoryDrawer.classList.remove('visible'); memoryDrawer.setAttribute('aria-hidden', 'true'); useWorkspace.classList.remove('memory-open'); }
  function openMemoryProposal() { memoryProposal.classList.add('visible'); memoryProposal.setAttribute('aria-hidden', 'false'); useWorkspace.classList.add('proposal-open'); }
  function closeMemoryProposal() { memoryProposal.classList.remove('visible'); memoryProposal.setAttribute('aria-hidden', 'true'); useWorkspace.classList.remove('proposal-open'); }

  function appendAssistantExchange(prompt) {
    const user = document.createElement('article'); user.className = 'conversation-message user-message'; user.innerHTML = `<span>YOU</span><p>${prompt.replace(/[<>]/g, '')}</p>`; conversationStream.appendChild(user);
    const preparing = document.createElement('article'); preparing.className = 'conversation-message ai-message preparing'; preparing.innerHTML = '<header><span class="output-type"><i></i>AI TASK IN PROGRESS</span><time>Now</time></header><p>Weeple is checking your authorized context and selecting the minimum tools needed…</p><div class="thinking-line"><i></i><i></i><i></i></div>'; conversationStream.appendChild(preparing); conversationStream.scrollTop = conversationStream.scrollHeight;
    window.setTimeout(() => {
      preparing.classList.remove('preparing');
      preparing.innerHTML = '<header><span class="output-type inference"><i></i>INFERENCE</span><time>Prepared now</time></header><p>The strongest pattern is that your active goals compete for the same morning focus window. I suggest protecting one primary outcome per day.</p><div class="answer-evidence"><small>DATA USED</small><span>Goal plans</span><span>Calendar</span><span>Confirmed preferences</span></div><div class="answer-tools"><small>TOOLS</small><span><i></i>Local semantic search</span><em>No external action taken</em></div>';
      conversationStream.scrollTop = conversationStream.scrollHeight;
    }, 900);
  }

  const useMissionStates = ['idle', 'working'];
  const useMissionSteps = [
    { state: 'idle', label: 'Ready', icon: 'mic' },
    { state: 'working', label: 'Working', icon: 'process' }
  ];
  const useMissionAvatarAssets = {
    idle: 'assets/avater/gif/webp/1 greeting TBG.webp?v=20260812',
    listening: 'assets/avater/gif/webp/1 greeting TBG.webp?v=20260813',
    thinking: 'assets/avater/gif/draft/3.1.2 resize.gif?v=20260812',
    working: 'assets/avater/gif/webp/understanding.webp?v=20260813-webp-2',
    action: 'assets/avater/5.png',
    waiting: 'assets/avater/7.png',
    success: 'assets/avater/8.png'
  };
  const useMissionTimers = new Set();
  let missionListeningTimer = 0;
  let missionMonitorTimer = 0;
  let missionSourceSliderTimer = 0;

  function clearUseMissionTimers() {
    useMissionTimers.forEach(timer => window.clearTimeout(timer));
    useMissionTimers.clear();
    window.clearInterval(missionListeningTimer);
    window.clearInterval(missionMonitorTimer);
    window.clearInterval(missionSourceSliderTimer);
    missionListeningTimer = 0;
    missionMonitorTimer = 0;
    missionSourceSliderTimer = 0;
  }

  function scheduleUseMission(callback, delay) {
    if (!state.useMissionAutoAdvance) return 0;
    const timer = window.setTimeout(() => { useMissionTimers.delete(timer); callback(); }, delay);
    useMissionTimers.add(timer);
    return timer;
  }

  function missionIcon(name) {
    const icons = {
      mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21m-3 0h6"/></svg>',
      edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16-.7 4.7L8 20 19 9l-4-4L4 16Z"/><path d="m13.8 6.2 4 4"/></svg>',
      trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/></svg>',
      restart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8V4m0 0h4M5 4l3.5 3.5A7 7 0 1 1 6 15"/></svg>',
      mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
      users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20a6 6 0 0 1 12 0m1-6a5 5 0 0 1 5 5"/></svg>',
      star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>',
      play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z"/></svg>',
      send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 14-7-4 14-3-6-7-1Z"/></svg>',
      collect: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>',
      understand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4M8.2 14.5A7 7 0 1 1 15.8 14.5c-1.1.8-1.8 1.6-1.8 2.5h-4c0-.9-.7-1.7-1.8-2.5Z"/><path d="M12 5v3m-3-1 2 2m4-2-2 2"/></svg>',
      process: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/></svg>',
      actionStep: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 5 14h6l-1 8 9-13h-6V2Z"/></svg>',
      finish: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4m0 1h10l-2 3 2 3H6"/></svg>',
      download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 19h14"/></svg>',
      share: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.3 10.8 7.4-4.5m-7.4 6.9 7.4 4.5"/></svg>',
      globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
      file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5M9 12h6m-6 4h6"/></svg>'
    };
    return icons[name] || '';
  }

  function renderWaveform(count = 56, paused = false) {
    return `<div class="waveform${paused ? ' paused' : ''}" aria-hidden="true">${Array.from({ length: count }, (_, index) => `<i style="--index:${index};--wave:${28 + ((index * 17) % 66)}%"></i>`).join('')}</div>`;
  }

  function renderMissionAvatar(avatarState, className = '') {
    const source = useMissionAvatarAssets[avatarState] || useMissionAvatarAssets.idle;
    return `<figure class="mission-avatar avatar-${avatarState} ${className}" data-avatar-state="${avatarState}"><img src="${source}" alt="Weeple AI assistant in ${avatarState} state"></figure>`;
  }

  function renderUseMissionProgress() {
    if (!missionProgress) return;
    const activeIndex = useMissionStates.indexOf(state.useMissionState);
    missionProgress.innerHTML = useMissionSteps.map((step, index) => {
      const complete = index < activeIndex || state.useMissionState === 'complete';
      const active = index === activeIndex && state.useMissionState !== 'complete';
      const label = state.useMissionState === 'complete' && index === useMissionSteps.length - 1 ? 'Completed' : step.label;
      return `<button class="mission-step${complete ? ' complete' : active ? ' active' : ''}" type="button" data-mission-target="${step.state}" aria-label="Open ${label}${active ? ', current step' : complete ? ', completed' : ''}"><span class="mission-step-label">${label}</span><span class="mission-step-dot">${complete ? '✓' : missionIcon(step.icon)}</span></button>`;
    }).join('');
  }

  function formatMissionTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  }

  function setUseMissionState(nextState, options = {}) {
    if (!useMissionStates.includes(nextState) || !useMissionStage) return;
    clearUseMissionTimers();
    state.useMissionState = nextState;
    if (nextState !== 'idle') state.useMissionListening = false;
    closeUseMcpDetail(false);
    closeUseAgentDetail(false);
    closeUseTaskDetail(false);
    closeUseGuidelineDetail(false);
    closeUseResultReport(false);
    renderUseMission({ suppressMotion: true, refreshPanels: true });
    if (options.announce !== false) {
      useMissionStage.focus?.({ preventScroll: true });
      if (options.toast) __showToast(useMissionSteps[useMissionStates.indexOf(nextState)]?.label || nextState);
    }
  }

  function startMissionListening() {
    if (state.useMissionListening) return;
    state.useMissionListening = true;
    state.useMissionElapsed = 0;
    renderUseMission({ suppressMotion: true });
    missionListeningTimer = window.setInterval(() => {
      state.useMissionElapsed += 1;
      const elapsed = document.getElementById('missionVoiceElapsed');
      if (elapsed) elapsed.textContent = formatMissionTime(state.useMissionElapsed);
    }, 1000);
    scheduleUseMission(() => setUseMissionState('review'), 5200);
  }

  function renderVoiceMission() {
    return `<section class="mission-screen voice-screen" data-mission-state="voice" data-od-id="mission-state-voice">
      <div class="mission-copy"><p class="mission-kicker" aria-hidden="true">&nbsp;</p><h1>What can I do for you?</h1><p>Talk to your AI assistant. I will handle the rest.</p></div>
      <div class="voice-experience">
        <div class="voice-orbit"><i class="voice-particle p1"></i><i class="voice-particle p2"></i><i class="voice-particle p3"></i>${renderMissionAvatar(state.useMissionListening ? 'listening' : 'idle')}</div>
        <form class="voice-card mission-surface${state.useMissionListening ? ' is-listening' : ' is-idle'}" id="missionPromptForm">
          <button class="voice-trigger${state.useMissionListening ? ' listening' : ''}" id="missionVoiceStart" type="button" aria-label="${state.useMissionListening ? 'Listening to your request' : 'Start voice input'}">${missionIcon('mic')}</button>
          ${state.useMissionListening
            ? `<div class="voice-content"><header><b>Listening...</b><time id="missionVoiceElapsed">${formatMissionTime(state.useMissionElapsed)}</time></header>${renderWaveform(62)}</div><button class="mission-button" id="missionVoiceCancel" type="button">Cancel</button>`
            : `<label class="voice-text-entry" for="missionPromptInput"><input id="missionPromptInput" type="text" maxlength="500" autocomplete="off" placeholder="Type your request, or use the microphone..."></label><button class="mission-send" id="missionPromptSend" type="submit" aria-label="Submit typed request">${missionIcon('send')}</button>`}
        </form>
        <p class="voice-tip"><b>Tip:</b> Try “Find investors for my startup”</p>
      </div>
    </section>`;
  }

  function renderReviewMission() {
    const count = state.useMissionRequest.length;
    return `<section class="mission-screen review-screen" data-mission-state="review" data-od-id="mission-state-review">
      <div class="review-main">
        <div class="mission-copy"><p class="mission-kicker">Review your request</p><h1>I heard you say:</h1></div>
        <div class="review-card mission-surface"><textarea id="missionRequestText" maxlength="500" aria-label="Your request">${state.useMissionRequest}</textarea><footer><span id="missionRequestCount">${count} / 500</span></footer></div>
        <div class="review-actions"><button class="mission-button primary" id="missionConfirmRequest" type="button">Yes, that’s correct ✓</button><button class="mission-button" id="missionRestart" type="button">Start over ${missionIcon('restart')}</button></div>
      </div>
      <div class="review-avatar-wrap"><div class="avatar-speech">Let me confirm so I can get it right!</div><figure class="mission-avatar avatar-thinking" data-avatar-state="thinking"><img src="assets/avater/gif/webp/understanding.webp?v=20260812" alt="Weeple AI assistant in thinking state"></figure></div>
    </section>`;
  }

  function renderCollectingMission() {
    const sourceGroups = [
      {
        id: 'local',
        title: 'Local Data Source',
        eyebrow: 'ON THIS DEVICE',
        sources: [
          { name: 'PowerPoint', image: 'mspx69ey-Microsoft_Office_PowerPoint__2025_present_.svg.webp', logo: 'powerpoint', color: '#d24726', progress: 78 },
          { name: 'PDF Documents', image: 'mspx69ln-4726010.png', logo: 'pdf', color: '#ed1c24', progress: 62 },
          { name: 'Excel', image: 'mspx69lo-Microsoft_Office_Excel__2019_2025_.svg.webp', logo: 'excel', color: '#217346', progress: 84 }
        ]
      },
      {
        id: 'mcp',
        title: 'MCP',
        eyebrow: 'CONNECTED ONLINE',
        sources: [
          { name: 'Telegram', image: 'mspx69m4-Telegram_logo.svg.webp', logo: 'telegram', color: '#229ed9', progress: 72 },
          { name: 'Google Calendar', image: 'mspx69mf-Google_Calendar_icon__2020_.svg.webp', logo: 'calendar', color: '#4285f4', progress: 66 },
          { name: 'Notion', image: 'mspx69o9-Notion-logo.svg.webp', logo: 'notion', color: '#111827', progress: 91 }
        ]
      }
    ];
    const renderSourceLane = group => `<section class="source-lane mission-surface" data-source-lane="${group.id}" data-od-id="collection-${group.id}-sources">
      <header class="source-lane-header"><span><small>${group.eyebrow}</small><h2>${group.title}</h2></span><output data-source-slide-count>1–2 / ${group.sources.length}</output></header>
      <div class="source-slider" data-source-slider="${group.id}" tabindex="0" aria-label="${group.title} sources">
        ${group.sources.map((source, index) => `<article class="source-card loading" style="--source-color:${source.color};--progress:${source.progress}%" data-source-card="${index + 1}" data-od-id="collection-${group.id}-source-${index + 1}"><div class="source-icon" data-source-logo="${source.logo}"><img src="${source.image}" alt="" aria-hidden="true"></div><div class="source-card-body"><h3>${source.name}</h3><p>${group.id === 'local' ? 'Reading authorized files from this device' : 'Collecting through a secure MCP connection'}</p><div class="source-progress" aria-label="${source.progress}% collected"><i></i></div></div></article>`).join('')}
      </div>
      <nav class="source-slider-controls" aria-label="Browse ${group.title} sources"><button type="button" data-source-slide="prev" aria-label="Previous ${group.title} source">‹</button><span aria-hidden="true"></span><button type="button" data-source-slide="next" aria-label="Next ${group.title} source">›</button></nav>
    </section>`;
    return `<section class="mission-screen collection-screen" data-mission-state="collecting" data-od-id="mission-state-collecting">
      <header class="collection-heading mission-copy" data-od-id="collection-heading"><p class="mission-kicker">Collecting data</p><h1>Gathering what we need</h1><p>Bringing local files and connected sources together.</p></header>
      <div class="collection-columns" data-od-id="collection-source-columns">
        ${renderSourceLane(sourceGroups[0])}
        <div class="collection-center" data-od-id="collection-avatar">${renderMissionAvatar('action')}<span class="collection-intake" aria-hidden="true"><i></i></span></div>
        ${renderSourceLane(sourceGroups[1])}
        <svg class="collection-flow-map" viewBox="0 0 1200 360" preserveAspectRatio="none" aria-hidden="true">
          <defs><filter id="collectionFlowGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <path id="collectionFlowLocal" class="collection-flow-path local" d="M 385 315 C 455 330, 510 304, 585 270"/>
          <path id="collectionFlowMcp" class="collection-flow-path mcp" d="M 815 315 C 745 330, 690 304, 615 270"/>
          <circle class="collection-flow-packet local" r="6" filter="url(#collectionFlowGlow)"><animateMotion dur="2.7s" begin="0s" repeatCount="indefinite"><mpath href="#collectionFlowLocal"/></animateMotion></circle>
          <circle class="collection-flow-packet local small" r="4"><animateMotion dur="2.7s" begin="-1.35s" repeatCount="indefinite"><mpath href="#collectionFlowLocal"/></animateMotion></circle>
          <circle class="collection-flow-packet mcp" r="6" filter="url(#collectionFlowGlow)"><animateMotion dur="2.7s" begin="-.45s" repeatCount="indefinite"><mpath href="#collectionFlowMcp"/></animateMotion></circle>
          <circle class="collection-flow-packet mcp small" r="4"><animateMotion dur="2.7s" begin="-1.8s" repeatCount="indefinite"><mpath href="#collectionFlowMcp"/></animateMotion></circle>
        </svg>
      </div>
    </section>`;
  }

  function renderTeamMission() {
    const agents = [
      { name: 'Research Agent', status: 'Working', color: '#15b889', soft: 'rgba(21,184,137,.11)', avatar: 'assets/avater/agents/1-research-agent.png?v=20260812' },
      { name: 'Analysis Agent', status: 'Working', color: '#3b82f6', soft: 'rgba(59,130,246,.11)', avatar: 'assets/avater/agents/2-Analysis-Agent.png?v=20260812' },
      { name: 'Outreach Agent', status: 'Waiting', color: '#ff5e00', soft: 'rgba(255,94,0,.1)', avatar: 'assets/avater/agents/3-Outreach-Agent.png?v=20260812', waiting: true },
      { name: 'Strategy Agent', status: 'Working', color: '#7650d4', soft: 'rgba(118,80,212,.11)', avatar: 'assets/avater/agents/4-Strategy-Agent.png?v=20260812' }
    ];
    return `<section class="mission-screen team-screen" data-mission-state="team" data-od-id="mission-state-team">
      <div class="team-heading"><div class="mission-copy"><p class="mission-kicker">Understanding</p><h1>My AI team is working</h1><p>Multiple agents are collaborating on your request.</p></div><aside class="mission-brief mission-surface"><small>MISSION</small><b>Find investors for my startup</b></aside></div>
      <div class="agent-board">${agents.map(agent => `<article class="agent-card mission-surface${agent.waiting ? ' waiting' : ''}" style="--agent-color:${agent.color};--agent-soft:${agent.soft}"><header class="agent-status"><span><i></i>${agent.name}</span><em>${agent.status}</em></header><figure class="mission-avatar"><img src="${agent.avatar}" alt="${agent.name} ${agent.status.toLowerCase()}"></figure></article>`).join('')}</div>
    </section>`;
  }

  function renderActionMission() {
    const contacts = [
      { name: 'Michael Chen', note: 'Northstar Learning Fund', image: 'assets/avater/1.png', status: 'Email sent', time: '2m ago', sent: true },
      { name: 'Sarah Johnson', note: 'Brightpath Ventures', image: 'assets/avater/3.png', status: 'Waiting reply', time: '—' },
      { name: 'David Lee', note: 'Seedline Capital', image: 'assets/avater/4.png', status: 'Waiting reply', time: '—' }
    ];
    return `<section class="mission-screen action-screen" data-mission-state="action" data-od-id="mission-state-action">
      <div class="action-left"><div class="mission-copy"><p class="mission-kicker">Taking action</p><h1>Reaching out</h1><p>Sending tailored emails and tracking responses.</p></div>${renderMissionAvatar('action')}</div>
      <div class="contact-flow">${contacts.map(contact => `<article class="contact-person mission-surface"><img src="${contact.image}" alt="${contact.name}"><span><b>${contact.name}</b><small>${contact.note}</small></span></article><span class="contact-route" aria-hidden="true">${missionIcon('mail')}</span><article class="contact-status mission-surface${contact.sent ? '' : ' waiting'}"><span><b>${contact.status}</b><small>${contact.time}</small></span><i>${contact.sent ? '✓' : ''}</i></article>`).join('')}</div>
    </section>`;
  }

  function renderMonitoringMission() {
    return `<section class="mission-screen monitor-screen" data-mission-state="monitoring" data-od-id="mission-state-monitoring">
      <div class="monitor-column">
        <article class="monitor-card mission-surface"><header><b>Mission</b><span>82%</span></header><h3>Find investors for my startup</h3><div class="monitor-progress"><span><i></i></span><b>82%</b></div></article>
        <article class="monitor-card mission-surface"><header><b>Latest update</b></header><h3>Waiting for investor replies</h3><div class="monitor-updates"><span><i style="--update-color:#15b889"></i>1 reply received</span><span><i style="--update-color:#ff5e00"></i>2 emails opened</span></div></article>
        <article class="monitor-card mission-surface"><header><b>Time elapsed</b></header><div class="elapsed"><span><b id="missionElapsedHours">01</b><small>HRS</small></span><span><b id="missionElapsedMinutes">26</b><small>MIN</small></span><span><b id="missionElapsedSeconds">40</b><small>SEC</small></span></div></article>
      </div>
      <div class="monitor-center"><div class="mission-copy"><p class="mission-kicker">Monitoring</p><h1>Waiting for responses...</h1></div><div class="monitor-bubble">Monitoring replies securely</div>${renderMissionAvatar('waiting')}</div>
      <article class="timeline-card mission-surface"><h2>What’s happening</h2><div class="monitor-timeline"><span class="monitor-event" style="--event-color:#7650d4"><i>✉</i><span><b>Emails sent</b><small>11:05 AM</small></span><em>✓</em></span><span class="monitor-event" style="--event-color:#ff5e00"><i>◉</i><span><b>Emails opened</b><small>11:18 AM</small></span><em>✓</em></span><span class="monitor-event" style="--event-color:#3b82f6"><i>↩</i><span><b>Reply received</b><small>01:45 PM</small></span><em>✓</em></span><span class="monitor-event pending" style="--event-color:#9aa4b4"><i>•••</i><span><b>More replies</b><small>Monitoring</small></span><em>●</em></span></div></article>
      <div class="monitor-metrics mission-surface"><span style="--metric-color:#7650d4"><i>✉</i><small>Emails sent</small><b>15</b></span><span style="--metric-color:#ff5e00"><i>◉</i><small>Opened</small><b>2</b></span><span style="--metric-color:#3b82f6"><i>↩</i><small>Replies</small><b>1</b></span></div>
      <div class="notify-card mission-surface"><span><i>♢</i>I’ll notify you when I get new replies.</span><div><button class="mission-button" id="missionNotify" type="button">Notify me</button> <button class="mission-button primary" id="missionCompleteNow" type="button">View result</button></div></div>
    </section>`;
  }

  function renderCompleteMission() {
    return `<section class="mission-screen complete-screen" data-mission-state="complete" data-od-id="mission-state-complete">
      <div class="complete-hero mission-surface">${renderMissionAvatar('success')}<div class="complete-copy"><div class="mission-copy"><p class="mission-kicker">Mission delivered</p><h1>Mission complete!</h1></div><p>I found 12 investors, mailed them, and 1 showed interest.</p><div class="result-audio"><button class="audio-play" id="missionAudioPlay" type="button" aria-label="Play spoken mission result">${missionIcon('play')}</button>${renderWaveform(58, true)}</div></div></div>
      <div class="result-goal mission-surface"><span><i>◎</i><span><small>MISSION GOAL</small><b>Find investors for my startup</b></span></span><em class="completed-chip">✓ Completed</em></div>
      <div class="result-metrics mission-surface"><span class="result-metric" style="--metric-color:#15b889"><i>${missionIcon('users')}</i><b>12</b><small>Investors Found</small></span><span class="result-metric" style="--metric-color:#7650d4"><i>${missionIcon('mail')}</i><b>12</b><small>Emails Mailed</small></span><span class="result-metric" style="--metric-color:#ff5e00"><i>${missionIcon('star')}</i><b>1</b><small>Interested</small></span></div>
      <div class="result-actions"><button class="mission-button primary" id="missionDownload" type="button">${missionIcon('download')} Download Report</button><button class="mission-button" id="missionShare" type="button">${missionIcon('share')} Share Report</button><button class="view-details" id="missionViewDetails" type="button">View Details ›</button></div>
    </section>`;
  }

  const useDashboardGoals = [
    {
      title: 'Find investors for my startup', short: 'Find investors', progress: 78, state: 'On track', icon: '◎', tone: 'orange',
      sources: [
        ['LinkedIn', 'assets/logos/linkedin.svg', 'Live', 'linkedin'],
        ['Gmail', '', 'Connected', 'gmail'],
        ['Notion', 'assets/logos/notion.webp', 'Live', 'notion'],
        ['Google Drive', '', 'Connected', 'drive'],
        ['Crunchbase', '', 'Connected', 'crunchbase'],
        ['Calendar', 'assets/logos/Google_Calendar.webp', 'Connected', 'calendar']
      ],
      tasks: [
        ['Find relevant contacts', 'Existing network', 100], ['Analyze relationship strength', 'Warm paths first', 72],
        ['Select top 20 potential contacts', 'Best-fit candidates', 60], ['Prepare outreach plan', 'Personalized drafts', 38], ['Track responses', 'Monitor replies', 12]
      ],
      guidelines: [
        ['Identify suitable investors', 'Industry and stage match', 100], ['Use my existing network', 'Prioritize trusted introductions', 72],
        ['Reach out to high-potential investors', 'Personal messages only', 30], ['Track responses and manage pipeline', 'Follow up without noise', 0]
      ],
      results: [['Contacts Found', 128], ['Conversations Started', 32], ['Positive Responses', 8], ['Meetings Scheduled', 3]]
    },
    {
      title: 'Build my startup', short: 'Build startup', progress: 52, state: 'In progress', icon: '↗', tone: 'blue',
      sources: [
        ['Notion', 'assets/logos/notion.webp', 'Live'], ['GitHub', 'assets/logos/github.svg', 'Live'],
        ['Linear', 'assets/logos/linear.svg', 'Syncing'], ['Figma', 'assets/logos/figma.svg', 'Connected'],
        ['Calendar', 'assets/logos/Google_Calendar.webp', 'Connected'], ['OneDrive', 'assets/logos/one_drive.svg', 'Connected']
      ],
      tasks: [
        ['Review product scope', 'Current roadmap', 100], ['Group customer signals', 'Research themes', 68],
        ['Prioritize next release', 'Impact and effort', 52], ['Prepare launch plan', 'Owners and dates', 24], ['Track delivery risk', 'Daily monitoring', 10]
      ],
      guidelines: [
        ['Confirm the customer problem', 'Use recorded evidence', 100], ['Reduce roadmap risk', 'Remove weak assumptions', 68],
        ['Ship the highest-value slice', 'Keep scope deliberate', 42], ['Measure adoption', 'Watch real behavior', 8]
      ],
      results: [['Signals grouped', 46], ['Decisions ready', 12], ['Risks flagged', 5], ['Owners aligned', 9]]
    },
    {
      title: 'Learn Chinese (HSK 4)', short: 'Learn Chinese', progress: 31, state: 'On track', icon: '文', tone: 'green',
      sources: [
        ['Notion', 'assets/logos/notion.webp', 'Live'], ['Calendar', 'assets/logos/Google_Calendar.webp', 'Live'],
        ['YouTube', 'assets/logos/googlemeet.svg', 'Syncing'], ['PDF notes', 'assets/logos/pdf.png', 'Connected'],
        ['Telegram', 'assets/logos/telegram.webp', 'Connected'], ['Google Tasks', 'assets/logos/googletasks.svg', 'Connected']
      ],
      tasks: [
        ['Review weak vocabulary', 'Last seven sessions', 100], ['Build today’s practice', 'Thirty focused minutes', 74],
        ['Schedule speaking drill', 'Two short sessions', 45], ['Prepare recall cards', 'High-error terms', 28], ['Track weekly consistency', 'Five-day target', 20]
      ],
      guidelines: [
        ['Start with recall gaps', 'Use recent mistakes', 100], ['Balance reading and speaking', 'Alternate every session', 70],
        ['Repeat at useful intervals', 'Avoid passive review', 42], ['Adjust next week', 'Respond to accuracy', 12]
      ],
      results: [['Words reviewed', 84], ['Recall accuracy', '76%'], ['Sessions', 4], ['Day streak', 6]]
    },
    {
      title: 'Improve health & fitness', short: 'Health & fitness', progress: 22, state: 'Needs attention', icon: '♥', tone: 'coral',
      sources: [
        ['Calendar', 'assets/logos/Google_Calendar.webp', 'Live'], ['Notion', 'assets/logos/notion.webp', 'Connected'],
        ['Google Maps', 'assets/logos/google_maps.svg', 'Syncing'], ['WhatsApp', 'assets/logos/whatsapp.svg', 'Connected'],
        ['PDF plan', 'assets/logos/pdf.png', 'Connected'], ['Google Tasks', 'assets/logos/googletasks.svg', 'Connected']
      ],
      tasks: [
        ['Review weekly routine', 'Available time', 100], ['Find consistency gaps', 'Missed sessions', 64],
        ['Plan three workouts', 'Low-friction schedule', 46], ['Protect recovery time', 'Sleep and rest', 24], ['Monitor adherence', 'Weekly check-in', 8]
      ],
      guidelines: [
        ['Fit activity into real life', 'Use open calendar windows', 100], ['Increase load gradually', 'Avoid sharp changes', 62],
        ['Protect recovery', 'Rest before intensity', 34], ['Review each Sunday', 'Adapt the next week', 6]
      ],
      results: [['Workouts planned', 3], ['Minutes protected', 135], ['Recovery days', 2], ['Week target', '60%']]
    }
  ];
  const useMcpDataDetails = {
    linkedin: {
      summary: 'Professional network context used to identify relevant people and trusted introduction paths.',
      scope: 'Profile and network data authorized for this goal',
      items: [['Profile details', 'users'], ['Connections', 'users'], ['Contacts', 'users'], ['Company pages', 'file'], ['Public posts', 'file']]
    },
    gmail: {
      summary: 'Mail context used to understand conversations, follow-ups, people, and supporting files.',
      scope: 'Authorized mail threads and attachments',
      items: [['Email text', 'mail'], ['Contacts', 'users'], ['Threads', 'mail'], ['Attachments', 'file'], ['Dates & participants', 'users']]
    },
    notion: {
      summary: 'Workspace knowledge used to understand plans, research, structured records, and linked material.',
      scope: 'Selected pages and databases in the connected workspace',
      items: [['Page text', 'file'], ['Contacts', 'users'], ['Tables & databases', 'collect'], ['Comments', 'mail'], ['Files & images', 'file']]
    },
    'google drive': {
      summary: 'Cloud files used to gather relevant documents, media, and structured project information.',
      scope: 'Files and folders shared with Weeple',
      items: [['Documents', 'file'], ['Spreadsheets', 'collect'], ['Photos & images', 'file'], ['Presentations', 'file'], ['Shared folders', 'collect']]
    },
    crunchbase: {
      summary: 'Company and investor data used to compare funding fit, market focus, and relationship signals.',
      scope: 'Company, funding, and investor records',
      items: [['Investor profiles', 'users'], ['Companies', 'collect'], ['Funding rounds', 'collect'], ['Industries', 'star'], ['Key contacts', 'users']]
    },
    calendar: {
      summary: 'Schedule context used to understand availability, commitments, deadlines, and meeting activity.',
      scope: 'Authorized calendars and event metadata',
      items: [['Events', 'file'], ['Meetings', 'users'], ['Attendees', 'users'], ['Time & location', 'globe'], ['Meeting notes', 'file']]
    },
    github: {
      summary: 'Development activity used to understand product progress, engineering risk, and open decisions.',
      scope: 'Selected repositories and their collaboration history',
      items: [['Repositories', 'collect'], ['Issues & pull requests', 'file'], ['Discussions', 'mail'], ['Commits', 'process'], ['README & docs', 'file']]
    },
    linear: {
      summary: 'Product delivery data used to track priorities, ownership, cycles, and execution risk.',
      scope: 'Connected teams and selected projects',
      items: [['Issues', 'file'], ['Projects', 'collect'], ['Cycles', 'process'], ['Comments', 'mail'], ['Owners & labels', 'users']]
    },
    figma: {
      summary: 'Design context used to understand current UI direction, product flows, and unresolved feedback.',
      scope: 'Selected design files and project spaces',
      items: [['UI designs', 'star'], ['Frames & pages', 'file'], ['Components', 'collect'], ['Design comments', 'mail'], ['Prototype links', 'globe']]
    },
    onedrive: {
      summary: 'Cloud content used to collect relevant work files, visual material, and shared records.',
      scope: 'Files and folders shared with Weeple',
      items: [['Files & folders', 'collect'], ['Documents', 'file'], ['Photos & images', 'file'], ['Spreadsheets', 'collect'], ['Shared items', 'users']]
    },
    youtube: {
      summary: 'Learning media used to organize useful lessons, transcripts, topics, and viewing progress.',
      scope: 'Authorized videos, playlists, and activity',
      items: [['Video titles', 'play'], ['Transcripts', 'file'], ['Playlists', 'collect'], ['Channels', 'users'], ['Watch progress', 'process']]
    },
    'pdf notes': {
      summary: 'Uploaded study material used to extract concepts, examples, vocabulary, and reference images.',
      scope: 'PDF files added to this learning goal',
      items: [['Document text', 'file'], ['Tables', 'collect'], ['Images', 'file'], ['Highlights', 'star'], ['File metadata', 'file']]
    },
    telegram: {
      summary: 'Conversation context used to identify useful messages, shared material, and relevant contacts.',
      scope: 'Authorized chats and channels',
      items: [['Message text', 'mail'], ['Contacts', 'users'], ['Files', 'file'], ['Photos', 'file'], ['Channels & groups', 'users']]
    },
    'google tasks': {
      summary: 'Task context used to connect plans with due dates, completion state, and practical next actions.',
      scope: 'Authorized task lists',
      items: [['Tasks', 'file'], ['Task lists', 'collect'], ['Due dates', 'process'], ['Notes', 'file'], ['Completion status', 'finish']]
    },
    'google maps': {
      summary: 'Place context used to understand travel time, locations, routines, and nearby options.',
      scope: 'Authorized place and route information',
      items: [['Saved places', 'star'], ['Locations', 'globe'], ['Routes', 'globe'], ['Travel time', 'process'], ['Place details', 'file']]
    },
    whatsapp: {
      summary: 'Authorized conversation context used to understand coordination, shared media, and important follow-ups.',
      scope: 'Selected chats and shared items',
      items: [['Message text', 'mail'], ['Contacts', 'users'], ['Photos & videos', 'file'], ['Documents', 'file'], ['Dates & groups', 'users']]
    },
    'pdf plan': {
      summary: 'Plan documents used to extract routines, instructions, tables, and supporting visual material.',
      scope: 'PDF files attached to this goal',
      items: [['Document text', 'file'], ['Tables', 'collect'], ['Images', 'file'], ['Plan sections', 'collect'], ['File metadata', 'file']]
    }
  };
  const useResultReportDetails = [
    {
      headline: 'The investor pipeline is producing qualified warm paths.',
      summary: 'Weeple combined authorized professional-network, company, workspace, email, and calendar context to identify investors whose stage, sector, and relationship paths align with the current raise.',
      interpretation: 'The strongest results come from investors with both an AI education thesis and a reachable introduction path. Positive responses are concentrated in this group, so broad cold outreach would add volume without improving fit.',
      findings: [
        ['High-fit pool identified', '128 relevant contacts were grouped by sector, stage, check size, and relationship strength.'],
        ['Warm paths outperform cold reach', 'Existing-network signals created the clearest route to trusted introductions.'],
        ['Eight replies merit follow-up', 'The response pattern shows concrete interest rather than general engagement.']
      ],
      drivers: [['Market fit', 92], ['Network proximity', 84], ['Response intent', 76], ['Source freshness', 88]],
      recommendation: 'Prioritize the eight positive responses, prepare tailored follow-up notes, and schedule the three strongest meeting opportunities first.'
    },
    {
      headline: 'The roadmap is clearer, with five delivery risks requiring attention.',
      summary: 'Weeple grouped product notes, repository activity, issue tracking, designs, calendar commitments, and shared files into a single view of product scope and execution readiness.',
      interpretation: 'The most valuable release path is the smallest version that resolves the confirmed customer problem. Repository and design signals agree on the core direction, while unresolved ownership and delivery dependencies create the remaining risk.',
      findings: [
        ['Signals consolidated', '46 product and delivery signals were grouped into themes that can be reviewed together.'],
        ['Decisions are ready', '12 choices now have enough supporting evidence for an owner to confirm or adjust.'],
        ['Ownership is mostly aligned', 'Nine work areas have a clear owner; the remaining gaps overlap with flagged delivery risks.']
      ],
      drivers: [['Customer evidence', 91], ['Delivery readiness', 72], ['Design alignment', 82], ['Ownership clarity', 78]],
      recommendation: 'Resolve the five flagged risks, confirm owners for the remaining dependencies, and protect the highest-value release slice from scope expansion.'
    },
    {
      headline: 'Recall is improving, but speaking practice remains the main leverage point.',
      summary: 'Weeple connected study notes, calendar availability, learning media, PDFs, messages, and task history to compare recent recall performance with the HSK 4 learning plan.',
      interpretation: 'Vocabulary review is producing measurable gains, but the balance still favors recognition over active use. Calendar openings and recent error patterns support two short speaking drills without increasing total study time.',
      findings: [
        ['Weak vocabulary isolated', '84 words were reviewed and high-error terms were separated for focused repetition.'],
        ['Recall is becoming reliable', 'Current accuracy reached 76 percent across four recent sessions.'],
        ['Consistency is forming', 'A six-day streak provides enough momentum to add active speaking practice.']
      ],
      drivers: [['Recall accuracy', 76], ['Practice consistency', 86], ['Speaking balance', 54], ['Schedule fit', 81]],
      recommendation: 'Keep the current review cadence and add two fifteen-minute speaking drills focused on the highest-error vocabulary.'
    },
    {
      headline: 'A realistic weekly routine is ready, with recovery protected.',
      summary: 'Weeple compared authorized calendar availability, plan documents, location context, task history, and selected messages to identify exercise windows that fit the user’s actual week.',
      interpretation: 'The best plan is not the most intense plan. Three available training windows fit existing commitments, while two recovery days reduce the risk of overloading an inconsistent routine.',
      findings: [
        ['Three workouts fit the week', 'The selected sessions use open calendar windows with minimal travel friction.'],
        ['Recovery is explicitly protected', 'Two lower-load days remain available for sleep, mobility, or complete rest.'],
        ['The target is intentionally gradual', 'The first-week target is set at 60 percent to prioritize consistency over intensity.']
      ],
      drivers: [['Schedule fit', 89], ['Recovery balance', 84], ['Travel friction', 73], ['Habit sustainability', 81]],
      recommendation: 'Confirm the three protected workout windows, keep both recovery days, and review adherence before increasing load next week.'
    }
  ];
  const useAgentDefinitions = [
    ['Research', 'assets/avater/agents/1-research-agent.png', 'green'],
    ['Analysis', 'assets/avater/agents/2-Analysis-Agent.png', 'blue'],
    ['Outreach', 'assets/avater/agents/3-Outreach-Agent.png', 'orange'],
    ['Strategy', 'assets/avater/agents/4-Strategy-Agent.png', 'violet']
  ];
  const useTaskAgents = [
    { name: 'Research', tone: 'green', icon: 'users' },
    { name: 'Analysis', tone: 'blue', icon: 'understand' },
    { name: 'Strategy', tone: 'violet', icon: 'star' },
    { name: 'Outreach', tone: 'orange', icon: 'mail' },
    { name: 'Outreach', tone: 'orange', icon: 'process' }
  ];
  const useGuidelineRoles = [
    { name: 'Research', agentIndex: 0, tone: 'green', icon: 'star' },
    { name: 'Analysis', agentIndex: 1, tone: 'blue', icon: 'users' },
    { name: 'Strategy', agentIndex: 3, tone: 'violet', icon: 'process' },
    { name: 'Outreach', agentIndex: 2, tone: 'orange', icon: 'mail' }
  ];
  const useAgentProfiles = [
    {
      specialty: 'Research and discovery',
      summary: 'Finds reliable evidence and relevant context before the team makes a recommendation or takes action.',
      skills: [['Source discovery', 'globe'], ['Fact validation', 'star'], ['Context retrieval', 'collect'], ['Research synthesis', 'file']],
      expertise: ['Market intelligence', 'Knowledge retrieval', 'Source quality'],
      collaboration: 'Turns connected MCP data into trusted inputs for the Analysis and Strategy agents.'
    },
    {
      specialty: 'Analysis and insight',
      summary: 'Transforms collected information into patterns, comparisons, risks, and decision-ready insights.',
      skills: [['Data interpretation', 'collect'], ['Pattern detection', 'understand'], ['Risk scoring', 'process'], ['Outcome tracking', 'finish']],
      expertise: ['Quantitative analysis', 'Trend detection', 'Decision support'],
      collaboration: 'Tests research signals, measures progress, and gives the Strategy agent clear evidence.'
    },
    {
      specialty: 'Communication and action',
      summary: 'Creates tailored communication, coordinates follow-ups, and tracks responses across active channels.',
      skills: [['Message drafting', 'mail'], ['Audience targeting', 'users'], ['Follow-up planning', 'actionStep'], ['Response tracking', 'send']],
      expertise: ['Personalized outreach', 'Relationship building', 'Communication'],
      collaboration: 'Converts approved strategy into personalized actions and reports outcomes to the team.'
    },
    {
      specialty: 'Planning and direction',
      summary: 'Connects the evidence, priorities, and constraints into a focused plan with practical next steps.',
      skills: [['Goal planning', 'star'], ['Priority setting', 'finish'], ['Scenario design', 'process'], ['Next-best action', 'actionStep']],
      expertise: ['Strategic planning', 'Prioritization', 'Agent coordination'],
      collaboration: 'Coordinates the expert team and keeps every action aligned with the active goal.'
    }
  ];
  let missionRecognition = null;
  let missionRecognitionFinal = '';
  let useMcpDetailTrigger = null;
  let useAgentDetailTrigger = null;
  let useTaskDetailTrigger = null;
  let useGuidelineDetailTrigger = null;

  function escapeMissionText(value = '') {
    return String(value).replace(/[&<>'\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '\"': '&quot;' })[character]);
  }

  function getUseDashboardGoal() {
    return useDashboardGoals[state.useMissionGoalIndex] || useDashboardGoals[0];
  }

  function getMissionPhaseProgress(value) {
    const phaseFactor = Math.min(1, Math.max(.08, state.useMissionExecutionPhase / 8));
    return Math.round(Number(value) * phaseFactor);
  }

  function renderUseSourceIcon(source, className = '') {
    if (source[1]) return `<img class="${className}" src="${source[1]}" alt="">`;
    const tone = escapeMissionText(source[3] || 'source');
    const glyph = escapeMissionText((source[0] || '?').split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase());
    return `<i class="use-source-fallback tone-${tone} ${className}" aria-hidden="true">${glyph}</i>`;
  }

  function renderMissionGoalString() {
    const activeIndex = state.useMissionGoalIndex;
    const stringHidden = state.useMissionGoalStringHidden;
    const goalGlyphs = [
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4.5c2.4-1.3 4.5-1 5-1-.1 1.2-.3 3.8-2.2 5.8l-4.1 4.1-3.8-3.8 5.1-5.1Z"/><path d="m10 10-4.2.8-2.3 2.3 5.3.8m5.2-1.7-.8 4.2-2.3 2.3-.8-5.3M7 17l-2 2m5-2-3 3"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5c3.2-.7 5.9-.2 8 1.6v12c-2.1-1.8-4.8-2.3-8-1.6v-12Zm16 0c-3.2-.7-5.9-.2-8 1.6v12c2.1-1.8 4.8-2.3 8-1.6v-12Z"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z"/><path d="m7.5 12 2.2-.1 1.1-2.3 2.1 4.8 1.2-2.4h2.4"/></svg>'
    ];
    return `<section class="use-goal-map${stringHidden ? ' goal-string-hidden' : ''}" data-od-id="use-data-goal-map" aria-label="Goals and work relationship">
      <button class="use-goal-visibility-toggle" id="useGoalStringToggle" type="button" aria-controls="useGoalStringBand" aria-expanded="${!stringHidden}" aria-label="${stringHidden ? 'Show' : 'Hide'} goal string" title="${stringHidden ? 'Show' : 'Hide'} goal string" data-od-id="use-goal-string-toggle">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12s3.1-5 8.5-5 8.5 5 8.5 5-3.1 5-8.5 5-8.5-5-8.5-5Z"/><circle cx="12" cy="12" r="2.4"/><path class="use-goal-visibility-slash" d="m5 5 14 14"/></svg>
      </button>
      <div class="use-goal-string-band" id="useGoalStringBand" aria-hidden="${stringHidden}">
        <svg class="use-goal-curve" viewBox="0 0 844 46" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="useGoalStringGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#b64a12"/><stop offset="34%" stop-color="#2f77e8"/><stop offset="67%" stop-color="#31a657"/><stop offset="100%" stop-color="#e9672f"/>
            </linearGradient>
            <filter id="useGoalPacketGlow" x="-250%" y="-250%" width="600%" height="600%"><feGaussianBlur stdDeviation="2.6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path id="useGoalFlowPath" class="base" d="M95 6 C250 48 594 48 749 6"/>
          <path class="energy" d="M95 6 C250 48 594 48 749 6"/>
          <g class="use-goal-flow-packets">
            <circle class="use-goal-flow-packet tail" r="1.5"><animateMotion dur="4.6s" begin="0s" repeatCount="indefinite"><mpath href="#useGoalFlowPath"/></animateMotion></circle>
            <circle class="use-goal-flow-packet trail" r="2.2"><animateMotion dur="4.6s" begin="-.09s" repeatCount="indefinite"><mpath href="#useGoalFlowPath"/></animateMotion></circle>
            <circle class="use-goal-flow-packet head" r="3.1" filter="url(#useGoalPacketGlow)"><animateMotion dur="4.6s" begin="-.18s" repeatCount="indefinite"><mpath href="#useGoalFlowPath"/></animateMotion></circle>
            <circle class="use-goal-flow-packet tail secondary" r="1.4"><animateMotion dur="4.6s" begin="-2.3s" repeatCount="indefinite"><mpath href="#useGoalFlowPath"/></animateMotion></circle>
            <circle class="use-goal-flow-packet trail secondary" r="2.1"><animateMotion dur="4.6s" begin="-2.39s" repeatCount="indefinite"><mpath href="#useGoalFlowPath"/></animateMotion></circle>
            <circle class="use-goal-flow-packet head secondary" r="3" filter="url(#useGoalPacketGlow)"><animateMotion dur="4.6s" begin="-2.48s" repeatCount="indefinite"><mpath href="#useGoalFlowPath"/></animateMotion></circle>
          </g>
        </svg>
        <div class="use-goal-list">${useDashboardGoals.map((goal, index) => `<button class="use-goal-node tone-${goal.tone}${index === activeIndex ? ' active' : ''}" type="button" data-use-goal="${index}" aria-pressed="${index === activeIndex}" data-od-id="use-goal-${index + 1}"><span class="use-goal-anchor"><i class="use-goal-pin"></i><i class="use-goal-icon">${goalGlyphs[index]}</i></span><span class="use-goal-card"><b>${goal.title}</b><strong>${goal.progress}%</strong><span class="use-goal-progress"><i style="--value:${goal.progress}%"></i></span><small><i></i>${goal.state}</small></span></button>`).join('')}</div>
      </div>
    </section>`;
  }

  function renderUseComposer(compact = false) {
    const draft = escapeMissionText(state.useMissionDraft || '');
    const listening = state.useMissionListening;
    return `<form class="use-command-bar${compact ? ' compact' : ''}${listening ? ' listening' : ''}" id="missionPromptForm" data-od-id="use-data-command-bar">
      <button class="use-command-icon mic${listening ? ' active' : ''}" id="missionVoiceStart" type="button" aria-label="${listening ? 'Listening' : 'Start voice input'}" title="${listening ? 'Listening' : 'Start voice input'}">${missionIcon('mic')}</button>
      <label for="missionPromptInput"><span class="sr-only">Request</span><input id="missionPromptInput" type="text" maxlength="500" autocomplete="off" value="${draft}" placeholder="${listening ? 'Listening… speak naturally' : 'Ask anything or give a command…'}"></label>
      ${listening ? `<span class="use-listening-status"><i></i><b>Listening</b><time id="missionVoiceElapsed">${formatMissionTime(state.useMissionElapsed)}</time></span><button class="use-command-icon confirm" id="missionVoiceConfirm" type="button" aria-label="Finish voice input" title="Finish voice input">✓</button>` : ''}
      <button class="use-command-icon send" id="missionPromptSend" type="submit" aria-label="Send request" title="Send request">${missionIcon('send')}</button>
    </form>`;
  }

  function renderUsePersistentDashboard() {
    const goal = getUseDashboardGoal();
    const working = state.useMissionState === 'working';
    return `<section class="use-dashboard use-dashboard-idle use-dashboard-persistent${working ? ' is-working' : ''}" data-mission-state="${working ? 'working' : 'idle'}" data-phase="${state.useMissionExecutionPhase}" data-od-id="use-data-persistent-state">
      ${renderMissionGoalString()}
      <div class="use-persistent-panels use-dashboard-working" aria-hidden="${!working}"${working ? '' : ' inert'} data-od-id="use-data-side-panels">
        <aside class="use-left-stack" data-od-id="use-data-left-stack">${renderSourcePanel(goal)}${renderTaskPanel(goal)}</aside>
        <aside class="use-right-stack" data-od-id="use-data-right-stack">${renderGuidelinePanel(goal)}${renderExpertPanel()}${renderResultPanel(goal)}</aside>
      </div>
      <div class="use-idle-focus" data-od-id="use-data-fixed-center">
        <div class="use-speech-bubble" data-od-id="use-data-greeting"><i>✦</i><h1>What can I do for you?</h1></div>
        <div class="use-avatar-orbit idle" data-od-id="use-data-idle-avatar"><i></i><i></i><i></i>${renderMissionAvatar('idle')}</div>
        ${renderUseComposer(false)}
      </div>
      <aside class="use-mcp-detail-popover" id="useMcpDetailPopover" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="useMcpDetailTitle" data-placement="right" data-od-id="use-data-mcp-detail"></aside>
      <aside class="use-agent-detail-popover" id="useAgentDetailPopover" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="useAgentDetailTitle" data-placement="left" data-od-id="use-data-agent-detail"></aside>
      <aside class="use-task-detail-popover" id="useTaskDetailPopover" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="useTaskDetailTitle" data-placement="right" data-od-id="use-data-task-detail"></aside>
      <aside class="use-guideline-detail-popover" id="useGuidelineDetailPopover" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="useGuidelineDetailTitle" data-placement="left" data-od-id="use-data-guideline-detail"></aside>
    </section>`;
  }

  function alignUseSpeechBubble() {
    const bubble = useMissionStage?.querySelector('.use-speech-bubble');
    const avatarOrbit = useMissionStage?.querySelector('.use-avatar-orbit.idle');
    const avatarImage = useMissionStage?.querySelector('.use-avatar-orbit.idle .mission-avatar img');
    const commandBar = useMissionStage?.querySelector('.use-command-bar');
    if (!bubble || !avatarOrbit || !avatarImage || !commandBar) return;
    const applyAlignment = () => {
      if (!bubble.isConnected || !avatarImage.isConnected || !commandBar.isConnected) return;
      bubble.classList.add('is-positioning');
      avatarOrbit.classList.add('is-positioning');
      bubble.style.setProperty('--avatar-bubble-shift', '0px');
      avatarImage.style.setProperty('--avatar-input-shift', '0px');
      const initialAvatarBounds = avatarImage.getBoundingClientRect();
      const commandBounds = commandBar.getBoundingClientRect();
      const avatarShift = commandBounds.top + 30 - initialAvatarBounds.bottom;
      avatarImage.style.setProperty('--avatar-input-shift', `${avatarShift.toFixed(1)}px`);
      const bubbleBounds = bubble.getBoundingClientRect();
      const avatarBounds = avatarImage.getBoundingClientRect();
      const shift = avatarBounds.top - bubbleBounds.bottom - 25;
      bubble.style.setProperty('--avatar-bubble-shift', `${shift.toFixed(1)}px`);
      window.requestAnimationFrame(() => {
        bubble.classList.remove('is-positioning');
        avatarOrbit.classList.remove('is-positioning');
      });
    };
    if (avatarImage.complete) window.requestAnimationFrame(applyAlignment);
    else avatarImage.addEventListener('load', applyAlignment, { once: true });
  }

  function renderSourcePanel(goal) {
    const connectedSourceCount = goal.sources.filter(source => source[2] !== 'Not connected').length;
    return `<section class="use-panel use-sources" data-od-id="use-data-sources-panel"><header><span><small>DATA SOURCES</small><b>MCP connections</b></span><em>${connectedSourceCount}/${goal.sources.length}</em></header>
      <div class="use-source-scroll" aria-label="Connected data sources">${goal.sources.map((source, index) => `<article class="use-source-row${source[2] === 'Live' ? ' is-live' : ''}" style="--live-shine-delay:${index * .42}s" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false" aria-controls="useMcpDetailPopover" aria-label="View data available from ${escapeMissionText(source[0])}" data-use-source-detail="${index}" data-od-id="use-source-${index + 1}">${renderUseSourceIcon(source)}<span><b>${source[0]}</b><small class="status-${source[2].toLowerCase().replace(' ', '-')}"><i></i>${source[2]}</small></span><i class="use-source-detail-arrow" aria-hidden="true">›</i></article>`).join('')}</div>
      <footer class="use-source-summary"><span><b>${connectedSourceCount}</b> of ${goal.sources.length} connected</span><button class="use-panel-link" id="useOpenImportData" type="button">See all <span>→</span></button></footer></section>`;
  }

  function renderTaskPanel(goal) {
    return `<section class="use-panel use-tasks" data-od-id="use-data-tasks-panel"><header><span><small>LIVE WORK</small><b>Tasks in progress</b></span><em>${goal.tasks.length}</em></header>
      <div class="use-task-scroll">${goal.tasks.map((task, index) => {
        const progress = getMissionPhaseProgress(task[2]);
        const complete = progress >= 100;
        const agent = useTaskAgents[index] || useTaskAgents[index % useTaskAgents.length];
        return `<article class="use-task-row stage-item tone-${agent.tone}${complete ? ' complete' : ''}" style="--delay:${index * 70}ms" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false" aria-controls="useTaskDetailPopover" aria-label="View timeline for ${escapeMissionText(task[0])}" data-use-task-detail="${index}" data-od-id="use-task-${index + 1}"><i class="use-task-check">${complete ? '✓' : missionIcon(agent.icon)}</i><span><b>${task[0]}</b><small>${task[1]}</small><em class="use-task-owner"><i></i>${agent.name} Agent</em></span><span class="use-task-ring${complete ? ' complete' : ''}" style="--progress:${progress}" aria-label="${progress}% complete"><i>${complete ? '✓' : `${progress}%`}</i></span></article>`;
      }).join('')}</div></section>`;
  }

  function getUseGuidelineSequence(goal) {
    const sourceProgress = goal.guidelines.map(guide => getMissionPhaseProgress(guide[2]));
    const activeIndex = sourceProgress.findIndex(progress => progress < 100);
    return goal.guidelines.map((guide, index) => {
      if (activeIndex === -1 || index < activeIndex) return { progress: 100, status: 'Completed', state: 'complete' };
      if (index === activeIndex) return { progress: sourceProgress[index], status: 'In progress', state: 'active' };
      return { progress: 0, status: 'Waiting', state: 'waiting' };
    });
  }

  function renderGuidelinePanel(goal) {
    const sequence = getUseGuidelineSequence(goal);
    return `<section class="use-panel use-guidelines" data-od-id="use-data-guidelines-panel"><header><span><small>GOAL PROCESS</small><b>Guidelines</b></span><em>${goal.guidelines.length}</em></header>
      <div class="use-guideline-list">${goal.guidelines.map((guide, index) => {
        const step = sequence[index];
        const role = useGuidelineRoles[index] || useGuidelineRoles[index % useGuidelineRoles.length];
        return `<article class="use-guideline-row stage-item tone-${role.tone} ${step.state}" style="--delay:${index * 90}ms" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false" aria-controls="useGuidelineDetailPopover" aria-label="View guideline: ${escapeMissionText(guide[0])}" data-use-guideline-detail="${index}" data-od-id="use-guideline-${index + 1}"><i class="use-guideline-icon">${step.state === 'complete' ? '✓' : missionIcon(role.icon)}</i><span><b>${guide[0]}</b><small>${guide[1]}</small><em class="use-guide-state"><i></i>${step.status}</em><span class="use-guide-progress"><i style="--value:${step.progress}%"></i></span></span><em>${step.progress}%</em></article>`;
      }).join('')}</div></section>`;
  }

  function renderResultPanel(goal) {
    const resultFactor = Math.min(1, Math.max(0, (state.useMissionExecutionPhase - 3) / 5));
    return `<section class="use-panel use-results composition-${state.useMissionGoalIndex}" data-od-id="use-data-results-panel"><header><span><small>LIVE OUTCOME</small><b>Results snapshot</b></span><div class="use-result-header-actions"><button class="use-result-details-button" id="useResultViewDetails" type="button" aria-expanded="false" aria-controls="missionDetailDrawer">View details <i>›</i></button></div></header>
      <div class="use-result-scroll" role="region" aria-label="Result snapshot metrics" tabindex="0"><div class="use-result-grid">${goal.results.map((result, index) => { const numeric = typeof result[1] === 'number'; const shown = numeric ? Math.round(result[1] * resultFactor) : (resultFactor >= .6 ? result[1] : '—'); return `<span data-od-id="use-result-${index + 1}"><b>${shown}</b><small>${result[0]}</small></span>`; }).join('')}</div></div>
    </section>`;
  }

  function renderExpertPanel() {
    return `<section class="use-panel use-experts" data-od-id="use-data-experts-panel"><header><span><small>ACTIVE TEAM</small><b>AI experts</b></span><em>${useAgentDefinitions.length}</em></header>
      <p>${useAgentDefinitions.length} specialists collaborating on this goal</p>
      <div class="use-expert-grid">${useAgentDefinitions.map((agent, index) => `<figure class="use-expert tone-${agent[2]} stage-item" style="--delay:${index * 70}ms" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false" aria-controls="useAgentDetailPopover" aria-label="View ${agent[0]} Agent profile" title="View ${agent[0]} Agent profile" data-use-agent-detail="${index}" data-od-id="use-expert-${index + 1}"><span><img src="${agent[1]}" alt=""><i></i></span><figcaption>${agent[0]}</figcaption></figure>`).join('')}</div>
    </section>`;
  }

  function renderAgentDock() {
    const phase = state.useMissionExecutionPhase;
    return `<section class="use-agent-dock" data-od-id="use-data-agent-dock"><span><small>AI Agents</small><b>${Math.min(4, Math.max(1, Math.ceil(phase / 2)))} active</b></span><footer class="use-working-status"><i></i><span>Weeple AI · Working for you</span></footer>${useAgentDefinitions.map((agent, index) => `<figure class="use-agent tone-${agent[2]}${phase >= (index * 2 + 1) ? ' active' : ''}" data-od-id="use-agent-${index + 1}"><img src="${agent[1]}" alt="${agent[0]} Agent"><figcaption>${agent[0]}</figcaption></figure>`).join('')}</section>`;
  }

  function getUseMcpDataDetail(source) {
    const key = String(source?.[0] || '').trim().toLowerCase();
    return useMcpDataDetails[key] || {
      summary: 'Connected source context used only when it is relevant to the current goal and authorized task.',
      scope: 'Data authorized through this MCP connection',
      items: [['Text content', 'file'], ['Files', 'file'], ['Structured records', 'collect'], ['Images & media', 'file'], ['Metadata', 'process']]
    };
  }

  function renderUseMcpDetail(source) {
    const detail = getUseMcpDataDetail(source);
    const status = escapeMissionText(source[2] || 'Connected');
    const statusClass = status.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const activity = source[2] === 'Live'
      ? 'AI is collecting current context from this source.'
      : source[2] === 'Syncing'
        ? 'The authorized data scope is being synchronized.'
        : 'This source is ready when the active task needs it.';
    return `<header class="use-mcp-popover-header">
        <div class="use-mcp-popover-brand">${renderUseSourceIcon(source, 'use-mcp-popover-logo')}<span><small>MCP DATA SOURCE</small><h2 id="useMcpDetailTitle">${escapeMissionText(source[0])}</h2></span></div>
        <button class="use-mcp-popover-close" type="button" data-use-mcp-close aria-label="Close ${escapeMissionText(source[0])} details">×</button>
      </header>
      <div class="use-mcp-popover-state"><span class="status-${statusClass}"><i></i>${status}</span><em>Used for: ${escapeMissionText(getUseDashboardGoal().short)}</em></div>
      <p class="use-mcp-popover-summary">${escapeMissionText(detail.summary)}</p>
      <section class="use-mcp-data-section" aria-label="Data available to the AI">
        <header><span>DATA AVAILABLE TO AI</span><small>${detail.items.length} types</small></header>
        <div class="use-mcp-data-types">${detail.items.map(item => `<span><i>${missionIcon(item[1])}</i><b>${escapeMissionText(item[0])}</b></span>`).join('')}</div>
      </section>
      <div class="use-mcp-activity"><i></i><span><b>Current activity</b><small>${escapeMissionText(activity)}</small></span></div>
      <footer class="use-mcp-popover-footer"><span><i>✓</i><b>Authorized scope</b><small>${escapeMissionText(detail.scope)}</small></span><em>Read only</em></footer>`;
  }

  function positionUseMcpDetail(trigger = useMcpDetailTrigger) {
    const dashboard = useMissionStage?.querySelector('.use-dashboard-persistent');
    const popover = dashboard?.querySelector('#useMcpDetailPopover');
    if (!dashboard || !popover || !trigger?.isConnected || !popover.classList.contains('visible')) return;
    const dashboardBounds = dashboard.getBoundingClientRect();
    const triggerBounds = trigger.getBoundingClientRect();
    const gap = 13;
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    const rightLeft = triggerBounds.right - dashboardBounds.left + gap;
    const leftLeft = triggerBounds.left - dashboardBounds.left - popoverWidth - gap;
    const placeRight = rightLeft + popoverWidth <= dashboardBounds.width - 10 || leftLeft < 10;
    const left = placeRight ? rightLeft : leftLeft;
    const idealTop = triggerBounds.top - dashboardBounds.top + (triggerBounds.height - popoverHeight) / 2;
    const top = Math.max(8, Math.min(idealTop, dashboardBounds.height - popoverHeight - 8));
    popover.dataset.placement = placeRight ? 'right' : 'left';
    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
  }

  function closeUseMcpDetail(restoreFocus = false) {
    const popover = useMissionStage?.querySelector('#useMcpDetailPopover');
    if (!popover) return;
    popover.classList.remove('visible');
    popover.setAttribute('aria-hidden', 'true');
    useMissionStage?.querySelectorAll('[data-use-source-detail]').forEach(card => {
      card.classList.remove('detail-open');
      card.setAttribute('aria-expanded', 'false');
    });
    if (restoreFocus && useMcpDetailTrigger?.isConnected) useMcpDetailTrigger.focus({ preventScroll: true });
    useMcpDetailTrigger = null;
  }

  function openUseMcpDetail(trigger) {
    const popover = useMissionStage?.querySelector('#useMcpDetailPopover');
    const sourceIndex = Number(trigger?.dataset.useSourceDetail);
    const source = getUseDashboardGoal().sources[sourceIndex];
    if (!popover || !source) return;
    if (useMcpDetailTrigger === trigger && popover.classList.contains('visible')) {
      closeUseMcpDetail(true);
      return;
    }
    closeUseAgentDetail(false);
    closeUseTaskDetail(false);
    closeUseGuidelineDetail(false);
    closeUseMcpDetail(false);
    useMcpDetailTrigger = trigger;
    trigger.classList.add('detail-open');
    trigger.setAttribute('aria-expanded', 'true');
    popover.innerHTML = renderUseMcpDetail(source);
    popover.classList.add('visible');
    popover.setAttribute('aria-hidden', 'false');
    popover.querySelector('[data-use-mcp-close]')?.addEventListener('click', () => closeUseMcpDetail(true));
    window.requestAnimationFrame(() => positionUseMcpDetail(trigger));
    haptic(5);
  }

  function bindUseSourceDetailEvents() {
    useMissionStage?.querySelectorAll('[data-use-source-detail]').forEach(card => {
      card.addEventListener('click', () => openUseMcpDetail(card));
      card.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openUseMcpDetail(card);
      });
    });
  }

  function renderUseAgentDetail(agent, index) {
    const profile = useAgentProfiles[index] || useAgentProfiles[0];
    const goal = getUseDashboardGoal();
    const currentFocus = goal.tasks[index]?.[0] || `Supporting ${goal.short}`;
    return `<header class="use-mcp-popover-header">
        <div class="use-mcp-popover-brand use-agent-popover-brand"><span class="use-agent-popover-avatar"><img src="${agent[1]}" alt=""><i></i></span><span><small>AI AGENT PROFILE</small><h2 id="useAgentDetailTitle">${escapeMissionText(agent[0])} Agent</h2></span></div>
        <button class="use-mcp-popover-close" type="button" data-use-agent-close aria-label="Close ${escapeMissionText(agent[0])} Agent profile">×</button>
      </header>
      <div class="use-mcp-popover-state use-agent-popover-state"><span class="status-live"><i></i>Active</span><em>${escapeMissionText(profile.specialty)}</em></div>
      <p class="use-mcp-popover-summary">${escapeMissionText(profile.summary)}</p>
      <section class="use-agent-skill-section" aria-label="Core skills">
        <header><span>CORE SKILLS</span><small>${profile.skills.length} capabilities</small></header>
        <div class="use-agent-skill-grid">${profile.skills.map(skill => `<span><i>${missionIcon(skill[1])}</i><b>${escapeMissionText(skill[0])}</b></span>`).join('')}</div>
      </section>
      <section class="use-agent-expertise" aria-label="Areas of expertise"><small>EXPERTISE</small><div>${profile.expertise.map(item => `<span>${escapeMissionText(item)}</span>`).join('')}</div></section>
      <div class="use-mcp-activity use-agent-focus"><i></i><span><b>Current focus</b><small>${escapeMissionText(currentFocus)}</small></span></div>
      <footer class="use-mcp-popover-footer use-agent-popover-footer"><span><i>${missionIcon('users')}</i><b>Team contribution</b><small>${escapeMissionText(profile.collaboration)}</small></span><em>Autonomous</em></footer>`;
  }

  function positionUseAgentDetail(trigger = useAgentDetailTrigger) {
    const dashboard = useMissionStage?.querySelector('.use-dashboard-persistent');
    const popover = dashboard?.querySelector('#useAgentDetailPopover');
    if (!dashboard || !popover || !trigger?.isConnected || !popover.classList.contains('visible')) return;
    const dashboardBounds = dashboard.getBoundingClientRect();
    const triggerBounds = trigger.getBoundingClientRect();
    const gap = 13;
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    const rightLeft = triggerBounds.right - dashboardBounds.left + gap;
    const leftLeft = triggerBounds.left - dashboardBounds.left - popoverWidth - gap;
    const placeRight = rightLeft + popoverWidth <= dashboardBounds.width - 10 || leftLeft < 10;
    const left = placeRight ? rightLeft : leftLeft;
    const idealTop = triggerBounds.top - dashboardBounds.top + (triggerBounds.height - popoverHeight) / 2;
    const top = Math.max(8, Math.min(idealTop, dashboardBounds.height - popoverHeight - 8));
    popover.dataset.placement = placeRight ? 'right' : 'left';
    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
  }

  function closeUseAgentDetail(restoreFocus = false) {
    const popover = useMissionStage?.querySelector('#useAgentDetailPopover');
    if (!popover) return;
    popover.classList.remove('visible');
    popover.setAttribute('aria-hidden', 'true');
    useMissionStage?.querySelectorAll('[data-use-agent-detail]').forEach(card => {
      card.classList.remove('detail-open');
      card.setAttribute('aria-expanded', 'false');
    });
    if (restoreFocus && useAgentDetailTrigger?.isConnected) useAgentDetailTrigger.focus({ preventScroll: true });
    useAgentDetailTrigger = null;
  }

  function openUseAgentDetail(trigger) {
    const popover = useMissionStage?.querySelector('#useAgentDetailPopover');
    const agentIndex = Number(trigger?.dataset.useAgentDetail);
    const agent = useAgentDefinitions[agentIndex];
    if (!popover || !agent) return;
    if (useAgentDetailTrigger === trigger && popover.classList.contains('visible')) {
      closeUseAgentDetail(true);
      return;
    }
    closeUseMcpDetail(false);
    closeUseTaskDetail(false);
    closeUseGuidelineDetail(false);
    closeUseAgentDetail(false);
    useAgentDetailTrigger = trigger;
    trigger.classList.add('detail-open');
    trigger.setAttribute('aria-expanded', 'true');
    popover.className = `use-agent-detail-popover tone-${agent[2]} visible`;
    popover.innerHTML = renderUseAgentDetail(agent, agentIndex);
    popover.setAttribute('aria-hidden', 'false');
    popover.querySelector('[data-use-agent-close]')?.addEventListener('click', () => closeUseAgentDetail(true));
    window.requestAnimationFrame(() => positionUseAgentDetail(trigger));
    haptic(5);
  }

  function bindUseAgentDetailEvents() {
    useMissionStage?.querySelectorAll('[data-use-agent-detail]').forEach(card => {
      card.addEventListener('click', () => openUseAgentDetail(card));
      card.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openUseAgentDetail(card);
      });
    });
  }

  function getUseTaskMilestones(goal, task, index, progress) {
    const agent = useTaskAgents[index] || useTaskAgents[index % useTaskAgents.length];
    const milestones = [
      ['Task brief accepted', `Scope aligned with ${goal.short}`, 5],
      ['Required context identified', 'Relevant MCP and local data sources mapped', 20],
      ['Supporting data gathered', task[1], 42],
      [`${agent.name} execution`, `${agent.name} Agent is completing the core task work`, 68],
      ['Quality review', 'Output checked for relevance, accuracy, and goal alignment', 88],
      ['Ready for handoff', 'Final result delivered to the collaborating expert team', 100]
    ];
    return milestones.map((milestone, milestoneIndex) => {
      const previousThreshold = milestoneIndex === 0 ? 0 : milestones[milestoneIndex - 1][2];
      const status = progress >= milestone[2] ? 'done' : progress >= previousThreshold ? 'processing' : 'waiting';
      return { title: milestone[0], detail: milestone[1], threshold: milestone[2], status };
    });
  }

  function renderUseTaskDetail(task, index) {
    const goal = getUseDashboardGoal();
    const agent = useTaskAgents[index] || useTaskAgents[index % useTaskAgents.length];
    const progress = getMissionPhaseProgress(task[2]);
    const complete = progress >= 100;
    const milestones = getUseTaskMilestones(goal, task, index, progress);
    const completedCount = milestones.filter(milestone => milestone.status === 'done').length;
    return `<header class="use-mcp-popover-header">
        <div class="use-mcp-popover-brand use-task-popover-brand"><i class="use-task-popover-icon">${complete ? '✓' : missionIcon(agent.icon)}</i><span><small>TASK TIMELINE</small><h2 id="useTaskDetailTitle">${escapeMissionText(task[0])}</h2></span></div>
        <button class="use-mcp-popover-close" type="button" data-use-task-close aria-label="Close ${escapeMissionText(task[0])} timeline">×</button>
      </header>
      <div class="use-mcp-popover-state use-task-popover-state"><span class="${complete ? 'status-live' : 'status-syncing'}"><i></i>${complete ? 'Completed' : 'In progress'}</span><em>${escapeMissionText(agent.name)} Agent</em></div>
      <p class="use-mcp-popover-summary">${escapeMissionText(task[1])}</p>
      <section class="use-task-progress-summary" aria-label="Task progress: ${progress}%"><span><b>${progress}%</b><small>overall progress</small></span><div><i style="--value:${progress}%"></i></div></section>
      <section class="use-task-milestone-section" aria-label="Task milestones">
        <header><span>TASK MILESTONES</span><small>${completedCount} of ${milestones.length} done</small></header>
        <div class="use-task-timeline" tabindex="0">${milestones.map(milestone => `<article class="use-task-milestone status-${milestone.status}"><i>${milestone.status === 'done' ? '✓' : milestone.status === 'processing' ? missionIcon('process') : ''}</i><span><b>${escapeMissionText(milestone.title)}</b><small>${escapeMissionText(milestone.detail)}</small></span><em>${milestone.status === 'done' ? 'Done' : milestone.status === 'processing' ? 'Processing' : 'Waiting'}</em></article>`).join('')}</div>
      </section>
      <footer class="use-task-popover-footer"><span><i></i><b>Live milestone status</b></span><small>Scroll to view the complete timeline</small></footer>`;
  }

  function positionUseTaskDetail(trigger = useTaskDetailTrigger) {
    const dashboard = useMissionStage?.querySelector('.use-dashboard-persistent');
    const popover = dashboard?.querySelector('#useTaskDetailPopover');
    if (!dashboard || !popover || !trigger?.isConnected || !popover.classList.contains('visible')) return;
    const dashboardBounds = dashboard.getBoundingClientRect();
    const triggerBounds = trigger.getBoundingClientRect();
    const gap = 13;
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    const rightLeft = triggerBounds.right - dashboardBounds.left + gap;
    const leftLeft = triggerBounds.left - dashboardBounds.left - popoverWidth - gap;
    const placeRight = rightLeft + popoverWidth <= dashboardBounds.width - 10 || leftLeft < 10;
    const left = placeRight ? rightLeft : leftLeft;
    const idealTop = triggerBounds.top - dashboardBounds.top + (triggerBounds.height - popoverHeight) / 2;
    const top = Math.max(8, Math.min(idealTop, dashboardBounds.height - popoverHeight - 8));
    popover.dataset.placement = placeRight ? 'right' : 'left';
    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
  }

  function closeUseTaskDetail(restoreFocus = false) {
    const popover = useMissionStage?.querySelector('#useTaskDetailPopover');
    if (!popover) return;
    popover.classList.remove('visible');
    popover.setAttribute('aria-hidden', 'true');
    useMissionStage?.querySelectorAll('[data-use-task-detail]').forEach(card => {
      card.classList.remove('detail-open');
      card.setAttribute('aria-expanded', 'false');
    });
    if (restoreFocus && useTaskDetailTrigger?.isConnected) useTaskDetailTrigger.focus({ preventScroll: true });
    useTaskDetailTrigger = null;
  }

  function openUseTaskDetail(trigger) {
    const popover = useMissionStage?.querySelector('#useTaskDetailPopover');
    const taskIndex = Number(trigger?.dataset.useTaskDetail);
    const task = getUseDashboardGoal().tasks[taskIndex];
    const agent = useTaskAgents[taskIndex] || useTaskAgents[taskIndex % useTaskAgents.length];
    if (!popover || !task || !agent) return;
    if (useTaskDetailTrigger === trigger && popover.classList.contains('visible')) {
      closeUseTaskDetail(true);
      return;
    }
    closeUseMcpDetail(false);
    closeUseAgentDetail(false);
    closeUseGuidelineDetail(false);
    closeUseTaskDetail(false);
    useTaskDetailTrigger = trigger;
    trigger.classList.add('detail-open');
    trigger.setAttribute('aria-expanded', 'true');
    popover.className = `use-task-detail-popover tone-${agent.tone} visible`;
    popover.innerHTML = renderUseTaskDetail(task, taskIndex);
    popover.setAttribute('aria-hidden', 'false');
    popover.querySelector('[data-use-task-close]')?.addEventListener('click', () => closeUseTaskDetail(true));
    window.requestAnimationFrame(() => positionUseTaskDetail(trigger));
    haptic(5);
  }

  function bindUseTaskDetailEvents() {
    useMissionStage?.querySelectorAll('[data-use-task-detail]').forEach(card => {
      card.addEventListener('click', () => openUseTaskDetail(card));
      card.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openUseTaskDetail(card);
      });
    });
  }

  function getUseGuidelineInstructions(goal, guide, index, role) {
    const sourceNames = goal.sources.slice(0, 2).map(source => source[0]).join(' and ');
    return [
      ['Define the outcome', `Confirm what “${guide[0]}” must achieve for ${goal.title}.`],
      ['Review the evidence', `Use relevant authorized context from ${sourceNames} before making a decision.`],
      ['Execute the guideline', `${role.name} Agent follows the “${guide[1]}” rule and records the important decisions.`],
      ['Validate the quality', 'Check the evidence, constraints, and downstream impact before marking this step complete.'],
      ['Approve the handoff', 'Record the completion signal so the next guideline can begin without losing context.']
    ];
  }

  function renderUseGuidelineDetail(guide, index) {
    const goal = getUseDashboardGoal();
    const sequence = getUseGuidelineSequence(goal);
    const step = sequence[index];
    const role = useGuidelineRoles[index] || useGuidelineRoles[index % useGuidelineRoles.length];
    const agent = useAgentDefinitions[role.agentIndex] || useAgentDefinitions[0];
    const instructions = getUseGuidelineInstructions(goal, guide, index, role);
    const nextGuideline = goal.guidelines[index + 1]?.[0] || 'Goal execution complete';
    const statusClass = step.state === 'complete' ? 'status-live' : step.state === 'active' ? 'status-syncing' : 'status-waiting';
    return `<header class="use-mcp-popover-header">
        <div class="use-mcp-popover-brand use-guideline-popover-brand"><span class="use-guideline-agent-avatar"><img src="${agent[1]}" alt=""><i></i></span><span><small>SEQUENTIAL GUIDELINE</small><h2 id="useGuidelineDetailTitle">${escapeMissionText(guide[0])}</h2></span></div>
        <button class="use-mcp-popover-close" type="button" data-use-guideline-close aria-label="Close ${escapeMissionText(guide[0])} guideline">×</button>
      </header>
      <div class="use-mcp-popover-state use-guideline-popover-state"><span class="${statusClass}"><i></i>${escapeMissionText(step.status)}</span><em>${escapeMissionText(role.name)} Agent</em></div>
      <p class="use-mcp-popover-summary">${escapeMissionText(guide[1])}. This step preserves the context and quality standard required before the workflow can advance.</p>
      <section class="use-guideline-progress-summary" aria-label="Guideline progress: ${step.progress}%"><span><b>${step.progress}%</b><small>step progress</small></span><div><i style="--value:${step.progress}%"></i></div></section>
      <section class="use-guideline-instruction-section" aria-label="Detailed guideline">
        <header><span>HOW TO EXECUTE</span><small>${instructions.length} checks</small></header>
        <div>${instructions.map((instruction, instructionIndex) => `<article><i>${instructionIndex + 1}</i><span><b>${escapeMissionText(instruction[0])}</b><small>${escapeMissionText(instruction[1])}</small></span></article>`).join('')}</div>
      </section>
      <div class="use-guideline-quality"><i>${missionIcon('star')}</i><span><b>Completion standard</b><small>Finish only when the result is verified, documented, and ready for the next agent without missing context.</small></span></div>
      <footer class="use-guideline-popover-footer"><span><small>NEXT GUIDELINE</small><b>${escapeMissionText(nextGuideline)}</b></span><em>${step.state === 'waiting' ? 'Locked' : step.state === 'complete' ? 'Unlocked' : 'After completion'}</em></footer>`;
  }

  function positionUseGuidelineDetail(trigger = useGuidelineDetailTrigger) {
    const dashboard = useMissionStage?.querySelector('.use-dashboard-persistent');
    const popover = dashboard?.querySelector('#useGuidelineDetailPopover');
    if (!dashboard || !popover || !trigger?.isConnected || !popover.classList.contains('visible')) return;
    const dashboardBounds = dashboard.getBoundingClientRect();
    const triggerBounds = trigger.getBoundingClientRect();
    const gap = 13;
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    const rightLeft = triggerBounds.right - dashboardBounds.left + gap;
    const leftLeft = triggerBounds.left - dashboardBounds.left - popoverWidth - gap;
    const placeRight = rightLeft + popoverWidth <= dashboardBounds.width - 10 || leftLeft < 10;
    const left = placeRight ? rightLeft : leftLeft;
    const idealTop = triggerBounds.top - dashboardBounds.top + (triggerBounds.height - popoverHeight) / 2;
    const top = Math.max(8, Math.min(idealTop, dashboardBounds.height - popoverHeight - 8));
    popover.dataset.placement = placeRight ? 'right' : 'left';
    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
  }

  function closeUseGuidelineDetail(restoreFocus = false) {
    const popover = useMissionStage?.querySelector('#useGuidelineDetailPopover');
    if (!popover) return;
    popover.classList.remove('visible');
    popover.setAttribute('aria-hidden', 'true');
    useMissionStage?.querySelectorAll('[data-use-guideline-detail]').forEach(card => {
      card.classList.remove('detail-open');
      card.setAttribute('aria-expanded', 'false');
    });
    if (restoreFocus && useGuidelineDetailTrigger?.isConnected) useGuidelineDetailTrigger.focus({ preventScroll: true });
    useGuidelineDetailTrigger = null;
  }

  function openUseGuidelineDetail(trigger) {
    const popover = useMissionStage?.querySelector('#useGuidelineDetailPopover');
    const guidelineIndex = Number(trigger?.dataset.useGuidelineDetail);
    const guide = getUseDashboardGoal().guidelines[guidelineIndex];
    const role = useGuidelineRoles[guidelineIndex] || useGuidelineRoles[guidelineIndex % useGuidelineRoles.length];
    if (!popover || !guide || !role) return;
    if (useGuidelineDetailTrigger === trigger && popover.classList.contains('visible')) {
      closeUseGuidelineDetail(true);
      return;
    }
    closeUseMcpDetail(false);
    closeUseAgentDetail(false);
    closeUseTaskDetail(false);
    closeUseGuidelineDetail(false);
    useGuidelineDetailTrigger = trigger;
    trigger.classList.add('detail-open');
    trigger.setAttribute('aria-expanded', 'true');
    popover.className = `use-guideline-detail-popover tone-${role.tone} visible`;
    popover.innerHTML = renderUseGuidelineDetail(guide, guidelineIndex);
    popover.setAttribute('aria-hidden', 'false');
    popover.querySelector('[data-use-guideline-close]')?.addEventListener('click', () => closeUseGuidelineDetail(true));
    window.requestAnimationFrame(() => positionUseGuidelineDetail(trigger));
    haptic(5);
  }

  function bindUseGuidelineDetailEvents() {
    useMissionStage?.querySelectorAll('[data-use-guideline-detail]').forEach(card => {
      card.addEventListener('click', () => openUseGuidelineDetail(card));
      card.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openUseGuidelineDetail(card);
      });
    });
  }

  function getUseResultReport() {
    return useResultReportDetails[state.useMissionGoalIndex] || useResultReportDetails[0];
  }

  function renderUseResultReport() {
    const goal = getUseDashboardGoal();
    const report = getUseResultReport();
    return `<section class="use-report-hero" style="--report-progress:${goal.progress}">
        <div class="use-report-progress-ring"><strong>${goal.progress}<small>%</small></strong></div>
        <span><small>CURRENT OUTCOME</small><h3>${escapeMissionText(report.headline)}</h3><p>${escapeMissionText(goal.state)} · based on ${goal.sources.length} connected sources</p></span>
      </section>
      <section class="use-report-metric-grid" aria-label="Result metrics">${goal.results.map(result => `<span><b>${escapeMissionText(result[1])}</b><small>${escapeMissionText(result[0])}</small></span>`).join('')}</section>
      <article class="use-report-narrative"><small>EXECUTIVE SUMMARY</small><p>${escapeMissionText(report.summary)}</p><p>${escapeMissionText(report.interpretation)}</p></article>
      <section class="use-report-findings"><header><span><small>DETAILED REPORT</small><b>What the AI found</b></span><em>${report.findings.length} findings</em></header><div>${report.findings.map((finding, index) => `<article><i>${index + 1}</i><span><b>${escapeMissionText(finding[0])}</b><p>${escapeMissionText(finding[1])}</p></span></article>`).join('')}</div></section>
      <section class="use-report-why"><header><span><small>INFOGRAPHIC · WHY</small><b>Why this result emerged</b></span><em>Evidence weighted</em></header>
        <div class="use-report-reason-flow" aria-label="Data to result reasoning flow"><span><i>${goal.sources.length}</i><b>Sources</b><small>Authorized signals</small></span><em>→</em><span><i>${goal.tasks.length}</i><b>AI tasks</b><small>Grouped and checked</small></span><em>→</em><span><i>${goal.results.length}</i><b>Outcomes</b><small>Retained in report</small></span></div>
        <div class="use-report-driver-list">${report.drivers.map((driver, index) => `<span style="--driver:${driver[1]};--driver-index:${index}"><b>${escapeMissionText(driver[0])}</b><em>${driver[1]}%</em><i><strong></strong></i></span>`).join('')}</div>
      </section>
      <section class="use-report-evidence"><header><small>EVIDENCE SOURCES</small><b>What informed this report</b></header><div>${goal.sources.map(source => `<span>${renderUseSourceIcon(source, 'use-report-evidence-logo')}<b>${escapeMissionText(source[0])}</b><small>${escapeMissionText(source[2])}</small></span>`).join('')}</div></section>
      <article class="use-report-recommendation"><i>✦</i><span><small>RECOMMENDED NEXT MOVE</small><p>${escapeMissionText(report.recommendation)}</p></span></article>
      <p class="use-report-disclaimer">This report summarizes the current prototype data state. Review source permissions and confirm any external action before execution.</p>`;
  }

  function closeUseResultReport(restoreFocus = false) {
    if (!missionDetailDrawer) return;
    missionDetailDrawer.classList.remove('visible');
    missionDetailDrawer.setAttribute('aria-hidden', 'true');
    missionDetailDrawer.inert = true;
    useWorkspace?.classList.remove('report-open');
    const button = document.getElementById('useResultViewDetails');
    button?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) button?.focus({ preventScroll: true });
  }

  function openUseResultReport() {
    if (!missionDetailDrawer || !useResultReportContent) return;
    closeUseMcpDetail(false);
    closeUseAgentDetail(false);
    closeUseTaskDetail(false);
    closeUseGuidelineDetail(false);
    const goal = getUseDashboardGoal();
    useResultReportTitle.textContent = goal.title;
    useResultReportContent.innerHTML = renderUseResultReport();
    useWorkspace?.classList.add('report-open');
    missionDetailDrawer.classList.add('visible');
    missionDetailDrawer.setAttribute('aria-hidden', 'false');
    missionDetailDrawer.inert = false;
    document.getElementById('useResultViewDetails')?.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(() => missionDetailClose?.focus({ preventScroll: true }));
    haptic(7);
  }

  function bindUseResultDetailsButton() {
    document.getElementById('useResultViewDetails')?.addEventListener('click', openUseResultReport);
  }

  function normalizeUseReportPdfText(value) {
    return String(value ?? '')
      .replace(/[–—]/g, '-')
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/…/g, '...')
      .normalize('NFKD')
      .replace(/[^\x20-\x7E]/g, '');
  }

  function buildUseResultPdf(goal, report) {
    const encoder = new TextEncoder();
    const pages = [];
    let commands = [];
    let y = 714;
    let pageNumber = 0;
    const escapePdf = value => normalizeUseReportPdfText(value).replace(/([\\()])/g, '\\$1');
    const wrapPdf = (value, limit = 88) => {
      const words = normalizeUseReportPdfText(value).split(/\s+/).filter(Boolean);
      const lines = [];
      let line = '';
      words.forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length > limit && line) { lines.push(line); line = word; }
        else line = candidate;
      });
      if (line) lines.push(line);
      return lines;
    };
    const textCommand = (value, x, textY, size = 10, bold = false, color = '.16 .19 .27') => `BT ${color} rg /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x} ${textY} Tm (${escapePdf(value)}) Tj ET`;
    const beginPage = () => {
      pageNumber += 1;
      commands = [
        'q .91 .31 .09 rg 48 750 8 8 re f Q',
        textCommand('WEEPLE - LIVE OUTCOME REPORT', 64, 750, 10, true, '.16 .19 .27'),
        textCommand(goal.title, 48, 728, 18, true, '.12 .16 .24'),
        'q .91 .92 .95 RG .7 w 48 720 m 564 720 l S Q'
      ];
      y = 700;
    };
    const finishPage = () => {
      commands.push('q .91 .92 .95 RG .7 w 48 42 m 564 42 l S Q');
      commands.push(textCommand(`Generated by Weeple - Page ${pageNumber}`, 48, 27, 8, false, '.48 .52 .60'));
      pages.push(commands.join('\n'));
    };
    const ensureSpace = amount => { if (y - amount < 58) { finishPage(); beginPage(); } };
    const addText = (value, options = {}) => {
      const size = options.size || 10;
      const leading = options.leading || size * 1.45;
      const lines = wrapPdf(value, options.limit || (size >= 15 ? 58 : 88));
      lines.forEach(line => {
        ensureSpace(leading);
        commands.push(textCommand(line, options.x || 48, y, size, Boolean(options.bold), options.color || '.25 .29 .37'));
        y -= leading;
      });
      y -= options.after || 0;
    };
    const addSection = title => {
      ensureSpace(30);
      y -= 5;
      commands.push(textCommand(title.toUpperCase(), 48, y, 9, true, '.18 .47 .91'));
      y -= 18;
    };

    beginPage();
    addText(report.headline, { size: 16, bold: true, color: '.12 .16 .24', limit: 60, leading: 21, after: 5 });
    addText(`Goal progress: ${goal.progress}% - ${goal.state}`, { size: 9, bold: true, color: '.91 .31 .09', after: 10 });
    addSection('Result metrics');
    goal.results.forEach(result => addText(`${result[0]}: ${result[1]}`, { size: 10, bold: true, leading: 15 }));
    y -= 6;
    addSection('Executive summary');
    addText(report.summary, { after: 8 });
    addText(report.interpretation, { after: 10 });
    addSection('Detailed findings');
    report.findings.forEach((finding, index) => {
      addText(`${index + 1}. ${finding[0]}`, { bold: true, after: 1 });
      addText(finding[1], { size: 9, color: '.39 .43 .51', after: 7 });
    });
    addSection('Why this result emerged');
    report.drivers.forEach(driver => {
      ensureSpace(31);
      commands.push(textCommand(driver[0], 48, y, 9, true, '.22 .26 .34'));
      commands.push(textCommand(`${driver[1]}%`, 526, y, 9, true, '.91 .31 .09'));
      y -= 12;
      commands.push(`q .92 .93 .96 rg 48 ${y} 480 7 re f Q`);
      commands.push(`q .91 .31 .09 rg 48 ${y} ${Math.round(480 * driver[1] / 100)} 7 re f Q`);
      y -= 19;
    });
    addSection('Evidence sources');
    addText(goal.sources.map(source => `${source[0]} (${source[2]})`).join(' | '), { size: 9, after: 10 });
    addSection('Recommended next move');
    addText(report.recommendation, { bold: true, after: 8 });
    addText('Review source permissions and confirm any external action before execution.', { size: 8, color: '.48 .52 .60' });
    finishPage();

    const objects = ['', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'];
    const pageRefs = [];
    pages.forEach((stream, index) => {
      const pageId = 5 + index * 2;
      const streamId = pageId + 1;
      pageRefs.push(`${pageId} 0 R`);
      objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`;
      objects[streamId - 1] = `<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}\nendstream`;
    });
    objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
    objects[1] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageRefs.join(' ')}] >>`;
    let pdf = '%PDF-1.4\n%Weeple\n';
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets[index + 1] = encoder.encode(pdf).length;
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = encoder.encode(pdf).length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let index = 1; index <= objects.length; index += 1) pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return encoder.encode(pdf);
  }

  function downloadUseResultPdf() {
    const goal = getUseDashboardGoal();
    const report = getUseResultReport();
    const bytes = buildUseResultPdf(goal, report);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${goal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'weeple-goal'}-report.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    __showToast('PDF report downloaded');
  }

  function refreshUseSidePanels() {
    const dashboard = useMissionStage?.querySelector('.use-dashboard-persistent');
    if (!dashboard) return;
    closeUseMcpDetail(false);
    closeUseAgentDetail(false);
    closeUseTaskDetail(false);
    closeUseGuidelineDetail(false);
    closeUseResultReport(false);
    const goal = getUseDashboardGoal();
    const leftStack = dashboard.querySelector('.use-left-stack');
    const rightStack = dashboard.querySelector('.use-right-stack');
    if (leftStack) leftStack.innerHTML = `${renderSourcePanel(goal)}${renderTaskPanel(goal)}`;
    if (rightStack) rightStack.innerHTML = `${renderGuidelinePanel(goal)}${renderExpertPanel()}${renderResultPanel(goal)}`;
    document.getElementById('useOpenImportData')?.addEventListener('click', () => openRoutedView('data'));
    bindUseSourceDetailEvents();
    bindUseAgentDetailEvents();
    bindUseTaskDetailEvents();
    bindUseGuidelineDetailEvents();
    bindUseResultDetailsButton();
  }

  function syncUsePersistentDashboard(options = {}) {
    const dashboard = useMissionStage?.querySelector('.use-dashboard-persistent');
    if (!dashboard) return;
    const working = state.useMissionState === 'working';
    const sidePanels = dashboard.querySelector('.use-persistent-panels');
    dashboard.classList.toggle('is-working', working);
    dashboard.dataset.missionState = working ? 'working' : 'idle';
    dashboard.dataset.phase = state.useMissionExecutionPhase;
    sidePanels?.setAttribute('aria-hidden', String(!working));
    if (sidePanels) sidePanels.inert = !working;
    if (!working) {
      closeUseMcpDetail(false);
      closeUseAgentDetail(false);
      closeUseTaskDetail(false);
      closeUseGuidelineDetail(false);
    }
    if (options.refreshPanels) refreshUseSidePanels();
  }

  function refreshUseComposer(options = {}) {
    const currentComposer = useMissionStage?.querySelector('.use-command-bar');
    if (!currentComposer) return;
    currentComposer.outerHTML = renderUseComposer(false);
    bindUseComposerEvents();
    alignUseSpeechBubble();
    if (options.focusInput) window.requestAnimationFrame(() => document.getElementById('missionPromptInput')?.focus({ preventScroll: true }));
  }

  function finishMissionListening() {
    try { missionRecognition?.stop(); } catch (error) { /* Recognition may already be stopped. */ }
    missionRecognition = null;
    state.useMissionListening = false;
    window.clearInterval(missionListeningTimer);
    missionListeningTimer = 0;
    if (!state.useMissionDraft.trim()) state.useMissionDraft = 'Find investors who invest in AI education startups';
    refreshUseComposer({ focusInput: true });
  }

  function startMissionListeningDashboard() {
    if (state.useMissionListening) return;
    state.useMissionListening = true;
    state.useMissionElapsed = 0;
    missionRecognitionFinal = '';
    refreshUseComposer();
    missionListeningTimer = window.setInterval(() => {
      state.useMissionElapsed += 1;
      const elapsed = document.getElementById('missionVoiceElapsed');
      if (elapsed) elapsed.textContent = formatMissionTime(state.useMissionElapsed);
    }, 1000);
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { __showToast('Voice capture is simulated in this browser'); return; }
    missionRecognition = new Recognition();
    missionRecognition.continuous = true;
    missionRecognition.interimResults = true;
    missionRecognition.lang = document.documentElement.lang || 'en-US';
    missionRecognition.onresult = event => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) missionRecognitionFinal += `${transcript} `; else interim += transcript;
      }
      state.useMissionDraft = `${missionRecognitionFinal}${interim}`.trim();
      const input = document.getElementById('missionPromptInput');
      if (input) input.value = state.useMissionDraft;
    };
    missionRecognition.onerror = event => {
      if (!['no-speech', 'aborted'].includes(event.error)) __showToast('Microphone access is unavailable');
    };
    try { missionRecognition.start(); } catch (error) { __showToast('Microphone access is unavailable'); }
  }

  function runUseMissionExecution() {
    state.useMissionExecutionPhase = 8;
    if (state.useMissionState === 'working') {
      refreshUseSidePanels();
      syncUsePersistentDashboard();
    }
  }

  function switchUseDashboardGoal(nextIndex) {
    const goalIndex = Number(nextIndex);
    if (!Number.isInteger(goalIndex) || !useDashboardGoals[goalIndex] || goalIndex === state.useMissionGoalIndex) return;

    state.useMissionGoalIndex = goalIndex;
    if (state.useMissionState === 'idle') state.useMissionDraft = useDashboardGoals[goalIndex].title;
    useMissionStage?.querySelectorAll('[data-use-goal]').forEach(button => {
      const active = Number(button.dataset.useGoal) === goalIndex;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const promptInput = document.getElementById('missionPromptInput');
    if (promptInput && state.useMissionState === 'idle') promptInput.value = state.useMissionDraft;
    refreshUseSidePanels();
    if (state.useMissionState === 'working') window.requestAnimationFrame(() => {
      useMissionStage?.querySelector(`[data-use-goal="${goalIndex}"]`)?.focus({ preventScroll: true });
    });
    haptic(6);
  }

  function bindUseComposerEvents() {
    const composer = useMissionStage?.querySelector('.use-command-bar');
    if (!composer) return;
    const input = composer.querySelector('#missionPromptInput');
    const submitPrompt = event => {
      event.preventDefault();
      if (state.useMissionListening) return;
      const prompt = input?.value.trim();
      if (!prompt) { __showToast('Add a request before sending'); input?.focus(); return; }
      state.useMissionRequest = prompt;
      state.useMissionDraft = prompt;
      state.useMissionExecutionPhase = 8;
      setUseMissionState('working', { announce: false });
    };
    input?.addEventListener('input', event => { state.useMissionDraft = event.currentTarget.value; });
    composer.querySelector('#missionVoiceStart')?.addEventListener('click', startMissionListeningDashboard);
    composer.querySelector('#missionVoiceConfirm')?.addEventListener('click', finishMissionListening);
    composer.querySelector('#missionPromptSend')?.addEventListener('click', submitPrompt);
    composer.addEventListener('submit', submitPrompt);
  }

  function bindUseDashboardEvents() {
    bindUseComposerEvents();
    bindUseSourceDetailEvents();
    bindUseAgentDetailEvents();
    bindUseTaskDetailEvents();
    bindUseGuidelineDetailEvents();
    bindUseResultDetailsButton();
    useMissionStage?.querySelectorAll('[data-use-goal]').forEach(button => button.addEventListener('click', () => switchUseDashboardGoal(button.dataset.useGoal)));
    document.getElementById('useGoalStringToggle')?.addEventListener('click', event => {
      state.useMissionGoalStringHidden = !state.useMissionGoalStringHidden;
      const hidden = state.useMissionGoalStringHidden;
      const button = event.currentTarget;
      const goalMap = button.closest('.use-goal-map');
      const goalString = goalMap?.querySelector('.use-goal-string-band');
      goalMap?.classList.toggle('goal-string-hidden', hidden);
      goalString?.setAttribute('aria-hidden', String(hidden));
      button.setAttribute('aria-expanded', String(!hidden));
      button.setAttribute('aria-label', `${hidden ? 'Show' : 'Hide'} goal string`);
      button.setAttribute('title', `${hidden ? 'Show' : 'Hide'} goal string`);
      try { localStorage.setItem('weeple-use-goal-string-hidden', hidden ? '1' : '0'); } catch (error) { /* storage is optional */ }
      haptic(5);
    });
    document.getElementById('useOpenImportData')?.addEventListener('click', () => openRoutedView('data'));
    useMissionStage?.addEventListener('click', event => {
      const mcpPopover = useMissionStage.querySelector('#useMcpDetailPopover');
      const agentPopover = useMissionStage.querySelector('#useAgentDetailPopover');
      const taskPopover = useMissionStage.querySelector('#useTaskDetailPopover');
      const guidelinePopover = useMissionStage.querySelector('#useGuidelineDetailPopover');
      if (mcpPopover?.classList.contains('visible') && !event.target.closest('#useMcpDetailPopover') && !event.target.closest('[data-use-source-detail]')) closeUseMcpDetail(false);
      if (agentPopover?.classList.contains('visible') && !event.target.closest('#useAgentDetailPopover') && !event.target.closest('[data-use-agent-detail]')) closeUseAgentDetail(false);
      if (taskPopover?.classList.contains('visible') && !event.target.closest('#useTaskDetailPopover') && !event.target.closest('[data-use-task-detail]')) closeUseTaskDetail(false);
      if (guidelinePopover?.classList.contains('visible') && !event.target.closest('#useGuidelineDetailPopover') && !event.target.closest('[data-use-guideline-detail]')) closeUseGuidelineDetail(false);
    });
    useMissionStage?.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (useMissionStage.querySelector('#useGuidelineDetailPopover')?.classList.contains('visible')) {
        event.preventDefault();
        closeUseGuidelineDetail(true);
      } else if (useMissionStage.querySelector('#useTaskDetailPopover')?.classList.contains('visible')) {
        event.preventDefault();
        closeUseTaskDetail(true);
      } else if (useMissionStage.querySelector('#useAgentDetailPopover')?.classList.contains('visible')) {
        event.preventDefault();
        closeUseAgentDetail(true);
      } else if (useMissionStage.querySelector('#useMcpDetailPopover')?.classList.contains('visible')) {
        event.preventDefault();
        closeUseMcpDetail(true);
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 980) {
        closeUseMcpDetail(false);
        closeUseAgentDetail(false);
        closeUseTaskDetail(false);
        closeUseGuidelineDetail(false);
      } else {
        positionUseMcpDetail();
        positionUseAgentDetail();
        positionUseTaskDetail();
        positionUseGuidelineDetail();
      }
    });
  }

  function bindUseMissionEvents() {
    const byId = id => document.getElementById(id);
    missionProgress?.querySelectorAll('[data-mission-target]').forEach(button => button.addEventListener('click', () => setUseMissionState(button.dataset.missionTarget, { toast: true })));
    byId('missionVoiceStart')?.addEventListener('click', startMissionListening);
    byId('missionVoiceCancel')?.addEventListener('click', () => state.useMissionListening ? setUseMissionState('voice', { announce: false }) : setUseMissionState('review'));
    byId('missionPromptForm')?.addEventListener('submit', event => {
      event.preventDefault();
      if (state.useMissionListening) return;
      const prompt = byId('missionPromptInput')?.value.trim();
      if (!prompt) { __showToast('Type a request or use the microphone'); byId('missionPromptInput')?.focus(); return; }
      state.useMissionRequest = prompt;
      setUseMissionState('review');
    });
    const requestText = byId('missionRequestText');
    requestText?.addEventListener('input', () => { state.useMissionRequest = requestText.value; const count = byId('missionRequestCount'); if (count) count.textContent = `${requestText.value.length} / 500`; });
    byId('missionConfirmRequest')?.addEventListener('click', () => { if (!state.useMissionRequest.trim()) { __showToast('Add a request before continuing'); requestText?.focus(); return; } setUseMissionState('collecting'); });
    byId('missionRestart')?.addEventListener('click', () => { state.useMissionRequest = 'Find investors for my startup who are interested in AI education platforms and can invest between $100K to $500K.'; state.useMissionElapsed = 0; setUseMissionState('voice'); });
    const sourceLanes = [...(useMissionStage?.querySelectorAll('[data-source-lane]') || [])];
    sourceLanes.forEach(lane => {
      const slider = lane.querySelector('[data-source-slider]');
      const cards = [...lane.querySelectorAll('[data-source-card]')];
      const count = lane.querySelector('[data-source-slide-count]');
      if (!slider || !cards.length) return;
      const visibleCards = Math.min(2, cards.length);
      const maxStart = Math.max(0, cards.length - visibleCards);
      const getStep = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : slider.clientWidth;
      const setSourceCount = start => {
        if (count) count.textContent = `${start + 1}–${Math.min(start + visibleCards, cards.length)} / ${cards.length}`;
      };
      const updateSourceCount = () => {
        const index = Math.max(0, Math.min(maxStart, Math.round(slider.scrollLeft / Math.max(getStep(), 1))));
        setSourceCount(index);
      };
      lane.querySelectorAll('[data-source-slide]').forEach(button => button.addEventListener('click', () => {
        const step = Math.max(getStep(), 1);
        const current = Math.max(0, Math.min(maxStart, Math.round(slider.scrollLeft / step)));
        const direction = button.dataset.sourceSlide === 'next' ? 1 : -1;
        const target = maxStart ? (current + direction + maxStart + 1) % (maxStart + 1) : 0;
        slider.scrollTo({ left: target * step, behavior: 'auto' });
        setSourceCount(target);
      }));
      slider.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        lane.querySelector(`[data-source-slide="${event.key === 'ArrowRight' ? 'next' : 'prev'}"]`)?.click();
      });
      slider.addEventListener('scroll', updateSourceCount, { passive: true });
    });
    if (sourceLanes.length) missionSourceSliderTimer = window.setInterval(() => {
      sourceLanes.forEach(lane => lane.querySelector('[data-source-slide="next"]')?.click());
    }, 3000);
    byId('missionNotify')?.addEventListener('click', event => { event.currentTarget.textContent = 'Notifications on ✓'; event.currentTarget.disabled = true; __showToast('You will be notified about new investor replies'); });
    byId('missionCompleteNow')?.addEventListener('click', () => setUseMissionState('complete'));
    byId('missionAudioPlay')?.addEventListener('click', event => {
      const button = event.currentTarget;
      const playing = button.classList.toggle('playing');
      const waveform = button.parentElement.querySelector('.waveform');
      waveform?.classList.toggle('paused', !playing);
      if (playing && 'speechSynthesis' in window) { window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance('Mission complete. I found 12 investors, mailed them, and 1 showed interest.'); utterance.onend = () => { button.classList.remove('playing'); waveform?.classList.add('paused'); }; window.speechSynthesis.speak(utterance); }
    });
    byId('missionDownload')?.addEventListener('click', () => {
      const report = ['Weeple Investor Mission Report', '', 'Mission: Find investors for my startup', 'Status: Completed', '', '12 investors found', '12 emails mailed', '1 interested reply', '', 'Interested: Michael Chen — Northstar Learning Fund — AI education — $250K–$500K'].join('\n');
      const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([report], { type: 'text/plain' })); link.download = 'weeple-investor-mission-report.txt'; link.click(); window.setTimeout(() => URL.revokeObjectURL(link.href), 1000); __showToast('Mission report downloaded');
    });
    byId('missionShare')?.addEventListener('click', async () => { const text = 'Weeple found 12 investors, mailed all 12, and received 1 interested reply.'; try { if (navigator.share) await navigator.share({ title: 'Weeple mission report', text }); else { await navigator.clipboard.writeText(text); __showToast('Report summary copied to clipboard'); } } catch (error) { /* User cancelled sharing. */ } });
    byId('missionViewDetails')?.addEventListener('click', openUseResultReport);
  }

  function renderUseMission(options = {}) {
    if (!useMissionStage || !missionProgress) return;
    window.clearInterval(missionSourceSliderTimer);
    missionSourceSliderTimer = 0;
    if (!useMissionStates.includes(state.useMissionState)) state.useMissionState = 'idle';
    const existingDashboard = useMissionStage.querySelector('.use-dashboard-persistent');
    if (!existingDashboard) {
      useMissionStage.innerHTML = renderUsePersistentDashboard();
      bindUseDashboardEvents();
      alignUseSpeechBubble();
    } else {
      syncUsePersistentDashboard({ refreshPanels: options.refreshPanels });
    }
    if (options.suppressMotion) useMissionStage.querySelector('.use-dashboard')?.classList.add('goal-switch-static');
    missionProgress.innerHTML = '';
    missionProgress.setAttribute('aria-hidden', 'true');
  }

  const onboardingScenarios = {
    goal: { title: 'Advance an important goal', sources: ['Calendar availability', 'Selected goal notes'], result: 'A focused next-action plan with a protected execution block.' },
    organize: { title: 'Organize my work', sources: ['Calendar availability', 'Selected work folder'], result: 'A prioritized daily brief grounded in your real commitments.' },
    health: { title: 'Understand my health', sources: ['Activity summary', 'Sleep summary'], result: 'A clear recovery insight connected to your health goal.' },
    learn: { title: 'Learn something consistently', sources: ['Learning goal', 'Calendar availability'], result: 'A realistic practice plan that fits your actual week.' }
  };

  function renderOnboarding() {
    const step = state.onboardingStep;
    const scenario = onboardingScenarios[state.onboardingScenario];
    const titles = ['What would be useful first?', 'Connect only what is needed', 'See what Weeple is doing', 'Your first example result'];
    const descriptions = ['Choose one outcome. Weeple will request only the minimum data needed to produce a real, verifiable result.', `For “${scenario.title},” these two sources are enough to begin.`, 'Nothing happens invisibly. Each processing step explains its purpose.', 'This is clearly labeled example content. A real result appears only after you authorize real data.'];
    onboardingTitle.textContent = titles[step]; onboardingDescription.textContent = descriptions[step]; onboardingProgressLabel.textContent = `STEP ${step + 1} OF 4`;
    document.querySelectorAll('.onboarding-progress i').forEach((item, index) => item.classList.toggle('active', index <= step));
    onboardingBack.style.visibility = step === 0 ? 'hidden' : 'visible'; onboardingNext.textContent = step === 3 ? 'Finish setup' : 'Continue';
    if (step === 0) onboardingBody.innerHTML = `<div class="scenario-grid">${Object.entries(onboardingScenarios).map(([key, item]) => `<button class="${key === state.onboardingScenario ? 'active' : ''}" type="button" data-scenario="${key}"><i></i><strong>${item.title}</strong><small>${item.result}</small></button>`).join('')}</div>`;
    if (step === 1) onboardingBody.innerHTML = `<div class="minimum-access"><span><i></i><strong>Minimum data request</strong><small>No broad account access required</small></span>${scenario.sources.map((source, index) => `<button class="on" type="button" aria-pressed="true"><i>${index + 1}</i><span><strong>${source}</strong><small>Needed only to produce this first result</small></span><em></em></button>`).join('')}<p>You can revoke either source at any time. Revoked data will not be used by future AI tasks.</p></div>`;
    if (step === 2) onboardingBody.innerHTML = '<div class="processing-explainer"><span class="done"><i>✓</i><b>Authorization checked</b><small>Only the selected scope is available</small></span><span class="active"><i></i><b>Understanding current context</b><small>Organizing relevant events and materials locally</small></span><span><i>03</i><b>Preparing the first output</b><small>Creating a result you can confirm, adjust, or reject</small></span><span><i>04</i><b>Waiting for your feedback</b><small>Nothing becomes memory without the applicable rule or confirmation</small></span></div>';
    if (step === 3) onboardingBody.innerHTML = `<div class="first-result"><span>EXAMPLE RESULT</span><h3>${scenario.result}</h3><p>Based on: ${scenario.sources.join(' + ')}. No external action has been taken.</p><section><small>Was this useful?</small><button type="button" data-result-feedback="useful">Useful</button><button type="button" data-result-feedback="adjust">Adjust</button><button type="button" data-result-feedback="reject">Not useful</button></section><em>Next step: connect one additional source only if it improves this result.</em></div>`;
    onboardingBody.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => { state.onboardingScenario = button.dataset.scenario; renderOnboarding(); }));
    onboardingBody.querySelectorAll('[data-result-feedback]').forEach(button => button.addEventListener('click', () => { onboardingBody.querySelectorAll('[data-result-feedback]').forEach(item => item.classList.toggle('active', item === button)); __showToast(`Feedback recorded: ${button.textContent}`); }));
  }

  function openOnboarding() { state.onboardingStep = 0; onboardingOverlay.classList.add('visible'); onboardingOverlay.setAttribute('aria-hidden', 'false'); renderOnboarding(); }
  function closeOnboarding() { onboardingOverlay.classList.remove('visible'); onboardingOverlay.setAttribute('aria-hidden', 'true'); }

  function openDataWorkspace(announce = true) {
    state.dataWorkspaceActive = true; stopTopologyLoop(); dataWorkspace.classList.add('visible'); dataWorkspace.setAttribute('aria-hidden', 'false'); osShell.classList.add('data-page');
    renderSourceGrid(); focusCluster('data', false); if (announce) __showToast('Personal data control center opened');
  }
  function closeDataWorkspace() { state.dataWorkspaceActive = false; dataWorkspace.classList.remove('visible'); dataWorkspace.setAttribute('aria-hidden', 'true'); osShell.classList.remove('data-page'); closeSourceInspector(false); closeConnectionWizard(); }
  function openUseWorkspace(announce = true) {
    state.useWorkspaceActive = true; stopTopologyLoop(); useWorkspace.classList.add('visible'); useWorkspace.setAttribute('aria-hidden', 'false'); osShell.classList.add('use-page'); focusCluster('memory', false); renderUseMission(); if (announce) __showToast('Use Data mission workspace opened');
  }
  function closeUseWorkspace() { clearUseMissionTimers(); closeUseMcpDetail(false); closeUseAgentDetail(false); closeUseTaskDetail(false); closeUseGuidelineDetail(false); closeUseResultReport(false); state.useWorkspaceActive = false; useWorkspace.classList.remove('visible'); useWorkspace.setAttribute('aria-hidden', 'true'); osShell.classList.remove('use-page'); closeMemoryDrawer(); closeMemoryProposal(); }

  function openPrimaryView(key, announce = true) {
closeDataWorkspace();
    closeUseWorkspace();
    if (key === 'goals') {
      openGoalsWorkspace(state.currentGoalIndex, announce);
      return;
    }
    closeGoalsWorkspace();
    if (key === 'data') { openDataWorkspace(announce); return; }
    if (key === 'memory') { openUseWorkspace(announce); return; }
    focusCluster(key, announce);
    startTopologyLoop();
  }

  let toastTimer;
  let toastActionHandler = null;
  function __legacyShowToast(message, options = {}) {
    toast.querySelector('span').textContent = message;
    toastActionHandler = typeof options.onAction === 'function' ? options.onAction : null;
    toastAction.hidden = !toastActionHandler;
    toastAction.textContent = options.actionLabel || 'Undo';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toastActionHandler = null;
      toastAction.hidden = true;
    }, options.duration || 2100);
  }
  toastAction.addEventListener('click', () => {
    const handler = toastActionHandler;
    if (!handler) return;
    clearTimeout(toastTimer);
    toast.classList.remove('show');
    toastActionHandler = null;
    toastAction.hidden = true;
    handler();
  });

  function renderFocusMode(key) {
    const content = focusContent[key];
    const active = Boolean(content) && !state.goalWorkspaceActive && !state.dataWorkspaceActive && !state.useWorkspaceActive;
    osShell.classList.toggle('focus-mode', active);
    focusModePanel.classList.toggle('visible', active);
    focusModePanel.setAttribute('aria-hidden', String(!active));
    if (!content) return;
    focusEyebrow.textContent = content.eyebrow;
    focusTitle.textContent = content.title;
    focusDescription.textContent = content.description;
    focusActions.innerHTML = '';
    content.actions.forEach((action, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = `<span><small>0${index + 1}</small>${action}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>`;
      button.addEventListener('click', () => {
        if (button.classList.contains('is-loading')) return;
        button.classList.add('is-loading');
        button.setAttribute('aria-busy', 'true');
        haptic(10);
        window.setTimeout(() => {
          button.classList.remove('is-loading');
          button.removeAttribute('aria-busy');
          __showToast(`${action} ready`);
        }, 720);
      });
      focusActions.appendChild(button);
    });
  }

  function focusCluster(key, announce = true, preferredNode = null) {
    const target = focusAngles[key] || focusAngles.overview;
    state.activeCluster = key;
    state.targetRotationY = target.y;
    state.targetRotationX = target.x;
    state.targetZoom = target.zoom;
    state.autoBaseX = target.x;
    state.autoResumeAt = performance.now() + 3200;
    const targetCenter = key === 'overview' ? { x: 0, y: 0, z: 0 } : clusterCenters[key];
    state.viewCenterTarget.x = targetCenter.x;
    state.viewCenterTarget.y = targetCenter.y;
    state.viewCenterTarget.z = targetCenter.z;
    applyAmbientTheme();
    renderFocusMode(key);
    if (key !== 'overview') dismissInteractionHint();
    Object.keys(state.clusterVisibilityTarget).forEach((clusterKey) => {
      state.clusterVisibilityTarget[clusterKey] = key === 'overview' || key === clusterKey ? 1 : 0;
    });
    if (state.hoverNode && key !== 'overview' && state.hoverNode.cluster !== key) state.hoverNode = null;

    const routeKey = key === 'data' ? 'import-data' : key === 'memory' ? 'use-data' : key;
    document.querySelectorAll('.nav-item').forEach(item => {
      const route = item.dataset.route || item.dataset.view;
      item.classList.toggle('active', route === routeKey || route === key);
    });
    document.querySelectorAll('.feature-card').forEach(card => card.classList.toggle('active', card.dataset.focus === key));
    if (key === 'overview') {
      state.selectedNode = null;
      hideTooltip();
    } else {
      const core = nodes.find(node => node.id === `${key}-core`);
      const selected = preferredNode || core;
      state.selectedNode = selected;
      state.hoverNode = preferredNode && !preferredNode.core ? preferredNode : null;
      hideTooltip();
      if (preferredNode && !preferredNode.core) setTimeout(() => positionTooltip(selected), 340);
    }
    if (announce) __showToast(key === 'overview' ? 'Universe overview restored' : `${clusterConfig.find(c => c.key === key).title} hub focused`);
  }

  document.querySelectorAll('[data-focus]').forEach(button => {
    button.addEventListener('click', () => focusCluster(button.dataset.focus));
  });
  /* Primary nav / brand home are owned by shell.js (hash router). */
  focusBack?.addEventListener('click', () => { try { __navigate('overview'); } catch (_n) { openPrimaryView('overview'); } });
  goalAdd?.addEventListener('click', openGoalCreateSheet);
  reasoningGoalAdd?.addEventListener('click', openGoalCreateSheet);
  goalLibraryAdd?.addEventListener('click', openGoalCreateSheet);
  goalMenuButton?.addEventListener('click', () => {
    if (goalMenuButton.disabled) return;
    openGoalEditSheet();
  });
  goalMoreButton?.addEventListener('click', () => {
    if (goalMoreButton.disabled) return;
    const visible = goalActionMenu.classList.toggle('visible');
    goalActionMenu.setAttribute('aria-hidden', String(!visible));
    goalMoreButton.setAttribute('aria-expanded', String(visible));
    haptic(5);
  });
  goalDeleteButton?.addEventListener('click', openGoalDeleteSheet);
  goalDeleteCancel?.addEventListener('click', closeGoalDeleteSheet);
  goalDeleteConfirm?.addEventListener('click', deleteSelectedGoal);
  goalResultDrawerClose?.addEventListener('click', closeGoalResultDrawer);

  function commitGoalPlanChange(goal, message) {
    syncGoalTaskStats(goal);
    updateGoalCompletionSummary(goal);
    goal.updated = 'Updated now';
    persistCustomGoals();
    persistGoalPlanOverrides();
    renderGoalCommandCenter(goal);
    renderGoalCollection();
    if (typeof renderCalendar === 'function') renderCalendar('left', false);
    if (message) __showToast(message);
  }

  async function createGoalShareCard(goal, downloadOnly = false) {
    const artwork = resolveGoalArtwork(goal);
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 675;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = artwork.url;
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const shade = context.createLinearGradient(0, 0, canvas.width, 0);
    shade.addColorStop(0, 'rgba(10,16,26,.86)'); shade.addColorStop(.62, 'rgba(10,16,26,.22)'); shade.addColorStop(1, 'rgba(10,16,26,.08)');
    context.fillStyle = shade; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ff681f'; context.beginPath(); context.arc(82, 78, 9, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#ffffff'; context.font = '700 22px Arial'; context.fillText(`${String(goal.category).toUpperCase()} GOAL`, 108, 86);
    context.font = '800 58px Arial';
    const title = goal.title.length > 38 ? `${goal.title.slice(0, 36)}…` : goal.title;
    context.fillText(title, 72, 190);
    context.fillStyle = '#ff7430'; context.font = '800 112px Arial'; context.fillText(`${goal.progress}%`, 72, 340);
    context.fillStyle = '#ffffff'; context.font = '700 25px Arial'; context.fillText(`Target · ${formatGoalPlanMoment(`${goalPlanDateKey(goal)}T${goal.scheduledTime || '23:59'}`)}`, 78, 405);
    context.fillStyle = 'rgba(255,255,255,.8)'; context.font = '600 22px Arial'; context.fillText('Making meaningful progress with Weeple', 78, 580);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Share card could not be created');
    const filename = `${goalPlanSlug(goal.title)}-progress.png`;
    const file = new File([blob], filename, { type: 'image/png' });
    if (!downloadOnly && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({ title: goal.title, text: `${goal.progress}% toward ${goal.title}`, files: [file] });
      return 'shared';
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    try { await navigator.clipboard?.writeText(`${goal.progress}% toward ${goal.title}`); } catch (error) { /* download remains available */ }
    return 'downloaded';
  }

  goalGameContent?.addEventListener('click', (event) => {
    if (event.target.closest('[data-empty-goal-add]')) { openGoalCreateSheet(); return; }
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;

    if (event.target.closest('[data-goal-list-toggle]')) { goalPlanListOpen = !goalPlanListOpen; renderGoalGameBoard(goal); if (goalPlanListOpen) window.requestAnimationFrame(() => goalGameContent.querySelector('.goal-plan-list input')?.focus()); haptic(5); return; }
    if (event.target.closest('[data-goal-list-close]')) { goalPlanListOpen = false; renderGoalGameBoard(goal); return; }
    const directionButton = event.target.closest('[data-goal-direction]');
    if (directionButton) {
      const direction = Number(directionButton.dataset.goalDirection);
      if (!direction) return;
      navigateGoalBy(direction);
      return;
    }
    const goalSelect = event.target.closest('[data-goal-plan-select]');
    if (goalSelect) {
      window.clearTimeout(goalPlanTransitionTimer);
      goalPlanTransitionDirection = 0;
      goalPlanVisualEnter = true;
      goalPlanListOpen = false;
      goalPlanMoreOpen = false;
      goalPlanIntelDetail = null;
      goalPlanFocusedTaskId = '';
      selectGoal(Number(goalSelect.dataset.goalPlanSelect), false);
      haptic(8);
      return;
    }
    if (event.target.closest('[data-goal-create]')) { goalPlanListOpen = false; openGoalCreateSheet(); return; }
    if (event.target.closest('[data-goal-plan-more]')) {
      goalPlanMoreOpen = !goalPlanMoreOpen;
      renderGoalGameBoard(goal);
      window.requestAnimationFrame(() => goalGameContent.querySelector(goalPlanMoreOpen ? '.goal-plan-image-more [role="menu"] button' : '[data-goal-plan-more]')?.focus());
      haptic(5);
      return;
    }
    if (event.target.closest('[data-goal-plan-edit]')) { goalPlanMoreOpen = false; openGoalEditSheet(); return; }
    if (event.target.closest('[data-goal-plan-delete]')) { goalPlanMoreOpen = false; openGoalDeleteSheet(); return; }
    if (event.target.closest('[data-goal-plan-share]')) { goalPlanMoreOpen = false; goalPlanShareOpen = true; renderGoalGameBoard(goal); return; }
    if (event.target.closest('[data-goal-share-close]')) { goalPlanShareOpen = false; renderGoalGameBoard(goal); return; }
    const shareButton = event.target.closest('[data-goal-share-confirm],[data-goal-share-download]');
    if (shareButton) {
      shareButton.disabled = true; shareButton.textContent = 'Preparing...';
      createGoalShareCard(goal, shareButton.hasAttribute('data-goal-share-download')).then(result => { goalPlanShareOpen = false; renderGoalGameBoard(goal); __showToast(result === 'shared' ? 'Goal momentum shared' : 'Private goal card downloaded'); }).catch(error => { shareButton.disabled = false; shareButton.textContent = 'Try again'; __showToast('Sharing is unavailable in this browser'); });
      return;
    }
    const suggestionOpen = event.target.closest('[data-goal-suggestion-open]');
    if (suggestionOpen && !event.target.closest('[data-game-suggestion]')) { goalPlanIntelDetail = { type: 'suggestion', index: Number(suggestionOpen.dataset.goalSuggestionOpen) }; renderGoalGameBoard(goal); haptic(6); return; }
    const observationOpen = event.target.closest('[data-goal-observation-index],[data-goal-observation-open]');
    if (observationOpen) { goalPlanIntelDetail = { type: 'observation', index: Number(observationOpen.dataset.goalObservationIndex || observationOpen.dataset.goalObservationOpen || 0) }; renderGoalGameBoard(goal); haptic(6); return; }
    if (event.target.closest('[data-goal-prediction-open]')) { goalPlanIntelDetail = { type: 'prediction' }; renderGoalGameBoard(goal); haptic(6); return; }
    if (event.target.closest('[data-goal-intel-close]')) { goalPlanIntelDetail = null; renderGoalGameBoard(goal); return; }
    if (event.target.closest('[data-goal-task-drawer-toggle]')) { goalPlanTaskDrawerOpen = !goalPlanTaskDrawerOpen; goalPlanTaskEditor = null; goalPlanSubgoalEditor = null; renderGoalGameBoard(goal); haptic(6); return; }
    if (event.target.closest('[data-goal-task-drawer-close]')) { goalPlanTaskDrawerOpen = false; goalPlanTaskEditor = null; goalPlanSubgoalEditor = null; renderGoalGameBoard(goal); return; }
    const ownerButton = event.target.closest('[data-goal-task-owner]');
    if (ownerButton) { goalPlanTaskOwner = ownerButton.dataset.goalTaskOwner; goalPlanTaskEditor = null; renderGoalGameBoard(goal); haptic(5); return; }
    if (event.target.closest('[data-goal-task-add]')) { goalPlanSubgoalEditor = null; goalPlanTaskEditor = { owner: goalPlanTaskOwner, subgoalIndex: Math.max(0, goal.openSubgoalIndex || 0), taskIndex: -1 }; renderGoalGameBoard(goal); window.setTimeout(() => goalGameContent.querySelector('[name="taskName"]')?.focus(), 30); return; }
    if (event.target.closest('[data-goal-task-editor-close]')) { goalPlanTaskEditor = null; renderGoalGameBoard(goal); return; }
    if (event.target.closest('[data-goal-subgoal-editor-close]')) { goalPlanSubgoalEditor = null; renderGoalGameBoard(goal); return; }
    const taskAction = event.target.closest('[data-goal-task-action]');
    if (taskAction) {
      const [subgoalIndex, taskIndex] = taskAction.dataset.taskPath.split(':').map(Number);
      const task = goal.subgoals[subgoalIndex]?.executionTasks?.[taskIndex];
      if (!task) return;
      const action = taskAction.dataset.goalTaskAction;
      if (action === 'edit') { goalPlanTaskEditor = { owner: task.owner, subgoalIndex, taskIndex }; renderGoalGameBoard(goal); return; }
      if (action === 'delete') {
        if (taskAction.dataset.confirm !== 'true') { taskAction.dataset.confirm = 'true'; taskAction.textContent = 'Confirm'; window.setTimeout(() => { if (taskAction.isConnected) { taskAction.dataset.confirm = 'false'; taskAction.textContent = 'Delete'; } }, 2200); return; }
        goal.subgoals[subgoalIndex].executionTasks.splice(taskIndex, 1); goalPlanTaskEditor = null; commitGoalPlanChange(goal, `${task.name} deleted`); return;
      }
      if (action === 'toggle') { task.done = !task.done; task.state = task.done ? 'Completed' : 'Ready now'; commitGoalPlanChange(goal, task.done ? 'Task completed' : 'Task reopened'); haptic(10); return; }
      if (action === 'run') { task.aiState = 'running'; task.done = false; task.state = 'Working'; commitGoalPlanChange(goal, 'AI preparation started'); haptic(9); return; }
      if (action === 'pause') { task.aiState = 'queued'; task.done = false; task.state = 'Queued'; commitGoalPlanChange(goal, 'AI preparation paused'); haptic(8); return; }
      if (action === 'review') { goalPlanIntelDetail = { type: 'task', subgoalIndex, taskIndex }; renderGoalGameBoard(goal); haptic(6); return; }
      if (action === 'cycle') {
        task.aiState = task.aiState === 'queued' ? 'running' : task.aiState === 'running' ? 'prepared' : 'queued';
        task.done = task.aiState === 'prepared'; task.state = task.aiState === 'running' ? 'Working' : task.aiState === 'prepared' ? 'Completed' : 'Queued';
        commitGoalPlanChange(goal, task.aiState === 'running' ? 'AI work started' : task.aiState === 'prepared' ? 'AI output prepared for review' : 'AI work queued'); haptic(9); return;
      }
    }
    const acceptButton = event.target.closest('[data-game-subgoal-accept]');
    const rejectButton = event.target.closest('[data-game-subgoal-reject]');
    const restoreButton = event.target.closest('[data-game-subgoal-restore]');
    const editButton = event.target.closest('[data-game-subgoal-edit]');
    const deleteButton = event.target.closest('[data-game-subgoal-delete]');
    const suggestionButton = event.target.closest('[data-game-suggestion]');

    if (event.target.closest('[data-game-subgoal-add]')) {
      goalPlanTaskEditor = null;
      goalPlanSubgoalEditor = -1;
      renderGoalGameBoard(goal);
      window.setTimeout(() => goalGameContent.querySelector('[name="subgoalName"]')?.focus(), 30);
      return;
    }
    if (acceptButton) {
      const subgoal = goal.subgoals[Number(acceptButton.dataset.gameSubgoalAccept)];
      if (!subgoal) return;
      subgoal.confirmed = true;
      subgoal.rejected = false;
      subgoal.state = subgoal.state === 'Completed' ? 'Completed' : 'Active';
      goal.updated = 'Updated now';
      persistCustomGoals(); persistGoalPlanOverrides(); renderGoalCommandCenter(goal); renderGoalCollection();
      __showToast(`${subgoal.name} accepted`); haptic(12);
      return;
    }
    if (rejectButton) {
      const subgoal = goal.subgoals[Number(rejectButton.dataset.gameSubgoalReject)];
      if (!subgoal) return;
      subgoal.confirmed = false;
      subgoal.rejected = true;
      subgoal.state = 'Rejected';
      goal.updated = 'Updated now';
      persistCustomGoals(); persistGoalPlanOverrides(); renderGoalCommandCenter(goal); renderGoalCollection();
      __showToast(`${subgoal.name} rejected - no action will run`); haptic(9);
      return;
    }
    if (restoreButton) {
      const subgoal = goal.subgoals[Number(restoreButton.dataset.gameSubgoalRestore)];
      if (!subgoal) return;
      subgoal.rejected = false;
      subgoal.confirmed = true;
      subgoal.state = 'Active';
      goal.updated = 'Updated now';
      persistCustomGoals(); persistGoalPlanOverrides(); renderGoalCommandCenter(goal); renderGoalCollection();
      __showToast(`${subgoal.name} restored to your plan`); haptic(10);
      return;
    }
    if (editButton) {
      const index = Number(editButton.dataset.gameSubgoalEdit);
      goalPlanTaskEditor = null;
      goalPlanSubgoalEditor = index;
      renderGoalGameBoard(goal);
      window.setTimeout(() => goalGameContent.querySelector('[name="subgoalName"]')?.select(), 30);
      return;
    }
    if (deleteButton) {
      const index = Number(deleteButton.dataset.gameSubgoalDelete);
      const subgoal = goal.subgoals[index];
      if (!subgoal) return;
      if (goal.subgoals.length === 1) { __showToast('Keep at least one subgoal'); return; }
      if (deleteButton.dataset.confirmDelete !== 'true') {
        deleteButton.dataset.confirmDelete = 'true';
        deleteButton.textContent = 'Confirm';
        window.setTimeout(() => {
          if (!deleteButton.isConnected) return;
          deleteButton.dataset.confirmDelete = 'false';
          deleteButton.textContent = 'Delete';
        }, 2400);
        return;
      }
      goal.subgoals.splice(index, 1);
      goal.updated = 'Updated now';
      syncGoalTaskStats(goal);
      persistCustomGoals(); persistGoalPlanOverrides(); renderGoalCommandCenter(goal); renderGoalCollection();
      __showToast(`${subgoal.name} deleted`); haptic(10);
      return;
    }
    if (suggestionButton) {
      const suggestion = goal.suggestions?.[Number(suggestionButton.dataset.suggestionIndex)];
      if (!suggestion || suggestion.decision) return;
      if (suggestionButton.dataset.gameSuggestion === 'confirm') {
        confirmGoalSuggestion(goal, suggestion);
      } else {
        suggestion.decision = 'rejected';
        persistCustomGoals(); renderGoalCommandCenter(goal); renderGoalCollection();
        __showToast('Suggestion skipped - no action taken'); haptic(8);
      }
    }
  });
  goalGameContent?.addEventListener('submit', (event) => {
    const suggestionForm = event.target.closest('[data-goal-suggestion-schedule]');
    if (suggestionForm) {
      event.preventDefault();
      const goal = goalProfiles[state.currentGoalIndex];
      const suggestion = goal?.suggestions?.[Number(suggestionForm.dataset.suggestionIndex)];
      if (!goal || !suggestion) return;
      const data = new FormData(suggestionForm);
      suggestion.scheduledAt = `${data.get('suggestionDate')}T${data.get('suggestionTime')}`;
      suggestion.approvalConfirmed = true;
      goalPlanIntelDetail = null;
      persistCustomGoals(); persistGoalPlanOverrides(); renderGoalGameBoard(goal);
      __showToast('Suggestion timing saved'); haptic(8);
      return;
    }
    const subgoalForm = event.target.closest('[data-goal-subgoal-form]');
    if (subgoalForm) {
      event.preventDefault();
      const goal = goalProfiles[state.currentGoalIndex];
      const name = String(new FormData(subgoalForm).get('subgoalName') || '').trim();
      if (!goal || !name) return;
      const index = Number(subgoalForm.dataset.subgoalIndex);
      if (index >= 0 && goal.subgoals[index]) {
        goal.subgoals[index].name = name;
      } else {
        goal.subgoals.push({ id: `subgoal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, done: 0, total: 0, state: 'Active', origin: 'user', confirmed: true, rejected: false, executionTasks: [], aiSeeded: true });
      }
      goalPlanSubgoalEditor = null;
      commitGoalPlanChange(goal, index >= 0 ? 'Subgoal updated' : 'Your subgoal was added');
      haptic(10);
      return;
    }
    const form = event.target.closest('[data-goal-task-form]');
    if (!form) return;
    event.preventDefault();
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;
    const data = new FormData(form);
    const name = String(data.get('taskName') || '').trim();
    const owner = data.get('taskOwner') === 'ai' ? 'ai' : 'human';
    const targetSubgoalIndex = Number(data.get('subgoalIndex'));
    const date = String(data.get('taskDate') || '');
    const time = String(data.get('taskTime') || '');
    const endTime = String(data.get('taskEndTime') || shiftGoalTime(time, 45));
    if (!name || !date || !time || !goal.subgoals[targetSubgoalIndex]) return;

    const originalSubgoalIndex = Number(form.dataset.editSubgoal);
    const originalTaskIndex = Number(form.dataset.editTask);
    const originalTask = originalTaskIndex >= 0
      ? goal.subgoals[originalSubgoalIndex]?.executionTasks?.[originalTaskIndex]
      : null;
    const task = originalTask || { id: `goal-task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    task.name = name;
    task.owner = owner;
    if (owner === 'ai') {
      task.done = task.aiState === 'prepared';
      task.aiState = task.aiState || 'queued';
      task.state = task.aiState === 'running' ? 'Working' : task.aiState === 'prepared' ? 'Completed' : 'Queued';
      task.startsAt = `${date}T${time}`;
      task.expectedAt = `${date}T${endTime || shiftGoalTime(time, 45)}`;
      delete task.dueAt;
    } else {
      task.done = Boolean(task.done && originalTask?.owner === 'human');
      task.state = task.done ? 'Completed' : 'Ready now';
      task.dueAt = `${date}T${time}`;
      delete task.startsAt;
      delete task.expectedAt;
      delete task.aiState;
    }
    if (originalTask) {
      if (originalSubgoalIndex !== targetSubgoalIndex) {
        goal.subgoals[originalSubgoalIndex].executionTasks.splice(originalTaskIndex, 1);
        goal.subgoals[targetSubgoalIndex].executionTasks.push(task);
      }
    } else {
      goal.subgoals[targetSubgoalIndex].executionTasks.push(task);
    }
    goalPlanTaskOwner = owner;
    goalPlanTaskEditor = null;
    goalPlanFocusedTaskId = task.id;
    commitGoalPlanChange(goal, originalTask ? 'Task updated everywhere' : 'Task added to Goal and Calendar');
    haptic(10);
  });
  goalGameContent?.addEventListener('change', (event) => {
    const ownerInput = event.target.closest('[data-goal-task-form] input[name="taskOwner"]');
    if (!ownerInput) return;
    const form = ownerInput.closest('[data-goal-task-form]');
    const isAi = ownerInput.value === 'ai';
    form.querySelector('.task-ai-finish')?.classList.toggle('visible', isAi);
    const timeLabel = form.querySelector('input[name="taskTime"]')?.closest('label')?.querySelector('span');
    if (timeLabel) timeLabel.textContent = isAi ? 'START' : 'DUE';
  });
  goalGameContent?.addEventListener('input', (event) => {
    if (!event.target.matches('[data-goal-plan-search]')) return;
    const query = event.target.value.trim().toLowerCase();
    goalGameContent.querySelectorAll('[data-goal-search-value]').forEach(item => {
      item.hidden = query && !item.dataset.goalSearchValue.includes(query);
    });
  });
  goalGameContent?.addEventListener('keydown', (event) => {
    const observationNode = event.target.closest('[data-goal-observation-index]');
    if (!observationNode || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;
    goalPlanIntelDetail = { type: 'observation', index: Number(observationNode.dataset.goalObservationIndex) };
    renderGoalGameBoard(goal);
  });
  goalResultDrawerContent.addEventListener('click', (event) => {
    if (goalResultDrawer.dataset.view !== 'plan') return;
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;
    const addButton = event.target.closest('[data-subgoal-add]');
    if (addButton) {
      const addForm = goalResultDrawerContent.querySelector('[data-subgoal-add-form]');
      addForm?.classList.add('is-open');
      addButton.setAttribute('aria-expanded', 'true');
      window.setTimeout(() => addForm?.querySelector('input')?.focus(), 40);
      haptic(5);
      return;
    }
    const addCancelButton = event.target.closest('[data-subgoal-add-cancel]');
    if (addCancelButton) {
      const addForm = addCancelButton.closest('[data-subgoal-add-form]');
      addForm?.reset();
      addForm?.classList.remove('is-open');
      goalResultDrawerContent.querySelector('[data-subgoal-add]')?.setAttribute('aria-expanded', 'false');
      haptic(4);
      return;
    }
    const confirmButton = event.target.closest('[data-subgoal-confirm]');
    if (confirmButton) {
      const subgoalIndex = Number(confirmButton.dataset.subgoalConfirm);
      const subgoal = goal.subgoals[subgoalIndex];
      if (!subgoal) return;
      subgoal.confirmed = true;
      if (!subgoal.state || subgoal.state === 'Proposed') subgoal.state = 'Active';
      goal.updated = 'Updated now';
      persistCustomGoals();
      persistGoalPlanOverrides();
      renderGoalCommandCenter(goal);
      renderGoalCollection();
      renderGoalResultDrawer('plan');
      __showToast(`${subgoal.name} confirmed in your plan`);
      haptic(12);
      return;
    }
    const editButton = event.target.closest('[data-subgoal-edit]');
    if (editButton) {
      const card = editButton.closest('[data-subgoal-card]');
      goalResultDrawerContent.querySelectorAll('.subgoal-manager-card.is-editing').forEach(item => item.classList.remove('is-editing'));
      card?.classList.add('is-editing');
      const input = card?.querySelector('input');
      input?.focus();
      input?.select();
      haptic(5);
      return;
    }
    const cancelButton = event.target.closest('[data-subgoal-cancel]');
    if (cancelButton) {
      cancelButton.closest('[data-subgoal-card]')?.classList.remove('is-editing');
      haptic(4);
      return;
    }
    const removeButton = event.target.closest('[data-subgoal-remove]');
    if (!removeButton) return;
    const subgoalIndex = Number(removeButton.dataset.subgoalRemove);
    if (!goal.subgoals[subgoalIndex]) return;
    if (goal.subgoals.length === 1) {
      __showToast('A goal needs at least one subgoal. Edit this one instead.');
      haptic(7);
      return;
    }
    if (removeButton.dataset.confirmRemove !== 'true') {
      removeButton.dataset.confirmRemove = 'true';
      removeButton.classList.add('confirm-remove');
      removeButton.textContent = 'Confirm remove';
      window.setTimeout(() => {
        if (!removeButton.isConnected) return;
        removeButton.dataset.confirmRemove = 'false';
        removeButton.classList.remove('confirm-remove');
        removeButton.textContent = 'Remove';
      }, 2800);
      haptic(6);
      return;
    }
    const removedName = goal.subgoals[subgoalIndex].name;
    goal.subgoals.splice(subgoalIndex, 1);
    (goal.suggestions || []).forEach(suggestion => {
      suggestion.updates = Math.min(Number(suggestion.updates || 0), Math.max(0, goal.subgoals.length - 1));
    });
    syncGoalTaskStats(goal);
    goal.updated = 'Updated now';
    persistCustomGoals();
    persistGoalPlanOverrides();
    renderGoalCommandCenter(goal);
    renderGoalCollection();
    renderGoalResultDrawer('plan');
    __showToast(`${removedName} removed from the plan`);
    haptic(10);
  });
  goalResultDrawerContent.addEventListener('submit', (event) => {
    const addForm = event.target.closest('[data-subgoal-add-form]');
    if (addForm) {
      event.preventDefault();
      const goal = goalProfiles[state.currentGoalIndex];
      const input = addForm.querySelector('input[name="subgoalName"]');
      const newName = input?.value.trim().replace(/[<>]/g, '');
      if (!goal || !newName) {
        input?.focus();
        return;
      }
      if (goal.subgoals.some(subgoal => subgoal.name.toLowerCase() === newName.toLowerCase())) {
        __showToast('That subgoal is already in this plan');
        input?.focus();
        return;
      }
      goal.subgoals.push({
        name: newName,
        done: 0,
        total: 1,
        state: 'Ready',
        origin: 'user',
        confirmed: true,
        executionTasks: [{ name: `Advance ${newName}`, done: false, state: 'Ready now' }]
      });
      goal.taskLabels.push(`Advance ${newName}`);
      goal.updated = 'Updated now';
      syncGoalTaskStats(goal);
      persistCustomGoals();
      persistGoalPlanOverrides();
      renderGoalCommandCenter(goal);
      renderGoalCollection();
      renderGoalResultDrawer('plan');
      __showToast(`${newName} added as your subgoal`);
      haptic(12);
      return;
    }
    const form = event.target.closest('[data-subgoal-form]');
    if (!form) return;
    event.preventDefault();
    const goal = goalProfiles[state.currentGoalIndex];
    const subgoalIndex = Number(form.dataset.subgoalForm);
    const subgoal = goal?.subgoals[subgoalIndex];
    const updatedName = form.querySelector('input')?.value.trim();
    if (!subgoal || !updatedName) {
      form.querySelector('input')?.focus();
      return;
    }
    const previousName = subgoal.name;
    subgoal.name = updatedName.replace(/[<>]/g, '');
    subgoal.confirmed = true;
    goal.updated = 'Updated now';
    persistCustomGoals();
    persistGoalPlanOverrides();
    renderGoalCommandCenter(goal);
    renderGoalCollection();
    renderGoalResultDrawer('plan');
    __showToast(previousName === subgoal.name ? 'Subgoal kept unchanged' : 'Subgoal updated and confirmed');
    haptic(10);
  });
  goalDisclosureBar.addEventListener('click', (event) => {
    const detailButton = event.target.closest('[data-goal-detail]');
    if (!detailButton) return;
    renderGoalResultDrawer(detailButton.dataset.goalDetail);
    haptic(5);
  });
  goalResultStream.addEventListener('click', (event) => {
    if (event.target.closest('[data-empty-goal-add]')) { openGoalCreateSheet(); return; }
    const resultButton = event.target.closest('[data-result-detail]');
    if (!resultButton) return;
    renderGoalResultDrawer(resultButton.dataset.resultDetail);
    haptic(5);
  });
  goalLogicFlow?.addEventListener('click', (event) => {
    const detailButton = event.target.closest('[data-logic-detail]');
    if (detailButton) {
      renderGoalResultDrawer(detailButton.dataset.logicDetail);
      haptic(5);
      return;
    }
    if (event.target.closest('[data-logic-decision]')) {
      goalPrimaryActionPanel?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      goalPrimaryAction?.querySelector('.goal-primary-buttons .primary')?.focus({ preventScroll: true });
      haptic(5);
    }
  });
  goalPrimaryAction.addEventListener('click', (event) => {
    if (event.target.closest('[data-empty-goal-add]')) { openGoalCreateSheet(); return; }
    const action = event.target.closest('[data-result-action]');
    const option = event.target.closest('[data-result-option]');
    const actionCard = goalPrimaryAction.querySelector('.goal-result-action-card');
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal || !actionCard) return;
    const suggestionIndex = Number(actionCard.dataset.resultSuggestionIndex);
    const suggestion = Number.isInteger(suggestionIndex) ? goal.suggestions?.[suggestionIndex] : null;
    if (option && suggestion) {
      suggestion.selectedOption = option.dataset.resultOption;
      persistCustomGoals();
      renderGoalResultsSurface(goal);
      __showToast(`${suggestion.selectedOption} selected for review`);
      haptic(7);
      return;
    }
    if (!action) return;
    const actionType = action.dataset.resultAction;
    if (actionType === 'adjust') {
      const adjusting = actionCard.classList.toggle('is-adjusting');
      actionCard.classList.remove('is-explaining');
      actionCard.querySelector('[data-result-action="why"]')?.setAttribute('aria-expanded', 'false');
      action.setAttribute('aria-expanded', String(adjusting));
      haptic(5);
      return;
    }
    if (actionType === 'why') {
      const explaining = actionCard.classList.toggle('is-explaining');
      actionCard.classList.remove('is-adjusting');
      actionCard.querySelector('[data-result-action="adjust"]')?.setAttribute('aria-expanded', 'false');
      action.setAttribute('aria-expanded', String(explaining));
      haptic(5);
      return;
    }
    if (actionType === 'confirm' && suggestion) {
      confirmGoalSuggestion(goal, suggestion);
      return;
    }
    if (actionType === 'activity' || actionType === 'plan') {
      renderGoalResultDrawer(actionType);
      haptic(5);
    }
  });
  goalUseHintDismiss.addEventListener('click', () => { dismissGoalUseHint(); haptic(5); });
  goalMonitoringButton.addEventListener('click', () => {
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;
    const visible = goalMonitoringPopover.classList.toggle('visible');
    goalMonitoringPopover.setAttribute('aria-hidden', String(!visible));
    goalMonitoringButton.setAttribute('aria-expanded', String(visible));
    if (visible) renderGoalMonitoringPopover(goal);
    haptic(5);
  });
  goalMonitoringPopover.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-monitoring-action]');
    if (!actionButton) return;
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;
    if (actionButton.dataset.monitoringAction === 'toggle') {
      goal.monitoringPaused = !goal.monitoringPaused;
      if (goal.monitoringPaused) pausedMonitoringGoalTitles.add(goal.title);
      else pausedMonitoringGoalTitles.delete(goal.title);
      persistMonitoringPreferences();
      renderGoalCommandCenter(goal);
      renderGoalMonitoringPopover(goal);
      renderGoalCollection();
      persistCustomGoals();
      haptic(9);
      __showToast(goal.monitoringPaused ? 'AI monitoring paused for this goal' : 'AI monitoring resumed');
      return;
    }
    closeGoalMonitoringPopover();
    const whyButton = document.getElementById('predictionExplain');
    const evidence = document.getElementById('predictionEvidence');
    if (whyButton && evidence) {
      whyButton.setAttribute('aria-expanded', 'true');
      evidence.classList.add('visible');
      evidence.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      __showToast('Authorized goal sources opened');
    }
  });
  goalPlanMore.addEventListener('click', () => {
    const planPanel = goalPlanMore.closest('.goals-tier');
    const expanded = planPanel.classList.toggle('show-support');
    goalPlanMore.setAttribute('aria-expanded', String(expanded));
    goalPlanMore.textContent = expanded ? 'Hide details' : 'Details';
    if (expanded) goalSupportPanel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    haptic(5);
  });
  goalSearch.addEventListener('input', () => {
    state.goalSearch = goalSearch.value.trim();
    renderGoalCollection();
  });

  function navigateGoalBy(direction, options = {}) {
    const nextIndex = state.currentGoalIndex + direction;
    if (nextIndex < 0 || nextIndex >= goalProfiles.length) {
      haptic(4);
      __showToast(direction < 0 ? 'This is your first goal' : 'This is your last goal');
      return;
    }
    if (options.transition !== false) {
      goalPlanListOpen = false;
      goalPlanMoreOpen = false;
      goalPlanIntelDetail = null;
      goalPlanShareOpen = false;
      goalPlanTaskEditor = null;
      goalPlanSubgoalEditor = null;
      goalPlanTransitionDirection = direction;
      window.clearTimeout(goalPlanTransitionTimer);
      selectGoal(nextIndex, false);
      goalPlanTransitionTimer = window.setTimeout(finishGoalVisualTransition, reduceMotion ? 0 : 460);
      haptic(8);
      return;
    }
    goalCommandHero.classList.remove('swipe-left', 'swipe-right');
    void goalCommandHero.offsetWidth;
    goalCommandHero.classList.add(direction > 0 ? 'swipe-left' : 'swipe-right');
    selectGoal(nextIndex, false);
    window.setTimeout(() => goalCommandHero.classList.remove('swipe-left', 'swipe-right'), reduceMotion ? 0 : 360);
    haptic(8);
  }

  goalPreviousCue.addEventListener('click', () => navigateGoalBy(-1));
  goalNextCue.addEventListener('click', () => navigateGoalBy(1));
  goalFocusPrevious?.addEventListener('click', () => navigateGoalBy(-1));
  goalFocusNext?.addEventListener('click', () => navigateGoalBy(1));
  goalFocusPicker?.addEventListener('click', () => toggleGoalPicker());
  document.addEventListener('pointerdown', (event) => {
    if (goalLibrary?.classList.contains('picker-open') && !goalLibrary.contains(event.target)) closeGoalPicker();
  });
  let goalSwipeGesture = null;
  goalCommandHero.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest('button,input,a,[role="button"]')) return;
    goalSwipeGesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    goalCommandHero.setPointerCapture?.(event.pointerId);
  });
  goalCommandHero.addEventListener('pointerup', (event) => {
    if (!goalSwipeGesture || goalSwipeGesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - goalSwipeGesture.x;
    const deltaY = event.clientY - goalSwipeGesture.y;
    goalSwipeGesture = null;
    if (Math.abs(deltaX) >= 54 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) navigateGoalBy(deltaX < 0 ? 1 : -1);
  });
  goalCommandHero.addEventListener('pointercancel', () => { goalSwipeGesture = null; });

  goalNextAction.addEventListener('click', () => {
    if (!goalProfiles.length) { openGoalCreateSheet(); return; }
    const nextDecision = reasoningSuggestionList.querySelector('.suggestion-card:not(.is-confirmed):not(.is-rejected) [data-suggestion-decision="confirm"]');
    const nextTask = reasoningSubgoalList.querySelector('.execution-task:not(.done)');
    const target = nextDecision || nextTask;
    if (!target) { __showToast('All current goal actions are reviewed'); return; }
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => target.focus(), reduceMotion ? 0 : 360);
    haptic(7);
  });

  function updateConnectionPresentation() {
    const onlinePill = document.querySelector('.online-pill');
    onlinePill?.classList.toggle('is-offline', !navigator.onLine);
    const label = onlinePill?.querySelector('span');
    if (label) label.textContent = navigator.onLine ? 'Online' : 'Offline';
    const goal = goalProfiles[state.currentGoalIndex];
    if (goal && state.goalWorkspaceActive) renderGoalHardwareState(goal);
  }
  window.addEventListener('online', updateConnectionPresentation);
  window.addEventListener('offline', updateConnectionPresentation);
  updateConnectionPresentation();
  goalSupportTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-goal-support]');
    if (!button) return;
    state.goalSupportView = button.dataset.goalSupport;
    goalSupportTabs.querySelectorAll('[data-goal-support]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    renderGoalSupport(goalProfiles[state.currentGoalIndex]);
    haptic(5);
  });
  goalSupportPanel.addEventListener('click', (event) => {
    const collaborationButton = event.target.closest('[data-support-collaboration]');
    if (!collaborationButton) return;
    openCommandCollaboration(goalProfiles[state.currentGoalIndex], Number(collaborationButton.dataset.supportCollaboration));
    haptic(7);
  });
  goalProposalInbox.addEventListener('click', (event) => {
    if (event.target.closest('[data-empty-goal-add]')) { openGoalCreateSheet(); return; }
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;
    ensureGoalCommandModel(goal);
    const generateButton = event.target.closest('[data-generate-subgoals]');
    if (generateButton) {
      generateButton.disabled = true;
      generateButton.textContent = 'AI preparing...';
      generateButton.setAttribute('aria-busy', 'true');
      window.setTimeout(() => {
        const candidates = subgoalDraftsByCategory[goal.category] || subgoalDraftsByCategory.Project;
        goal.draftSubgoals = candidates.filter(name => !goal.subgoals.some(subgoal => subgoal.name === name)).slice(0, 2).map(name => ({ name }));
        renderGoalProposalInbox(goal);
        haptic(9);
        __showToast('AI subgoal proposals are ready for your review');
      }, reduceMotion ? 0 : 520);
      return;
    }
    const proposal = event.target.closest('[data-proposal-index]');
    const actionButton = event.target.closest('[data-proposal-action]');
    if (!proposal || !actionButton) return;
    const proposalIndex = Number(proposal.dataset.proposalIndex);
    const draft = goal.draftSubgoals[proposalIndex];
    if (!draft) return;
    const action = actionButton.dataset.proposalAction;
    if (action === 'adjust') {
      if (proposal.querySelector('.proposal-edit-input')) return;
      const input = document.createElement('input');
      input.className = 'proposal-edit-input';
      input.value = draft.name;
      input.setAttribute('aria-label', 'Adjust proposed direct subgoal');
      proposal.querySelector('h4').after(input);
      actionButton.textContent = 'Save';
      actionButton.dataset.proposalAction = 'save';
      input.focus();
      return;
    }
    if (action === 'save') {
      const input = proposal.querySelector('.proposal-edit-input');
      const updatedName = input?.value.trim();
      if (!updatedName) { input?.focus(); return; }
      draft.name = updatedName;
      renderGoalProposalInbox(goal);
      __showToast('AI proposal adjusted for review');
      return;
    }
    if (action === 'confirm') {
      goal.subgoals.push({ name: draft.name, done: 0, total: 2, state: 'Active', origin: 'ai', confirmed: true, executionTasks: [{ name: `Clarify success for ${draft.name}`, done: false, state: 'Ready now' }, { name: `Advance ${draft.name}`, done: false, state: 'Queued' }] });
      goal.taskLabels.push(`Advance ${draft.name}`);
      goal.draftSubgoals.splice(proposalIndex, 1);
      syncGoalTaskStats(goal);
      renderGoalCommandCenter(goal);
      renderGoalCollection();
      persistCustomGoals();
      haptic(12);
      __showToast('Direct subgoal confirmed and added to the plan');
      return;
    }
    goal.draftSubgoals.splice(proposalIndex, 1);
    renderGoalProposalInbox(goal);
    persistCustomGoals();
    haptic(6);
    __showToast('AI proposal rejected - confirmed plan unchanged');
  });
  document.querySelectorAll('[data-goal-filter]').forEach(button => button.addEventListener('click', () => {
    state.goalFilter = button.dataset.goalFilter;
    document.querySelectorAll('[data-goal-filter]').forEach(item => item.classList.toggle('active', item === button));
    renderGoalCollection();
    haptic(5);
  }));
  reasoningSubgoalList.addEventListener('click', (event) => {
    const simpleSubgoalButton = event.target.closest('[data-simple-subgoal]');
    if (simpleSubgoalButton) {
      const goal = goalProfiles[state.currentGoalIndex];
      if (!goal) return;
      ensureGoalCommandModel(goal);
      const subgoal = goal.subgoals[Number(simpleSubgoalButton.dataset.simpleSubgoal)];
      if (!subgoal) return;
      const markComplete = subgoal.done < subgoal.total;
      const previouslyComplete = subgoal.executionTasks.filter(task => task.done).length;
      subgoal.executionTasks.forEach(task => {
        task.done = markComplete;
        task.state = markComplete ? 'Completed' : 'Ready now';
      });
      const newlyComplete = subgoal.executionTasks.filter(task => task.done).length;
      goal.completedThisMonth = Math.max(0, Number(goal.completedThisMonth || 0) + newlyComplete - previouslyComplete);
      syncGoalTaskStats(goal);
      updateGoalCompletionSummary(goal);
      renderGoalCommandCenter(goal);
      renderGoalCollection();
      persistCustomGoals();
      haptic(10);
      __showToast(`${subgoal.name} ${markComplete ? 'completed' : 'reopened'}`);
      return;
    }
    const taskButton = event.target.closest('[data-task-toggle]');
    if (taskButton) {
      const goal = goalProfiles[state.currentGoalIndex];
      if (!goal) return;
      ensureGoalCommandModel(goal);
      const [subgoalIndex, taskIndex] = taskButton.dataset.taskToggle.split(':').map(Number);
      const subgoal = goal.subgoals[subgoalIndex];
      const task = subgoal?.executionTasks[taskIndex];
      if (!task) return;
      task.done = !task.done;
      task.state = task.done ? 'Completed' : 'Ready now';
      goal.completedThisMonth = Math.max(0, Number(goal.completedThisMonth || 0) + (task.done ? 1 : -1));
      syncGoalTaskStats(goal);
      updateGoalCompletionSummary(goal);
      renderGoalCommandCenter(goal);
      renderGoalCollection();
      persistCustomGoals();
      haptic(10);
      __showToast(`${task.name} ${task.done ? 'completed' : 'reopened'}`);
      return;
    }
    const expandButton = event.target.closest('[data-subgoal-expand]');
    if (expandButton) {
      const goal = goalProfiles[state.currentGoalIndex];
      const nextIndex = Number(expandButton.dataset.subgoalExpand);
      goal.openSubgoalIndex = goal.openSubgoalIndex === nextIndex ? -1 : nextIndex;
      renderGoalCommandCenter(goal);
      haptic(5);
      return;
    }
    return;
    const button = event.target.closest('[data-reasoning-subgoal]');
    if (!button) return;
    const goal = goalProfiles[state.currentGoalIndex];
    const subgoal = goal?.subgoals[Number(button.dataset.reasoningSubgoal)];
    if (!subgoal) return;
    const completed = subgoal.done >= subgoal.total;
    subgoal.done = completed ? 0 : subgoal.total;
    subgoal.state = completed ? 'Needs action' : 'Completed';
    button.classList.toggle('done', !completed);
    button.classList.add('just-completed');
    button.setAttribute('aria-pressed', String(!completed));
    button.querySelector('small').textContent = completed ? `0/${subgoal.total} steps · Needs action` : 'Completed';
    button.querySelector('em').textContent = completed ? '0%' : 'READY';
    window.setTimeout(() => button.classList.remove('just-completed'), 650);
    updateGoalCompletionSummary(goal);
    persistCustomGoals();
    haptic(10);
    __showToast(`${subgoal.name} ${completed ? 'reopened' : 'completed'}`);
  });
  reasoningObservationList.addEventListener('click', (event) => {
    const observationButton = event.target.closest('[data-observation-expand]');
    if (!observationButton) return;
    const willExpand = observationButton.getAttribute('aria-expanded') !== 'true';
    reasoningObservationList.querySelectorAll('[data-observation-expand]').forEach(button => {
      const expanded = button === observationButton && willExpand;
      button.classList.toggle('expanded', expanded);
      button.setAttribute('aria-expanded', String(expanded));
    });
    if (willExpand) triggerReasoningUpdate('Tracing this observation');
    haptic(5);
  });
  reasoningPredictionContent.addEventListener('click', (event) => {
    const summary = event.target.closest('[data-prediction-toggle]');
    if (summary) {
      const expanded = summary.getAttribute('aria-expanded') === 'true';
      summary.setAttribute('aria-expanded', String(!expanded));
      summary.classList.toggle('expanded', !expanded);
      haptic(5);
      return;
    }
    const button = event.target.closest('#predictionExplain');
    if (!button) return;
    const evidence = document.getElementById('predictionEvidence');
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    evidence.classList.toggle('visible', !expanded);
    haptic(6);
  });
  reasoningPredictionContent.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-prediction-toggle]')) {
      event.preventDefault();
      event.target.click();
    }
  });
  reasoningSuggestionList.addEventListener('click', (event) => {
    const moreButton = event.target.closest('[data-toggle-suggestions]');
    if (moreButton) {
      const showingAll = reasoningSuggestionList.classList.toggle('show-all');
      const optionCount = Math.max(0, (goalProfiles[state.currentGoalIndex]?.suggestions?.length || 1) - 1);
      reasoningSuggestionList.querySelectorAll('.suggestion-card.is-adjusting').forEach(card => {
        card.classList.remove('is-adjusting');
        card.querySelector('[data-suggestion-decision="adjust"]')?.setAttribute('aria-expanded', 'false');
      });
      moreButton.setAttribute('aria-expanded', String(showingAll));
      moreButton.textContent = showingAll ? 'Show best option' : optionCount === 1 ? 'View alternative' : `${optionCount} alternatives`;
      moreButton.setAttribute('aria-label', showingAll ? 'Return to the best recommendation' : `View ${optionCount} alternative recommendation${optionCount === 1 ? '' : 's'}`);
      haptic(5);
      return;
    }
    const card = event.target.closest('.suggestion-card');
    if (!card) return;
    const goal = goalProfiles[state.currentGoalIndex];
    const suggestion = goal?.suggestions?.[Number(card.dataset.suggestionIndex)];
    const option = event.target.closest('[data-suggestion-option]');
    if (option) {
      card.classList.remove('is-adjusting');
      const adjustButton = card.querySelector('[data-suggestion-decision="adjust"]');
      const confirmButton = card.querySelector('[data-suggestion-decision="confirm"]');
      adjustButton.setAttribute('aria-expanded', 'false');
      confirmButton.textContent = `Confirm ${option.dataset.suggestionOption}`;
      if (suggestion) suggestion.selectedOption = option.dataset.suggestionOption;
      persistCustomGoals();
      __showToast(`${option.dataset.suggestionOption} selected for review`);
      haptic(7);
      return;
    }
    const decisionButton = event.target.closest('[data-suggestion-decision]');
    if (!decisionButton || card.classList.contains('is-confirmed') || card.classList.contains('is-rejected')) return;
    const decision = decisionButton.dataset.suggestionDecision;
    if (decision === 'adjust') {
      const adjusting = card.classList.toggle('is-adjusting');
      decisionButton.setAttribute('aria-expanded', String(adjusting));
      haptic(6);
      return;
    }
    const result = card.querySelector('.suggestion-result span');
    if (decision === 'confirm') {
      confirmGoalSuggestion(goal, suggestion);
      return;
    } else {
      card.classList.remove('is-adjusting');
      card.classList.add('is-rejected');
      if (suggestion) suggestion.decision = 'rejected';
      result.textContent = 'Suggestion rejected · no action taken';
      card.querySelectorAll('.suggestion-actions button,.suggestion-adjuster button').forEach(button => { button.disabled = true; });
      haptic(8);
      __showToast('Suggestion rejected — nothing was executed');
    }
    persistCustomGoals();
    renderGoalCommandCenter(goal);
    renderGoalCollection();
    triggerReasoningUpdate('Prediction recalculated');
    const unresolved = reasoningSuggestionList.querySelectorAll('.suggestion-card:not(.is-confirmed):not(.is-rejected)').length;
    suggestionCount.textContent = unresolved > 1 ? `1 best + ${unresolved - 1} more` : unresolved === 1 ? 'Ready' : 'Reviewed';
  });
  document.getElementById('settingsButton').addEventListener('click', () => __showToast('System settings ready'));
  document.getElementById('goalCreateClose').addEventListener('click', closeGoalCreateSheet);
  document.getElementById('goalCreateCancel').addEventListener('click', closeGoalCreateSheet);
  newGoalDateInput.addEventListener('change', () => {
    const hasDate = Boolean(newGoalDateInput.value);
    newGoalTimeInput.disabled = !hasDate;
    if (!hasDate) newGoalTimeInput.value = '';
    haptic(4);
  });
  goalCreateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const outcomeInput = document.getElementById('newGoalOutcome');
    const outcome = outcomeInput.value.trim().replace(/[<>"']/g, '');
    if (!outcome) { outcomeInput.focus(); return; }
    const scheduledDate = newGoalDateInput.value;
    const scheduledTime = scheduledDate ? newGoalTimeInput.value : '';
    const situation = document.getElementById('newGoalSituation').value.trim().replace(/[<>]/g, '');
    const constraints = document.getElementById('newGoalConstraints').value.trim().replace(/[<>]/g, '');
    if (goalFormMode === 'edit') {
      const goal = goalProfiles[editingGoalIndex];
      if (!goal) { closeGoalCreateSheet(); return; }
      goal.title = outcome;
      goal.short = outcome.slice(0, 24);
      goal.outcome = outcome;
      goal.description = situation || goal.description;
      goal.currentSituation = situation || goal.currentSituation;
      goal.constraints = constraints || goal.constraints;
      goal.scheduledDate = scheduledDate;
      goal.scheduledTime = scheduledTime;
      goal.calendarLinked = Boolean(scheduledDate);
      delete goal.scheduleOffset;
      goal.updated = 'Updated now';
      persistCustomGoals();
      renderCalendar('left', false);
      closeGoalCreateSheet();
      selectGoal(editingGoalIndex, false);
      haptic(10);
      __showToast(scheduledDate ? `Goal updated for ${formatGoalSchedule(scheduledDate, scheduledTime)}` : 'Goal changes saved');
      goalFormMode = 'create';
      editingGoalIndex = -1;
      return;
    }
    if (!state.goalProposalReady) {
      state.goalProposalReady = true;
      const previewProfile = buildAdaptiveGoalProfile(
        outcome,
        situation,
        constraints
      );
      goalProposalPreview.innerHTML = '<i></i><span><strong>AI proposal · Awaiting your confirmation</strong><small>01 Clarify success criteria · 02 Build the first milestone · 03 Review progress weekly</small></span>';
      const scheduleSummary = formatGoalSchedule(scheduledDate, scheduledTime);
      goalProposalPreview.innerHTML = `<i></i><span><strong>${escapeGoalText(previewProfile.category)} goal proposal · Awaiting your confirmation</strong><small>${previewProfile.subgoals.map((subgoal, index) => `0${index + 1} ${escapeGoalText(subgoal.name)}`).join(' · ')}${scheduleSummary ? ` · Calendar: ${escapeGoalText(scheduleSummary)}` : ''}</small></span>`;
      goalProposeButton.textContent = 'Confirm goal & direct subgoals';
      __showToast('AI proposal ready — review before confirming');
      return;
    }
    const adaptiveProfile = buildAdaptiveGoalProfile(outcome, situation, constraints);
    adaptiveProfile.scheduledDate = scheduledDate;
    adaptiveProfile.scheduledTime = scheduledTime;
    adaptiveProfile.calendarLinked = Boolean(scheduledDate);
    goalProfiles.push(adaptiveProfile);
    persistCustomGoals();
    if (scheduledDate) renderCalendar('left', false);
    closeGoalCreateSheet();
    selectGoal(goalProfiles.length - 1, false);
    __showToast(scheduledDate ? `Goal scheduled for ${formatGoalSchedule(scheduledDate, scheduledTime)}` : 'Goal created from your confirmed proposal');
  });
  collaborationClose.addEventListener('click', closeCollaborationSheet);
  collaborationCancel.addEventListener('click', closeCollaborationSheet);
  collaborationConfirm.addEventListener('click', () => {
    collaborationConfirm.classList.add('is-loading');
    collaborationConfirm.setAttribute('aria-busy', 'true');
    window.setTimeout(() => {
      collaborationConfirm.classList.remove('is-loading');
      collaborationConfirm.removeAttribute('aria-busy');
      if (collaborationSheet.dataset.mode === 'candidate') {
        closeCollaborationSheet();
        __showToast('Interest recorded — identity stays private until the match is mutual');
        return;
      }
      const profile = goalProfiles[state.currentGoalIndex];
      const subgoal = profile?.subgoals.find(item => item.name === collaborationSheet.dataset.subgoal);
      if (subgoal) subgoal.collaborationEnabled = true;
      closeCollaborationSheet();
      if (profile) {
        renderGoalInspector(profile);
        renderGoalCommandCenter(profile);
        persistCustomGoals();
      }
      __showToast('Private collaboration matching enabled');
    }, 680);
  });
  document.querySelectorAll('[data-source-filter]').forEach(button => button.addEventListener('click', () => {
    state.sourceFilter = button.dataset.sourceFilter;
    document.querySelectorAll('[data-source-filter]').forEach(item => item.classList.toggle('active', item === button));
    renderSourceGrid();
  }));
  addSourceButton.addEventListener('click', openConnectionWizard);
  addAdapterButton?.addEventListener('click', openConnectionWizard);
  sourceInspectorClose?.addEventListener('click', () => closeSourceInspector());
  sourceInspectorBackdrop?.addEventListener('click', () => closeSourceInspector());
  connectionWizardClose.addEventListener('click', closeConnectionWizard);
  wizardCancel.addEventListener('click', closeConnectionWizard);
  connectionWizard.querySelectorAll('[data-wizard-source]').forEach(button => button.addEventListener('click', () => {
    connectionWizard.querySelectorAll('[data-wizard-source]').forEach(item => item.classList.toggle('active', item === button));
    const source = button.dataset.wizardSource;
    const guidance = {
      Device: 'Only the selected device categories will be read through an encrypted local bridge.',
      Files: 'You choose every file or folder. Weeple cannot browse outside that selection.',
      Account: 'The official authorization screen will show the exact read scopes requested.',
      Identity: 'Public account candidates are presented for review before they can enter AI context.',
      Extension: 'The plugin manifest and every available capability will be visible before activation.',
      Relay: 'The relay runs only in the user-authorized environment and exposes the selected application data.'
    };
    wizardPermissionPreview.innerHTML = `<i></i><span><strong>${source} permission preview</strong><small>${guidance[source]}</small></span>`;
    wizardContinue.disabled = false;
  }));
  wizardContinue.addEventListener('click', () => { closeConnectionWizard(); __showToast('Permission review opened — nothing connected yet'); });

  document.getElementById('memoryOpenButton').addEventListener('click', openMemoryDrawer);
  document.getElementById('memoryEntry').addEventListener('click', openMemoryDrawer);
  document.getElementById('memoryClose').addEventListener('click', closeMemoryDrawer);
  document.getElementById('voiceMemoryEdit').addEventListener('click', openMemoryProposal);
  document.getElementById('memoryProposalCancel').addEventListener('click', closeMemoryProposal);
  document.getElementById('memoryProposalConfirm').addEventListener('click', () => {
    const preference = memories.find(memory => memory.id === 2);
    if (preference) preference.detail = 'Best focus time is 8:30–11:00 on weekdays.';
    closeMemoryProposal(); renderMemories(); __showToast('Memory corrected with your confirmation');
  });
  document.querySelectorAll('[data-memory-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-memory-filter]').forEach(item => item.classList.toggle('active', item === button)); renderMemories(button.dataset.memoryFilter);
  }));
  missionDetailClose?.addEventListener('click', () => closeUseResultReport(true));
  useReportDrawerScrim?.addEventListener('click', () => closeUseResultReport(true));
  useResultReportDownload?.addEventListener('click', downloadUseResultPdf);
  missionDetailDrawer?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeUseResultReport(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...missionDetailDrawer.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.querySelectorAll('[data-use-prompt]').forEach(button => button.addEventListener('click', () => {
    assistantInput.value = button.dataset.usePrompt; assistantInput.focus();
  }));
  assistantComposer.addEventListener('submit', event => {
    event.preventDefault(); const prompt = assistantInput.value.trim(); if (!prompt) return; assistantInput.value = ''; appendAssistantExchange(prompt);
  });
  document.getElementById('assistantAttach').addEventListener('click', () => __showToast('Choose authorized context — no source is added automatically'));
  document.getElementById('assistantVoice').addEventListener('click', () => { if (!state.voiceActive) startVoiceVisualization(); else stopVoiceVisualization(); });
  document.querySelectorAll('[data-decision]').forEach(button => button.addEventListener('click', () => {
    const decision = button.dataset.decision;
    const messages = { accept: 'Action confirmed — protected block and draft created', adjust: 'Recommendation opened for adjustment', reject: 'Recommendation rejected — no action taken' };
    button.closest('.decision-request').classList.add(`decision-${decision}`); __showToast(messages[decision]);
  }));
  document.querySelectorAll('.context-section button').forEach(button => button.addEventListener('click', () => __showToast(`${button.textContent.trim()} details opened`)));

  setupButton.addEventListener('click', openOnboarding);
  document.getElementById('onboardingClose').addEventListener('click', closeOnboarding);
  onboardingBack.addEventListener('click', () => { if (state.onboardingStep > 0) { state.onboardingStep -= 1; renderOnboarding(); } });
  onboardingNext.addEventListener('click', () => {
    if (state.onboardingStep < 3) { state.onboardingStep += 1; renderOnboarding(); }
    else { closeOnboarding(); __showToast('First-value setup saved — connect real data when ready'); }
  });

  const commandPanel = document.getElementById('commandPanel');
  const commandInput = document.getElementById('commandInput');
  const searchButton = document.getElementById('searchButton');
  const noticeButton = document.getElementById('noticeButton');
  const notificationPanel = document.getElementById('notificationPanel');
  const voiceButton = document.getElementById('voiceButton');
  const activityExpand = document.getElementById('activityExpand');
  const activityItems = [...document.querySelectorAll('.activity-item[data-activity-action]')];
  const deviceClock = document.querySelector('.device-clock');
  const deviceTime = document.getElementById('deviceTime');
  const deviceDate = document.getElementById('deviceDate');

  const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
  const dateFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  function updateDeviceClock() {
    const now = new Date();
    const time = timeFormatter.format(now);
    const date = dateFormatter.format(now);
    deviceTime.textContent = time;
    deviceDate.textContent = date;
    deviceClock.setAttribute('aria-label', `${time}, ${date}`);
  }
  updateDeviceClock();
  window.setInterval(updateDeviceClock, 1000);

  const weatherChip = document.getElementById('weatherChip');
  const weatherTemperature = document.getElementById('weatherTemperature');
  const weatherCondition = document.getElementById('weatherCondition');
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherIcons = {
    clear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19m0-14-1.5 1.5m-11 11L5 19"/></svg>',
    cloud: '<svg viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 9 4.5 4.5 0 0 0 7 18Z"/></svg>',
    rain: '<svg viewBox="0 0 24 24"><path d="M7 15h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 6 4.5 4.5 0 0 0 7 15Z"/><path d="m8 18-1 2m5-2-1 2m5-2-1 2"/></svg>',
    snow: '<svg viewBox="0 0 24 24"><path d="M12 3v18M5 7l14 10M19 7 5 17M8.5 5 12 7l3.5-2M8.5 19l3.5-2 3.5 2"/></svg>',
    storm: '<svg viewBox="0 0 24 24"><path d="M7 14h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 5 4.5 4.5 0 0 0 7 14Z"/><path d="m13 14-3 5h3l-1 3 4-6h-3"/></svg>',
    fog: '<svg viewBox="0 0 24 24"><path d="M5 8h14M3 12h15M6 16h15"/></svg>'
  };

  function weatherDescription(code) {
    if (code === 0) return { label: 'Clear', icon: 'clear' };
    if (code <= 3) return { label: 'Cloudy', icon: 'cloud' };
    if (code <= 48) return { label: 'Fog', icon: 'fog' };
    if (code <= 67 || (code >= 80 && code <= 82)) return { label: 'Rain', icon: 'rain' };
    if (code <= 77 || code === 85 || code === 86) return { label: 'Snow', icon: 'snow' };
    return { label: 'Storm', icon: 'storm' };
  }

  async function loadWeather(latitude = 31.2304, longitude = 121.4737) {
    weatherCondition.textContent = 'Updating';
    try {
      const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&current=temperature_2m,weather_code&timezone=auto`;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 4500);
      const response = await fetch(endpoint, { signal: controller.signal });
      window.clearTimeout(timeout);
      if (!response.ok) throw new Error('Weather service unavailable');
      const weather = await response.json();
      const description = weatherDescription(weather.current.weather_code);
      weatherTemperature.textContent = `${Math.round(weather.current.temperature_2m)}°`;
      weatherCondition.textContent = description.label;
      weatherIcon.innerHTML = weatherIcons[description.icon];
      weatherChip.setAttribute('aria-label', `${Math.round(weather.current.temperature_2m)} degrees, ${description.label}`);
    } catch (error) {
      weatherTemperature.textContent = '28°';
      weatherCondition.textContent = 'Clear';
      weatherIcon.innerHTML = weatherIcons.clear;
      weatherChip.setAttribute('aria-label', 'Weather unavailable; showing device fallback');
    }
  }

  weatherChip.addEventListener('click', () => {
    if (!navigator.geolocation) { loadWeather(); return; }
    weatherCondition.textContent = 'Locating';
    navigator.geolocation.getCurrentPosition(
      position => loadWeather(position.coords.latitude, position.coords.longitude),
      () => loadWeather(),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 900000 }
    );
  });
  loadWeather();

  const calendarMonth = document.getElementById('calendarMonth');
  const calendarStage = document.getElementById('calendarStage');
  const calendarToday = document.getElementById('calendarToday');
  const calendarPrevious = document.getElementById('calendarPrevious');
  const calendarNext = document.getElementById('calendarNext');
  const calendarAddTask = document.getElementById('calendarAddTask');
  const calendarMonthButton = document.getElementById('calendarMonthButton');
  const monthPopover = document.getElementById('monthPopover');
  const monthPickerTitle = document.getElementById('monthPickerTitle');
  const monthPickerPrevious = document.getElementById('monthPickerPrevious');
  const monthPickerNext = document.getElementById('monthPickerNext');
  const monthPickerToday = document.getElementById('monthPickerToday');
  const monthDays = document.getElementById('monthDays');
  const calendarTaskModal = document.getElementById('calendarTaskModal');
  const calendarTaskBackdrop = document.getElementById('calendarTaskBackdrop');
  const calendarTaskClose = document.getElementById('calendarTaskClose');
  const calendarTaskCancel = document.getElementById('calendarTaskCancel');
  const calendarTaskForm = document.getElementById('calendarTaskForm');
  const calendarTaskName = document.getElementById('calendarTaskName');
  const calendarTaskDate = document.getElementById('calendarTaskDate');
  const calendarTaskTime = document.getElementById('calendarTaskTime');
  const calendarTaskGoal = document.getElementById('calendarTaskGoal');
  const calendarTaskSubgoal = document.getElementById('calendarTaskSubgoal');
  const calendarTaskTimeLabel = document.getElementById('calendarTaskTimeLabel');
  const calendarTaskEndField = document.getElementById('calendarTaskEndField');
  const calendarTaskEndTime = document.getElementById('calendarTaskEndTime');
  const calendarReferenceDate = new Date();
  calendarReferenceDate.setHours(12, 0, 0, 0);
  let selectedCalendarDate = new Date(calendarReferenceDate);
  let monthPickerCursor = new Date(calendarReferenceDate.getFullYear(), calendarReferenceDate.getMonth(), 1, 12);
  let calendarPointerStart = null;
  let calendarSuppressClick = false;
  let calendarTransitioning = false;
  let calendarUserTasks = [];
  try {
    const storedCalendarTasks = JSON.parse(localStorage.getItem('weeple-calendar-tasks') || '[]');
    if (Array.isArray(storedCalendarTasks)) calendarUserTasks = storedCalendarTasks;
  } catch (error) {
    // Local persistence is optional; the task still works for this session.
  }

  const calendarAgendaSets = [
    [
      { type: 'complete', label: 'AI COMPLETED', title: 'Morning priorities prepared', detail: 'Your goal plan has been organized', status: 'Ready', icon: 'check' },
      { type: 'action', label: 'NEEDS YOUR ACTION', title: 'Client Meeting · 14:00', detail: 'Agenda and documents are ready', status: 'Confirm', icon: 'alert' },
      { type: 'planning', label: 'AI PLANNING', title: '19:30 Project Review', detail: 'Review this week’s goal progress', status: 'Planned', icon: 'spark' }
    ],
    [
      { type: 'complete', label: 'AI COMPLETED', title: 'Fitness summary analyzed', detail: 'Recovery insights added to your goal', status: 'Done', icon: 'check' },
      { type: 'action', label: 'CALENDAR', title: 'Focus block · 10:30', detail: '90 minutes protected for deep work', status: 'Reserved', icon: 'clock' },
      { type: 'planning', label: 'AI SUGGESTION', title: 'Call family · 18:00', detail: 'Suggested from your weekly pattern', status: 'Review', icon: 'spark' }
    ],
    [
      { type: 'complete', label: 'MEMORY CONNECTED', title: 'Meeting context retrieved', detail: '6 relevant notes prepared', status: 'Ready', icon: 'check' },
      { type: 'action', label: 'UPCOMING', title: 'Product Sync · 15:30', detail: '3 decisions need your attention', status: 'Open', icon: 'alert' },
      { type: 'planning', label: 'AI PLANNING', title: 'Tomorrow’s top priority', detail: 'Execution plan is being prepared', status: 'Planning', icon: 'spark' }
    ]
  ];

  const calendarIcons = {
    check: '<path d="m7 12 3 3 7-7"/><circle cx="12" cy="12" r="8"/>',
    alert: '<path d="M12 7v6m0 4h.01"/><circle cx="12" cy="12" r="8"/>',
    spark: '<path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18m0-12-2.5 2.5m-7 7L6 18"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>'
  };

  const sideDayStories = [
    { label: 'AI COMPLETED', detail: 'Key decisions have been organized', badge: 'AI Running', icon: 'check' },
    { label: 'FOUND 3 INSIGHTS', detail: 'Useful patterns were discovered', badge: 'AI Discovery', icon: 'spark' },
    { label: 'AI IS PREPARING', detail: 'Materials are being assembled', badge: 'AI Planning', icon: 'clock' }
  ];
  const calendarCardColors = ['16,185,129', '139,92,246', '255,183,3'];

  function sameCalendarDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function addCalendarDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function calendarDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function calendarDateFromKey(key) {
    const [year, month, day] = String(key).split('-').map(Number);
    return new Date(year, month - 1, day, 12);
  }

  function calendarTasksForDate(date) {
    const key = calendarDateKey(date);
    return calendarUserTasks.filter(task => task.date === key);
  }

  function linkedGoalTasksForDate(date) {
    const key = calendarDateKey(date);
    const linked = [];
    goalProfiles.forEach((goal, goalIndex) => {
      ensureGoalCommandModel(goal);
      goal.subgoals.forEach((subgoal, subgoalIndex) => {
        if (subgoal.rejected) return;
        subgoal.executionTasks.forEach((task, taskIndex) => {
          const moment = goalPlanTaskMoment(task);
          if (!moment || String(moment).slice(0, 10) !== key) return;
          linked.push({ goal, goalIndex, subgoal, subgoalIndex, task, taskIndex });
        });
      });
    });
    return linked;
  }

  function calendarItemOwner(item) {
    if (item.owner === 'ai' || item.owner === 'human') return item.owner;
    return item.type === 'action' || item.type === 'goal' ? 'human' : 'ai';
  }

  function persistCalendarTasks() {
    try { localStorage.setItem('weeple-calendar-tasks', JSON.stringify(calendarUserTasks)); } catch (error) { /* storage is optional */ }
    try { if (__store) __store.emit('calendar:changed', { tasks: calendarUserTasks }); } catch (_e) { /* optional */ }
  }

  function openCalendarTaskModal() {
    calendarTaskForm.reset();
    calendarTaskDate.value = calendarDateKey(selectedCalendarDate);
    calendarTaskTime.value = '09:00';
    calendarTaskEndTime.value = '09:45';
    calendarTaskGoal.innerHTML = '<option value="">Standalone task</option>' + goalProfiles.map((goal, index) => `<option value="${index}">${escapeGoalText(goal.title)}</option>`).join('');
    calendarTaskSubgoal.innerHTML = '<option value="">Choose a goal first</option>';
    calendarTaskSubgoal.disabled = true;
    calendarTaskEndField.classList.remove('visible');
    calendarTaskTimeLabel.textContent = 'DUE TIME';
    calendarTaskEndTime.required = false;
    calendarTaskModal.classList.add('open');
    calendarTaskModal.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => calendarTaskName.focus(), 180);
  }

  function closeCalendarTaskModal() {
    calendarTaskModal.classList.remove('open');
    calendarTaskModal.setAttribute('aria-hidden', 'true');
  }

  function updateCalendarSubgoalOptions() {
    const goal = goalProfiles[Number(calendarTaskGoal.value)];
    if (!goal) {
      calendarTaskSubgoal.innerHTML = '<option value="">Choose a goal first</option>';
      calendarTaskSubgoal.disabled = true;
      return;
    }
    ensureGoalCommandModel(goal);
    calendarTaskSubgoal.disabled = false;
    calendarTaskSubgoal.innerHTML = goal.subgoals.map((subgoal, index) => `<option value="${index}">${escapeGoalText(subgoal.name)}</option>`).join('');
  }

  function scheduledGoalsForDate(date) {
    const dateKey = calendarDateKey(date);
    return goalProfiles.map((goal, index) => ({ goal, index })).filter(({ goal }) => {
      if (goal.scheduledDate) return goal.scheduledDate === dateKey;
      if (Number.isInteger(goal.scheduleOffset)) return sameCalendarDay(addCalendarDays(calendarReferenceDate, goal.scheduleOffset), date);
      return false;
    });
  }

  function relativeCalendarLabel(date) {
    const difference = Math.round((date - calendarReferenceDate) / 86400000);
    if (difference === 0) return 'Today';
    if (difference === 1) return 'Tomorrow';
    if (difference === -1) return 'Yesterday';
    return new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date);
  }

  function renderMonthPicker() {
    monthPickerTitle.textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(monthPickerCursor);
    monthDays.innerHTML = '';
    const monthStart = new Date(monthPickerCursor.getFullYear(), monthPickerCursor.getMonth(), 1, 12);
    const gridStart = addCalendarDays(monthStart, -monthStart.getDay());
    for (let index = 0; index < 42; index += 1) {
      const date = addCalendarDays(gridStart, index);
      const dayButton = document.createElement('button');
      dayButton.type = 'button';
      dayButton.className = `month-day${date.getMonth() !== monthPickerCursor.getMonth() ? ' outside' : ''}${sameCalendarDay(date, calendarReferenceDate) ? ' today' : ''}${sameCalendarDay(date, selectedCalendarDate) ? ' selected' : ''}`;
      dayButton.textContent = date.getDate();
      dayButton.setAttribute('aria-label', new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date));
      dayButton.addEventListener('click', () => {
        const direction = date >= selectedCalendarDate ? 'left' : 'right';
        selectedCalendarDate = new Date(date);
        monthPickerCursor = new Date(date.getFullYear(), date.getMonth(), 1, 12);
        monthPopover.classList.remove('open');
        calendarMonthButton.classList.remove('active');
        calendarMonthButton.setAttribute('aria-expanded', 'false');
        renderCalendar(direction);
      });
      monthDays.appendChild(dayButton);
    }
  }

  function toggleMonthPicker(force) {
    const open = typeof force === 'boolean' ? force : !monthPopover.classList.contains('open');
    if (open) {
      monthPickerCursor = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), 1, 12);
      renderMonthPicker();
    }
    monthPopover.classList.toggle('open', open);
    calendarMonthButton.classList.toggle('active', open);
    calendarMonthButton.setAttribute('aria-expanded', String(open));
  }

  function renderCalendar(direction = 'left', animate = true) {
    calendarMonth.textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(selectedCalendarDate);
    calendarStage.innerHTML = '';
    const selectedSchedule = scheduledGoalsForDate(selectedCalendarDate)[0];
    if (selectedSchedule && selectedSchedule.index !== state.currentGoalIndex) {
      state.currentGoalIndex = selectedSchedule.index;
      state.currentGoalProgress = selectedSchedule.goal.progress || 0;
      if (nodes.length) invalidateTopology();
    }
    for (let offset = -2; offset <= 2; offset += 1) {
      const date = addCalendarDays(selectedCalendarDate, offset);
      const isToday = sameCalendarDay(date, calendarReferenceDate);
      const isFuture = !isToday && date > calendarReferenceDate;
      const isPast = !isToday && date < calendarReferenceDate;
      const setIndex = sameCalendarDay(date, calendarReferenceDate)
        ? 0
        : Math.abs(date.getDate() + date.getMonth()) % calendarAgendaSets.length;
      const baseAgenda = calendarAgendaSets[setIndex];
      const backgroundAgenda = isFuture
        ? baseAgenda.map(item => ({ ...item, type: 'planning', label: 'AI IS PREPARING', status: 'Preparing', icon: 'clock' }))
        : baseAgenda;
      const scheduledGoals = scheduledGoalsForDate(date);
      const linkedTasks = linkedGoalTasksForDate(date).map(({ goal, goalIndex, subgoal, subgoalIndex, task, taskIndex }) => ({
        type: task.owner === 'ai' ? 'planning' : 'action',
        owner: task.owner,
        label: task.owner === 'ai' ? 'AI TASK' : 'YOUR TASK',
        title: escapeGoalText(task.name),
        detail: task.owner === 'ai'
          ? `${String(task.startsAt).slice(11, 16)}–${String(task.expectedAt).slice(11, 16)} · ${escapeGoalText(subgoal.name)}`
          : `${escapeGoalText(subgoal.name)} · ${task.done ? 'Completed' : 'To do'}`,
        status: task.owner === 'ai' ? task.aiState : task.done ? 'Done' : 'To do',
        icon: task.owner === 'ai' ? 'spark' : task.done ? 'check' : 'target',
        goalIndex, subgoalIndex, taskIndex, taskId: task.id,
        linkedTask: true,
        timelineTime: String(goalPlanTaskMoment(task)).slice(11, 16),
        rgb: task.owner === 'ai' ? '139,92,246' : '255,94,0'
      }));
      const addedTasks = calendarTasksForDate(date).map(task => ({
        type: task.owner === 'ai' ? 'planning' : 'action',
        owner: task.owner,
        label: task.owner === 'ai' ? 'AI TASK' : 'YOUR TASK',
        title: escapeGoalText(task.title),
        detail: task.owner === 'ai' ? 'Weeple will prepare this for you' : 'Added by you',
        status: task.owner === 'ai' ? 'Queued' : 'To do',
        icon: task.owner === 'ai' ? 'spark' : 'check',
        timelineTime: task.time,
        rgb: task.owner === 'ai' ? '139,92,246' : '255,94,0'
      }));
      const goalAgenda = scheduledGoals.map(({ goal, index }) => ({
        type: 'goal', owner: 'human', label: 'SCHEDULED GOAL', title: `${goal.scheduledTime ? `${goal.scheduledTime} · ` : ''}${goal.title}`,
        detail: 'Tap to open this goal and its current context', status: `${goal.progress}%`, icon: 'target', goalIndex: index,
        timelineTime: goal.scheduledTime || 'GOAL', rgb: goal.accent || '255,94,0'
      }));
      const agenda = [...linkedTasks, ...addedTasks, ...goalAgenda, ...backgroundAgenda].slice(0, 3);
      const story = scheduledGoals.length
        ? { label: 'GOAL SCHEDULED', detail: scheduledGoals[0].goal.title, badge: scheduledGoals[0].goal.scheduledTime || 'Open goal', icon: 'target' }
        : isFuture
        ? sideDayStories[2]
        : isPast
          ? sideDayStories[0]
          : sideDayStories[setIndex];
      // Keep adjacent day cards visually distinct. Goal accents belong to the
      // agenda item inside the card, not to the calendar day itself.
      const cardRgb = isToday ? '255,94,0' : calendarCardColors[setIndex];
      const heading = isToday
        ? `Today · ${new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(date)}`
        : new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(date);
      const card = document.createElement('article');
      card.className = `calendar-day-card ${isFuture ? 'is-upcoming' : isPast ? 'is-past' : 'is-today'}`;
      card.dataset.position = String(offset);
      card.style.setProperty('--card-rgb', cardRgb);
      card.setAttribute('aria-label', new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(date));
      card.innerHTML = `
        <header class="day-card-heading">
          <small>${offset === 0 ? (linkedTasks.length ? `${linkedTasks.length} GOAL TASK${linkedTasks.length === 1 ? '' : 'S'}` : addedTasks.length ? `${addedTasks.length} TASK${addedTasks.length === 1 ? '' : 'S'} ADDED` : scheduledGoals.length ? `${scheduledGoals.length} GOAL${scheduledGoals.length === 1 ? '' : 'S'} SCHEDULED` : isFuture ? 'YOU + AI PLAN' : `${agenda.length} TASKS PLANNED`) : new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date).toUpperCase()}</small>
          <strong>${heading}</strong>
          <p>${linkedTasks.length ? 'Goal work stays synced with this calendar' : addedTasks.length ? 'Your actions and AI work are organized together' : scheduledGoals.length ? 'Scheduled goals are connected to your Goals workspace' : isFuture ? 'Your actions and AI support are ready for this day' : 'See what you will do and what AI will handle'}</p>
        </header>
        <div class="side-day-overview">
          <span class="side-orb"><svg viewBox="0 0 24 24" aria-hidden="true">${calendarIcons[story.icon]}</svg></span>
          <strong>${story.label}</strong>
          <p>${story.detail}</p>
          <span>${story.badge}</span>
          ${isFuture ? '<span class="preparing-loader" aria-label="AI preparation in progress"><i></i><i></i><i></i></span>' : ''}
        </div>
        <div class="expanded-agenda">
          ${agenda.map(item => {
            const owner = calendarItemOwner(item);
            const itemRgb = item.rgb || (owner === 'ai' ? '139,92,246' : '255,94,0');
            const timeMatch = String(item.title).match(/(?:^|[^\d])(\d{1,2}:\d{2})(?:\b|$)/);
            const timelineTime = item.timelineTime || timeMatch?.[1] || (item.type === 'complete' ? 'DONE' : item.type === 'planning' ? 'NEXT' : 'NOW');
            const itemContent = `
              <time class="calendar-timeline-time">${timelineTime}</time>
              <span class="carousel-agenda-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${calendarIcons[item.icon]}</svg></span>
              <span class="carousel-agenda-copy"><small><em class="calendar-owner owner-${owner}">${owner === 'ai' ? 'AI' : 'YOU'}</em>${item.label}</small><strong>${item.title}</strong><span>${item.detail}</span></span>
              <span class="carousel-agenda-status">${item.status}</span>`;
            return item.goalIndex !== undefined
              ? `<button class="carousel-agenda-item calendar-goal-item${item.linkedTask ? ' linked-task' : ''}" type="button" data-calendar-goal="${item.goalIndex}"${item.linkedTask ? ` data-calendar-task="${item.taskId}" data-calendar-task-owner="${item.owner}"` : ''} style="--item-rgb:${itemRgb}" aria-label="Open goal: ${escapeGoalText(goalProfiles[item.goalIndex]?.title || item.title)}">${itemContent}</button>`
              : `<div class="carousel-agenda-item" style="--item-rgb:${itemRgb}">${itemContent}</div>`;
          }).join('')}
        </div>
      `;
      card.querySelectorAll('[data-calendar-goal]').forEach(goalButton => {
        goalButton.addEventListener('click', (event) => {
          event.stopPropagation();
          const goalIndex = Number(goalButton.dataset.calendarGoal);
          if (!goalProfiles[goalIndex]) return;
          state.currentGoalIndex = goalIndex;
          if (goalButton.dataset.calendarTask) {
            goalPlanTaskDrawerOpen = true;
            goalPlanTaskOwner = goalButton.dataset.calendarTaskOwner === 'ai' ? 'ai' : 'human';
            goalPlanFocusedTaskId = goalButton.dataset.calendarTask;
          }
          openRoutedView('goals');
          haptic(8);
        });
      });
      if (offset !== 0) {
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.addEventListener('click', () => {
          if (calendarSuppressClick) return;
          moveCalendar(offset);
        });
        card.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            moveCalendar(offset);
          }
        });
      }
      calendarStage.appendChild(card);
    }
    calendarStage.classList.remove('carousel-enter-left', 'carousel-enter-right');
    if (animate) {
      void calendarStage.offsetWidth;
      calendarStage.classList.add(direction === 'left' ? 'carousel-enter-left' : 'carousel-enter-right');
    }
  }

  function moveCalendar(days) {
    if (calendarTransitioning || days === 0) return;
    calendarTransitioning = true;
    calendarStage.classList.add('is-shifting');
    const direction = days > 0 ? 1 : -1;
    calendarStage.querySelectorAll('.calendar-day-card').forEach((card) => {
      const position = Number(card.dataset.position);
      card.dataset.position = String(position - direction);
    });
    window.setTimeout(() => {
      selectedCalendarDate = addCalendarDays(selectedCalendarDate, direction);
      renderCalendar(direction > 0 ? 'left' : 'right', false);
      calendarStage.classList.remove('is-shifting');
      calendarTransitioning = false;
    }, 480);
  }

  calendarPrevious.addEventListener('click', () => moveCalendar(-1));
  calendarNext.addEventListener('click', () => moveCalendar(1));
  calendarAddTask.addEventListener('click', openCalendarTaskModal);
  calendarTaskBackdrop.addEventListener('click', closeCalendarTaskModal);
  calendarTaskClose.addEventListener('click', closeCalendarTaskModal);
  calendarTaskCancel.addEventListener('click', closeCalendarTaskModal);
  calendarTaskGoal.addEventListener('change', updateCalendarSubgoalOptions);
  calendarTaskForm.querySelectorAll('input[name="calendarTaskOwner"]').forEach(input => input.addEventListener('change', () => {
    const isAi = input.checked && input.value === 'ai';
    if (!input.checked) return;
    calendarTaskEndField.classList.toggle('visible', isAi);
    calendarTaskEndTime.required = isAi;
    calendarTaskTimeLabel.textContent = isAi ? 'START TIME' : 'DUE TIME';
    if (isAi && !calendarTaskEndTime.value) calendarTaskEndTime.value = shiftGoalTime(calendarTaskTime.value || '09:00', 45);
  }));
  calendarTaskTime.addEventListener('change', () => {
    if (calendarTaskEndField.classList.contains('visible')) calendarTaskEndTime.value = shiftGoalTime(calendarTaskTime.value || '09:00', 45);
  });
  calendarTaskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = calendarTaskName.value.trim();
    const date = calendarTaskDate.value;
    const time = calendarTaskTime.value;
    const owner = new FormData(calendarTaskForm).get('calendarTaskOwner') === 'ai' ? 'ai' : 'human';
    if (!title || !date || !time) return;
    const goalIndex = calendarTaskGoal.value === '' ? -1 : Number(calendarTaskGoal.value);
    const subgoalIndex = calendarTaskSubgoal.value === '' ? -1 : Number(calendarTaskSubgoal.value);
    const goal = goalProfiles[goalIndex];
    const subgoal = goal?.subgoals?.[subgoalIndex];
    if (goal && subgoal) {
      const task = { id: `goal-task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: title, owner, done: false };
      if (owner === 'ai') {
        task.aiState = 'queued'; task.state = 'Queued'; task.startsAt = `${date}T${time}`;
        task.expectedAt = `${date}T${calendarTaskEndTime.value || shiftGoalTime(time, 45)}`;
      } else {
        task.state = 'Ready now'; task.dueAt = `${date}T${time}`;
      }
      subgoal.executionTasks.push(task);
      syncGoalTaskStats(goal);
      goal.updated = 'Updated now';
      persistCustomGoals(); persistGoalPlanOverrides(); renderGoalCollection();
      if (state.goalWorkspaceActive && state.currentGoalIndex === goalIndex) renderGoalCommandCenter(goal);
    } else {
      calendarUserTasks.unshift({ id: `task-${Date.now()}`, title, date, time, owner, expectedTime: owner === 'ai' ? (calendarTaskEndTime.value || shiftGoalTime(time, 45)) : '' });
      persistCalendarTasks();
    }
    selectedCalendarDate = calendarDateFromKey(date);
    monthPickerCursor = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), 1, 12);
    closeCalendarTaskModal();
    renderCalendar('left');
    __showToast(goal && subgoal ? 'Task linked to Goal and Calendar' : owner === 'ai' ? 'AI task added to the calendar' : 'Your task was added to the calendar');
  });
  calendarMonthButton.addEventListener('click', () => toggleMonthPicker());
  monthPickerPrevious.addEventListener('click', () => {
    monthPickerCursor.setMonth(monthPickerCursor.getMonth() - 1);
    renderMonthPicker();
  });
  monthPickerNext.addEventListener('click', () => {
    monthPickerCursor.setMonth(monthPickerCursor.getMonth() + 1);
    renderMonthPicker();
  });
  monthPickerToday.addEventListener('click', () => {
    selectedCalendarDate = new Date(calendarReferenceDate);
    monthPickerCursor = new Date(calendarReferenceDate.getFullYear(), calendarReferenceDate.getMonth(), 1, 12);
    toggleMonthPicker(false);
    renderCalendar('left');
  });
  calendarToday.addEventListener('click', () => {
    const direction = selectedCalendarDate > calendarReferenceDate ? 'right' : 'left';
    selectedCalendarDate = new Date(calendarReferenceDate);
    toggleMonthPicker(false);
    renderCalendar(direction);
  });
  calendarStage.addEventListener('pointerdown', (event) => {
    calendarPointerStart = event.clientX;
    calendarStage.classList.add('is-dragging');
    calendarStage.setPointerCapture(event.pointerId);
    if (event.pointerType !== 'mouse') haptic();
  });
  calendarStage.addEventListener('pointermove', (event) => {
    if (calendarPointerStart === null) return;
    const movement = Math.max(-80, Math.min(80, event.clientX - calendarPointerStart));
    calendarStage.style.transform = `translateX(${movement * .16}px)`;
  });
  calendarStage.addEventListener('pointerup', (event) => {
    if (calendarPointerStart === null) return;
    const movement = event.clientX - calendarPointerStart;
    calendarPointerStart = null;
    calendarStage.classList.remove('is-dragging');
    calendarStage.style.transform = '';
    if (Math.abs(movement) > 35) {
      calendarSuppressClick = true;
      moveCalendar(movement < 0 ? 1 : -1);
      window.setTimeout(() => { calendarSuppressClick = false; }, 260);
    }
  });
  calendarStage.addEventListener('pointercancel', () => {
    calendarPointerStart = null;
    calendarStage.classList.remove('is-dragging');
    calendarStage.style.transform = '';
  });
  document.addEventListener('pointerdown', (event) => {
    if (!monthPopover.contains(event.target) && !calendarMonthButton.contains(event.target)) toggleMonthPicker(false);
  });
  renderCalendar();
  window.addEventListener('weeple:goals-changed', () => {
    try { renderCalendar('left', false); } catch (_e) { /* overview may be paused */ }
  });
  window.addEventListener('weeple:calendar-changed', () => {
    try { renderCalendar('left', false); } catch (_e) { /* overview may be paused */ }
  });

  function toggleCommand(force) {
    const open = typeof force === 'boolean' ? force : !commandPanel.classList.contains('open');
    commandPanel.classList.toggle('open', open);
    searchButton.classList.toggle('active', open);
    searchButton.setAttribute('aria-expanded', String(open));
    if (open) {
      notificationPanel.classList.remove('open');
      noticeButton.setAttribute('aria-expanded', 'false');
      setTimeout(() => commandInput.focus(), 100);
    }
  }

  searchButton.addEventListener('click', () => toggleCommand());
  noticeButton.addEventListener('click', () => {
    const open = !notificationPanel.classList.contains('open');
    notificationPanel.classList.toggle('open', open);
    noticeButton.classList.toggle('active', open);
    noticeButton.setAttribute('aria-expanded', String(open));
    if (open) toggleCommand(false);
  });
  activityExpand.addEventListener('click', () => {
    notificationPanel.classList.add('open');
    noticeButton.classList.add('active');
    noticeButton.setAttribute('aria-expanded', 'true');
    toggleCommand(false);
  });

  function performActivityAction(item) {
    if (item.classList.contains('is-loading')) return;
    const action = item.dataset.activityAction;
    const target = item.dataset.actionTarget;
    item.classList.add('is-loading');
    item.setAttribute('aria-busy', 'true');
    haptic(10);
    window.setTimeout(() => {
      item.classList.remove('is-loading', 'expanded');
      item.removeAttribute('aria-busy');
      if (target === 'goals') openRoutedView('goals', false);
      if (target === 'data') openRoutedView('data', false);
      if (target === 'memory') openRoutedView('memory', false);
      if (target === 'calendar') {
        try { __navigate('overview'); } catch (_n) { openPrimaryView('overview', false); }
        selectedCalendarDate = new Date(calendarReferenceDate);
        renderCalendar('left');
      }
      __showToast(`${action} opened`);
    }, 620);
  }

  activityItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      const hoverInterface = window.matchMedia('(hover: hover)').matches;
      if (!hoverInterface && event.detail !== 0 && !item.classList.contains('expanded')) {
        activityItems.forEach(other => other.classList.toggle('expanded', other === item));
        haptic();
        return;
      }
      performActivityAction(item);
    });
  });

  document.querySelectorAll('[data-notification-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.notificationAction;
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
      haptic();
      window.setTimeout(() => {
        button.classList.remove('is-loading');
        button.removeAttribute('aria-busy');
        notificationPanel.classList.remove('open');
        noticeButton.classList.remove('active');
        noticeButton.setAttribute('aria-expanded', 'false');
        __showToast(`${action} opened`);
      }, 540);
    });
  });
  async function startVoiceVisualization() {
    state.voiceActive = true;
    voiceButton.classList.add('active');
    voiceButton.style.color = '#8b5cf6';
    voiceButton.setAttribute('aria-pressed', 'true');
    __showToast('Listening… Goal Intelligence is active');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone API unavailable');
      voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      voiceAudioContext = new AudioContextClass();
      voiceAnalyser = voiceAudioContext.createAnalyser();
      voiceAnalyser.fftSize = 256;
      voiceAnalyser.smoothingTimeConstant = .72;
      voiceBuffer = new Uint8Array(voiceAnalyser.fftSize);
      const source = voiceAudioContext.createMediaStreamSource(voiceStream);
      source.connect(voiceAnalyser);
    } catch (error) {
      voiceAnalyser = null;
      voiceBuffer = null;
      __showToast('Voice visualization active in ambient mode');
    }
  }

  function stopVoiceVisualization() {
    state.voiceActive = false;
    voiceButton.classList.remove('active');
    voiceButton.style.color = '';
    voiceButton.setAttribute('aria-pressed', 'false');
    if (voiceStream) voiceStream.getTracks().forEach(track => track.stop());
    if (voiceAudioContext && voiceAudioContext.state !== 'closed') voiceAudioContext.close();
    voiceStream = null;
    voiceAudioContext = null;
    voiceAnalyser = null;
    voiceBuffer = null;
    __showToast('Voice input stopped');
  }

  voiceButton.addEventListener('click', () => {
    if (state.voiceActive) stopVoiceVisualization();
    else startVoiceVisualization();
  });
  commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && commandInput.value.trim()) {
      __showToast(`Weeple is thinking about “${commandInput.value.trim().slice(0, 32)}${commandInput.value.length > 32 ? '…' : ''}”`);
      commandInput.value = '';
      toggleCommand(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const goalPlanMoreWasOpen = goalPlanMoreOpen;
      const goalPlanWasOpen = goalPlanListOpen || goalPlanMoreOpen || goalPlanIntelDetail || goalPlanShareOpen || goalPlanTaskEditor || goalPlanSubgoalEditor !== null;
      goalPlanListOpen = false;
      goalPlanMoreOpen = false;
      goalPlanIntelDetail = null;
      goalPlanShareOpen = false;
      goalPlanTaskEditor = null;
      goalPlanSubgoalEditor = null;
      if (goalPlanWasOpen && state.goalWorkspaceActive && goalProfiles[state.currentGoalIndex]) {
        renderGoalGameBoard(goalProfiles[state.currentGoalIndex]);
        if (goalPlanMoreWasOpen) window.requestAnimationFrame(() => goalGameContent.querySelector('[data-goal-plan-more]')?.focus());
      }
      closeGoalActionMenu();
      closeGoalMonitoringPopover();
      closeGoalResultDrawer();
      closeGoalDeleteSheet();
      closeCollaborationSheet();
      closeGoalCreateSheet();
      closeSourceInspector();
      closeConnectionWizard();
      closeMemoryProposal();
      closeMemoryDrawer();
      closeCalendarTaskModal();
      closeOnboarding();
      toggleCommand(false);
      notificationPanel.classList.remove('open');
      noticeButton.classList.remove('active');
      noticeButton.setAttribute('aria-expanded', 'false');
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      toggleCommand(true);
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (goalPlanMoreOpen && !event.target.closest('.goal-plan-image-more')) {
      window.setTimeout(() => {
        if (!goalPlanMoreOpen) return;
        goalPlanMoreOpen = false;
        if (state.goalWorkspaceActive && goalProfiles[state.currentGoalIndex]) renderGoalGameBoard(goalProfiles[state.currentGoalIndex]);
      }, 0);
    }
    if (!goalActionMenu.contains(event.target) && !goalMoreButton.contains(event.target)) closeGoalActionMenu();
    if (!goalMonitoringPopover.contains(event.target) && !goalMonitoringButton.contains(event.target)) closeGoalMonitoringPopover();
    if (!notificationPanel.contains(event.target) && !noticeButton.contains(event.target)) {
      notificationPanel.classList.remove('open');
      noticeButton.classList.remove('active');
      noticeButton.setAttribute('aria-expanded', 'false');
    }
    if (!event.target.closest('.activity-item')) activityItems.forEach(item => item.classList.remove('expanded'));
  });

  document.addEventListener('pointerdown', (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const rect = button.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height) * 1.45;
    const ripple = document.createElement('span');
    ripple.className = 'touch-ripple';
    ripple.style.width = `${diameter}px`;
    ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;
    button.classList.add('touch-feedback', 'is-pressed');
    button.appendChild(ripple);
    window.setTimeout(() => button.classList.remove('is-pressed'), 130);
    window.setTimeout(() => ripple.remove(), 680);
    if (event.pointerType !== 'mouse') haptic();
  }, { passive: true });

  window.addEventListener('resize', () => {
    resize();
    scheduleGoalCanvasPathSync();
    alignUseSpeechBubble();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    state.visible = !document.hidden;
    if (state.visible) startTopologyLoop();
    else stopTopologyLoop(false);
  });

  buildUniverse();
  applyAmbientTheme();
  resize();
  /* Initial route activation is performed by activatePage via the hash router. */


  __activatePage = function activatePage(pageId, params) {
    const legacy =
      pageId === 'import-data' ? 'data' :
      pageId === 'use-data' ? 'memory' :
      pageId === 'goals' ? 'goals' :
      'overview';

    // Show only the active page root
    document.querySelectorAll('#page-outlet > .page').forEach((el) => {
      const active = el.dataset.page === pageId;
      el.hidden = !active;
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
      el.style.display = active ? '' : 'none';
    });

    openPrimaryView(legacy, false);

    if (pageId === 'goals' && params.get('sheet') === 'create') openGoalCreateSheet();
    if (pageId === 'goals' && params.get('drawer') === 'plan') renderGoalResultDrawer('plan');
    if (pageId === 'import-data' && params.get('wizard') === '1') openConnectionWizard();
    if (pageId === 'use-data' && params.get('memory') === '1') openMemoryDrawer();
    if (params.get('onboarding') === '1') openOnboarding();
  };

  __deactivatePage = function deactivatePage(pageId) {
    if (pageId === 'overview') stopTopologyLoop(true);
    if (pageId === 'goals') {
      try { closeGoalsWorkspace(); } catch (_e) {}
    }
    if (pageId === 'import-data') {
      try { closeDataWorkspace(); } catch (_e) {}
    }
    if (pageId === 'use-data') {
      try { closeUseWorkspace(); } catch (_e) {}
    }
  };
}
