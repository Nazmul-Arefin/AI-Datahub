(() => {
  'use strict';

  const sharedStore = window.WeepleStore;
  const readPersisted = (name, key, fallback) => {
    if (sharedStore) return sharedStore.read(name, fallback);
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  };
  const writePersisted = (name, key, value) => {
    if (sharedStore) return sharedStore.write(name, value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  };

  const canvas = document.getElementById('topologyCanvas');
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
  const defaultConsentRules = consentRules.innerHTML;
  const dataWorkspace = document.getElementById('dataWorkspace');
  const sourceGrid = document.getElementById('sourceGrid');
  const sourceCount = document.getElementById('sourceCount');
  const sourceInspector = document.getElementById('sourceInspector');
  const sourceInspectorContent = document.getElementById('sourceInspectorContent');
  const sourceInspectorBackdrop = document.getElementById('sourceInspectorBackdrop');
  const sourceInspectorClose = document.getElementById('sourceInspectorClose');
  const addSourceButton = document.getElementById('addSourceButton');
  const connectionWizard = document.getElementById('connectionWizard');
  const connectionWizardClose = document.getElementById('connectionWizardClose');
  const wizardCancel = document.getElementById('wizardCancel');
  const wizardContinue = document.getElementById('wizardContinue');
  const wizardPermissionPreview = document.getElementById('wizardPermissionPreview');
  const useWorkspace = document.getElementById('useWorkspace');
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

  const overviewTopologyPalette = {
    goals: { color: '#f39a76', rgb: '243,154,118', label: 'GOAL MANAGEMENT' },
    data: { color: '#9a5b16', rgb: '154,91,22', label: 'PERSONAL DATA' },
    memory: { color: '#7e3f46', rgb: '126,63,70', label: 'LONG-TERM MEMORY' },
    subgoal: { color: '#fac69d', rgb: '250,198,157', label: 'DIRECT SUBGOAL' },
    execution: { color: '#c9b5a5', rgb: '201,181,165', label: 'AI EXECUTION' },
    ai: { color: '#ff5e00', rgb: '255,94,0', label: 'AI SYNTHESIS' }
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

  function topologyStyle(key) {
    const overviewSurface = !state.goalWorkspaceActive && !state.dataWorkspaceActive && !state.useWorkspaceActive;
    return (overviewSurface ? overviewTopologyPalette : palette)[key] || palette[key] || palette.goals;
  }

  function visualStyle(node) {
    const base = topologyStyle(node.cluster);
    if (state.goalWorkspaceActive && node.cluster === 'goals' && !node.core) {
      return node.goalRole === 'subgoal' ? palette.subgoal : palette.execution;
    }
    if (node.visualKind === 'ai-core') {
      return topologyStyle('ai');
    }
    if (!node.core || node.cluster !== 'goals') return base;
    const execution = getExecutionLevel();
    const mixed = blendRgb(topologyStyle('goals').rgb.split(',').map(Number), topologyStyle('execution').rgb.split(',').map(Number), execution);
    return { color: `rgb(${mixed.join(',')})`, rgb: mixed.join(','), label: base.label };
  }

  function applyAmbientTheme() {
    const executionVisible = state.executionAmbient && (state.activeCluster === 'overview' || state.activeCluster === 'goals');
    const style = executionVisible ? topologyStyle('execution') : topologyStyle(state.activeCluster);
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
    const brandedSynthesis = node.visualKind === 'ai-core' && !state.goalWorkspaceActive && !state.dataWorkspaceActive && !state.useWorkspaceActive;
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2.8);
    halo.addColorStop(0, `rgba(${style.rgb},${brandedSynthesis ? .34 : .25})`);
    halo.addColorStop(.3, `rgba(${style.rgb},${brandedSynthesis ? .12 : .08})`);
    halo.addColorStop(1, `rgba(${style.rgb},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    if (brandedSynthesis) {
      const synthesisFill = ctx.createRadialGradient(-coreRadius * .28, -coreRadius * .3, 0, 0, 0, coreRadius * 1.08);
      synthesisFill.addColorStop(0, '#ffb24a');
      synthesisFill.addColorStop(.42, '#ff7200');
      synthesisFill.addColorStop(1, '#ed4300');
      ctx.fillStyle = synthesisFill;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.62)';
    }
    ctx.strokeStyle = brandedSynthesis ? 'rgba(32,32,32,.72)' : `rgba(${style.rgb},.58)`;
    ctx.lineWidth = 1.1;
    ctx.shadowColor = style.color;
    ctx.shadowBlur = brandedSynthesis ? 28 : 17;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.save();
    ctx.rotate(phase * .055 + node.phase);
    ctx.strokeStyle = brandedSynthesis ? 'rgba(25,27,28,.78)' : `rgba(${style.rgb},.72)`;
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
    ctx.strokeStyle = brandedSynthesis ? 'rgba(255,255,255,.58)' : `rgba(${style.rgb},.48)`;
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
    const brainAccent = topologyStyle('ai').rgb;
    const goalAccent = topologyStyle('goals').rgb;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    const radius = 104 * goalCore.screen.scale;
    const glow = ctx.createRadialGradient(goalCore.screen.x, goalCore.screen.y, 0, goalCore.screen.x, goalCore.screen.y, radius);
    glow.addColorStop(0, `rgba(${brainAccent},.095)`);
    glow.addColorStop(.42, `rgba(${goalAccent},.028)`);
    glow.addColorStop(1, `rgba(${goalAccent},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(goalCore.screen.x, goalCore.screen.y, radius, 0, Math.PI * 2);
    ctx.fill();

    goalNodes.forEach((goalNode, index) => {
      if (!Number.isFinite(goalNode.screen.x)) return;
      const branchGlow = ctx.createLinearGradient(goalNode.screen.x, goalNode.screen.y, goalCore.screen.x, goalCore.screen.y);
      branchGlow.addColorStop(0, 'rgba(255,255,255,0)');
      branchGlow.addColorStop(.54, goalNode.isSelectedGoal ? `rgba(${goalAccent},.055)` : `rgba(${brainAccent},.012)`);
      branchGlow.addColorStop(1, goalNode.isSelectedGoal ? `rgba(${brainAccent},.075)` : `rgba(${brainAccent},.025)`);
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
    ctx.strokeStyle = `rgba(${brainAccent},.11)`;
    ctx.lineWidth = .65;
    ctx.setLineDash([2, 9]);
    ctx.lineDashOffset = reduceMotion ? 0 : -state.elapsed * 2.5;
    ctx.beginPath();
    ctx.ellipse(goalCore.screen.x, goalCore.screen.y, contourRadius, contourRadius * .48, -.08, 0, Math.PI * 2);
    ctx.stroke();

    const scanX = goalCore.screen.x + Math.sin(reduceMotion ? 0 : state.elapsed * .18) * contourRadius * .72;
    const scanGradient = ctx.createLinearGradient(scanX, goalCore.screen.y - contourRadius * .45, scanX, goalCore.screen.y + contourRadius * .45);
    scanGradient.addColorStop(0, `rgba(${brainAccent},0)`);
    scanGradient.addColorStop(.5, `rgba(${brainAccent},.12)`);
    scanGradient.addColorStop(1, `rgba(${brainAccent},0)`);
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
          ctx.strokeStyle = `rgba(${topologyStyle('execution').rgb},${.28 + state.voiceLevel * .55})`;
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
        ctx.strokeStyle = `rgba(${topologyStyle('execution').rgb},${.16 + state.voiceLevel * .48})`;
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
      const style = topologyStyle(edge.evidenceType);
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
      if (
        node.visualKind === 'ai-core' &&
        !state.goalWorkspaceActive &&
        !state.dataWorkspaceActive &&
        !state.useWorkspaceActive
      ) {
        node.screen.x = state.width * (state.width < 700 ? .66 : .72);
        node.screen.y = state.height * .465;
      }
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
        bridgeGradient.addColorStop(0, `rgba(${topologyStyle(edge.a.cluster).rgb},${(active ? .42 : .05) * edgeVisibility * pathEmphasis})`);
        bridgeGradient.addColorStop(1, `rgba(${topologyStyle(edge.b.cluster).rgb},${(active ? .42 : .05) * edgeVisibility * pathEmphasis})`);
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
    tooltip.style.setProperty('--tooltip-color', topologyStyle(node.cluster).color);
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
    const rippleStyle = touchedNode ? visualStyle(touchedNode) : topologyStyle(state.activeCluster);
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
  let goalPlanTaskEditor = null;
  let goalPlanSubgoalEditor = null;
  let goalPlanFocusedTaskId = '';
  const savedDeletedGoals = readPersisted('deletedGoals', 'weeple-deleted-goals', []);
  if (Array.isArray(savedDeletedGoals)) savedDeletedGoals.forEach(title => deletedGoalTitles.add(String(title)));
  for (let index = goalProfiles.length - 1; index >= 0; index -= 1) {
    if (deletedGoalTitles.has(goalProfiles[index].title)) goalProfiles.splice(index, 1);
  }
  const pausedMonitoringGoalTitles = new Set();
  const savedPausedGoals = readPersisted('pausedGoalMonitoring', 'weeple-paused-goal-monitoring', []);
  if (Array.isArray(savedPausedGoals)) savedPausedGoals.forEach(title => pausedMonitoringGoalTitles.add(String(title)));
  goalProfiles.forEach(goal => { goal.monitoringPaused = pausedMonitoringGoalTitles.has(goal.title); });
  const savedGoals = readPersisted('customGoals', 'weeple-custom-goals', []);
  if (Array.isArray(savedGoals)) savedGoals.filter(goal => goal && goal.title && Array.isArray(goal.subgoals)).forEach(goal => goalProfiles.push(goal));
  const savedPlanOverrides = readPersisted('goalPlanOverrides', 'weeple-goal-plan-overrides', {});
  goalProfiles.forEach(goal => {
    const savedSubgoals = savedPlanOverrides?.[goal.title];
    if (!goal.custom && Array.isArray(savedSubgoals) && savedSubgoals.length) goal.subgoals = savedSubgoals;
  });

  function persistCustomGoals() {
    writePersisted('customGoals', 'weeple-custom-goals', goalProfiles.filter(goal => goal.custom));
  }

  function persistGoalPlanOverrides() {
    try {
      const planOverrides = Object.fromEntries(goalProfiles.filter(goal => !goal.custom).map(goal => [goal.title, goal.subgoals]));
      writePersisted('goalPlanOverrides', 'weeple-goal-plan-overrides', planOverrides);
    } catch (error) { /* storage is optional */ }
  }

  function persistDeletedGoals() {
    writePersisted('deletedGoals', 'weeple-deleted-goals', [...deletedGoalTitles]);
  }

  function persistMonitoringPreferences() {
    writePersisted('pausedGoalMonitoring', 'weeple-paused-goal-monitoring', [...pausedMonitoringGoalTitles]);
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
        showToast(`${subgoal.name} selected`);
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
        showToast('AI recommendation opened for your confirmation');
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
    goalInspectorContent.querySelector('.goal-primary-action').addEventListener('click', () => showToast('Full execution plan opened'));
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
        <section class="goal-plan-visual${goalPlanTransitionDirection < 0 ? ' goal-switch-previous' : goalPlanTransitionDirection > 0 ? ' goal-switch-next' : ''}" aria-label="Goal visualization">
          <img src="${artwork.url}" alt="${artwork.alt}">
          <div class="goal-plan-image-shade"></div>
          <div class="goal-plan-image-title"><small>${escapeGoalText(goal.category)} GOAL</small><h1 title="${escapeGoalText(goal.title)}">${escapeGoalText(goal.title)}</h1></div>
          <span class="goal-plan-live"><i></i>${goal.monitoringPaused ? 'PAUSED' : 'GOAL ACTIVE'}</span>
          <div class="goal-plan-image-actions">
            <button class="goal-plan-image-share" type="button" data-goal-plan-share aria-label="Share goal"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.5-4.4M8.2 13.2l7.5 4.4"/></svg><span>Share</span></button>
            <div class="goal-plan-image-more"><button type="button" data-goal-plan-more aria-haspopup="menu" aria-expanded="${String(goalPlanMoreOpen)}" aria-label="More goal actions"><i></i><i></i><i></i></button>${goalPlanMoreOpen ? `<div role="menu" aria-label="Goal actions"><button type="button" role="menuitem" data-goal-plan-edit><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5.5 4 4M4 20l3.8-.8L19 8a2.1 2.1 0 0 0-3-3L4.8 16.2 4 20Z"/></svg><span>Edit goal</span><em aria-hidden="true">›</em></button><button class="delete" type="button" role="menuitem" data-goal-plan-delete><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg><span>Delete goal</span><em aria-hidden="true">›</em></button></div>` : ''}</div>
          </div>
          <div class="goal-plan-image-progress"><span><small>PROGRESS</small><b>${progress}%</b></span><i><em style="width:${progress}%"></em></i></div>
          <div class="goal-plan-image-deadline"><small>DEADLINE</small><b>${goalPlanCountdown(goal)}</b><em>${formatGoalPlanMoment(deadline)}</em></div>
          <div class="goal-plan-next"><i>→</i><span><small>NEXT MOVE</small><b title="${escapeGoalText(nextTask?.name || 'Review progress')}">${escapeGoalText(nextTask?.name || 'Review progress')}</b></span></div>
          <nav class="goal-plan-art-navigation" aria-label="Switch goals">
            ${previousGoal ? `<button class="previous" type="button" data-goal-direction="-1" aria-keyshortcuts="ArrowLeft" aria-label="Previous goal: ${escapeGoalText(previousGoal.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>` : ''}
            ${nextGoal ? `<button class="next" type="button" data-goal-direction="1" aria-keyshortcuts="ArrowRight" aria-label="Next goal: ${escapeGoalText(nextGoal.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>` : ''}
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
      showToast(`${goal.title} opened`);
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
    showToast(`${suggestion.action} approved - AI is preparing`);
    window.setTimeout(() => {
      if (!goalProfiles.includes(goal) || suggestion.decision !== 'confirmed') return;
      suggestion.executionState = 'executing';
      if (goalProfiles[state.currentGoalIndex] === goal) renderGoalCommandCenter(goal);
      showToast(`${suggestion.action} is executing securely`);
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
        showToast(`${suggestion.action} completed - goal plan updated`);
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
    showToast(`${goal.title} restored`);
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
    showToast(`${goal.title} deleted`, { actionLabel: 'Undo', duration: 8000, onAction: undoGoalDeletion });
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
    selectGoal(goalIndex, false);
    focusCluster('goals', false);
    showGoalUseHint();
    if (announce) showToast('Goal universe opened');
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
      button.textContent = 'Connecting...';
    }
    window.setTimeout(() => {
      source.status = 'Connected';
      source.statusType = 'connected';
      source.aiEnabled = true;
      source.scopeEnabled = source.scopes.map(() => true);
      source.lastSync = 'Reconnected now';
      source.usedBy = 'Available for future authorized AI tasks';
      renderSourceGrid();
      if (state.selectedSourceId === source.id) renderSourceInspector(source);
      showToast(`${source.name} connected securely`);
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
    if (!source.scopeEnabled) source.scopeEnabled = source.scopes.map(() => !revoked);
    sourceInspectorContent.innerHTML = `
      <header class="source-detail-header"><span><i></i>AUTHORIZATION DETAIL</span>${sourceStatusLabel(source)}<h2 id="sourceInspectorTitle">${source.name}</h2><p>${source.type} · ${source.method}</p></header>
      ${revoked ? '<div class="revoked-banner"><i></i><span><strong>Access revoked</strong><small>This source is excluded from every future AI task.</small></span></div>' : ''}
      <section class="source-availability"><span><strong>Available to Weeple</strong><small>${revoked ? 'Reconnect this source to make it available.' : 'Allow this source in future authorized AI tasks.'}</small></span><button class="source-adapter-toggle" type="button" aria-pressed="${String(!revoked && source.aiEnabled !== false)}" aria-label="${source.aiEnabled === false ? 'Resume' : 'Pause'} ${source.name}" ${revoked ? 'disabled' : ''}><i></i></button></section>
      <section class="source-detail-block"><header><strong>Authorized scope</strong><span>Minimum access</span></header>${source.scopes.map((scope, index) => `<button class="scope-toggle${!revoked && source.scopeEnabled[index] ? ' on' : ''}" type="button" data-scope-index="${index}" aria-pressed="${String(!revoked && source.scopeEnabled[index])}" ${revoked ? 'disabled' : ''}><span><i></i>${scope}</span><em></em></button>`).join('')}</section>
      <section class="source-detail-block"><header><strong>Allowed purposes</strong><span>You control this</span></header><div class="purpose-chips">${source.purposes.map(purpose => `<span>${purpose}</span>`).join('')}</div></section>
      <section class="source-use-log"><small>RECENT AI USE</small><strong>${source.usedBy}</strong><span>Last synchronization: ${source.lastSync}</span></section>
      <section class="source-processing"><span><i></i><b>Processing location</b><small>${source.category === 'identity' ? 'Public discovery with review gate' : 'Encrypted local processing where available'}</small></span><em>${source.assets}</em></section>
      <div class="source-detail-actions">${revoked ? '<button class="source-sync source-reconnect" type="button">Connect source</button>' : '<button class="source-sync" type="button">Sync now</button><button class="source-revoke" type="button">Disconnect</button>'}</div>
    `;
    const availabilityButton = sourceInspectorContent.querySelector('.source-availability .source-adapter-toggle');
    availabilityButton.addEventListener('click', () => {
      if (revoked) return;
      source.aiEnabled = source.aiEnabled === false;
      renderSourceGrid();
      renderSourceInspector(source);
      window.requestAnimationFrame(() => sourceInspectorContent.querySelector('.source-availability .source-adapter-toggle')?.focus());
      showToast(`${source.name} ${source.aiEnabled ? 'is available to Weeple' : 'is paused'}`);
    });
    sourceInspectorContent.querySelectorAll('.scope-toggle').forEach(button => button.addEventListener('click', () => {
      if (revoked) return;
      const on = button.classList.toggle('on');
      button.setAttribute('aria-pressed', String(on));
      source.scopeEnabled[Number(button.dataset.scopeIndex)] = on;
      showToast(`${button.textContent.trim()} ${on ? 'allowed' : 'excluded from future tasks'}`);
    }));
    const syncButton = sourceInspectorContent.querySelector('.source-sync');
    syncButton.addEventListener('click', () => {
      if (syncButton.classList.contains('source-reconnect')) { reconnectSource(source, syncButton); return; }
      if (syncButton.disabled || syncButton.classList.contains('is-loading')) return;
      syncButton.classList.add('is-loading');
      syncButton.textContent = 'Synchronizing…';
      window.setTimeout(() => { syncButton.classList.remove('is-loading'); syncButton.textContent = 'Sync now'; showToast(`${source.name} synchronized securely`); }, 760);
    });
    const revokeButton = sourceInspectorContent.querySelector('.source-revoke');
    revokeButton?.addEventListener('click', () => {
      if (!revokeButton.classList.contains('confirming')) {
        revokeButton.classList.add('confirming');
        revokeButton.textContent = 'Confirm disconnect';
        showToast(`Confirm to disconnect ${source.name}`);
        return;
      }
      source.status = 'Revoked'; source.statusType = 'revoked'; source.aiEnabled = false; source.scopeEnabled = source.scopes.map(() => false); source.lastSync = 'Access stopped'; source.usedBy = 'Future AI use is blocked';
      renderSourceGrid(); renderSourceInspector(source); showToast(`${source.name} disconnected`);
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
    window.requestAnimationFrame(() => sourceInspectorClose.focus());
  }

  function closeSourceInspector(restoreFocus = true) {
    if (!sourceInspector.classList.contains('visible')) return;
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
        memory.use = !memory.use; renderMemories(filter); showToast(memory.use ? 'Memory available to future AI tasks' : 'Memory excluded from future AI tasks');
      });
      item.querySelector('.memory-edit').addEventListener('click', openMemoryProposal);
      item.querySelector('.memory-delete').addEventListener('click', event => {
        const button = event.currentTarget;
        if (!button.classList.contains('confirming')) { button.classList.add('confirming'); button.textContent = 'Confirm'; return; }
        const index = memories.indexOf(memory); if (index >= 0) memories.splice(index, 1); renderMemories(filter); showToast('Memory permanently deleted');
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
    onboardingBody.querySelectorAll('[data-result-feedback]').forEach(button => button.addEventListener('click', () => { onboardingBody.querySelectorAll('[data-result-feedback]').forEach(item => item.classList.toggle('active', item === button)); showToast(`Feedback recorded: ${button.textContent}`); }));
  }

  function openOnboarding() { state.onboardingStep = 0; onboardingOverlay.classList.add('visible'); onboardingOverlay.setAttribute('aria-hidden', 'false'); renderOnboarding(); }
  function closeOnboarding() { onboardingOverlay.classList.remove('visible'); onboardingOverlay.setAttribute('aria-hidden', 'true'); }

  function openDataWorkspace(announce = true) {
    state.dataWorkspaceActive = true; stopTopologyLoop(); dataWorkspace.classList.add('visible'); dataWorkspace.setAttribute('aria-hidden', 'false'); osShell.classList.add('data-page');
    renderSourceGrid(); focusCluster('data', false); if (announce) showToast('Personal data control center opened');
  }
  function closeDataWorkspace() { state.dataWorkspaceActive = false; dataWorkspace.classList.remove('visible'); dataWorkspace.setAttribute('aria-hidden', 'true'); osShell.classList.remove('data-page'); closeSourceInspector(false); closeConnectionWizard(); }
  function openUseWorkspace(announce = true) {
    state.useWorkspaceActive = true; stopTopologyLoop(); useWorkspace.classList.add('visible'); useWorkspace.setAttribute('aria-hidden', 'false'); osShell.classList.add('use-page'); focusCluster('memory', false); if (announce) showToast('Active AI workspace opened');
  }
  function closeUseWorkspace() { state.useWorkspaceActive = false; useWorkspace.classList.remove('visible'); useWorkspace.setAttribute('aria-hidden', 'true'); osShell.classList.remove('use-page'); closeMemoryDrawer(); closeMemoryProposal(); }

  function openPrimaryView(key, announce = true) {
    if (announce && window.WeepleRouter?.navigateByLegacyKey) {
      window.WeepleRouter.navigateByLegacyKey(key);
      return;
    }
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
  function showToast(message, options = {}) {
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
          showToast(`${action} ready`);
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

    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === key));
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
    if (announce) showToast(key === 'overview' ? 'Universe overview restored' : `${clusterConfig.find(c => c.key === key).title} hub focused`);
  }

  document.querySelectorAll('[data-focus]').forEach(button => {
    button.addEventListener('click', () => focusCluster(button.dataset.focus));
  });
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => openPrimaryView(button.dataset.view));
  });
  document.querySelectorAll('[data-home]').forEach(button => {
    button.addEventListener('click', () => openPrimaryView('overview'));
  });
  focusBack.addEventListener('click', () => openPrimaryView('overview'));
  goalAdd.addEventListener('click', openGoalCreateSheet);
  reasoningGoalAdd.addEventListener('click', openGoalCreateSheet);
  goalLibraryAdd.addEventListener('click', openGoalCreateSheet);
  goalMenuButton.addEventListener('click', () => {
    if (goalMenuButton.disabled) return;
    openGoalEditSheet();
  });
  goalMoreButton.addEventListener('click', () => {
    if (goalMoreButton.disabled) return;
    const visible = goalActionMenu.classList.toggle('visible');
    goalActionMenu.setAttribute('aria-hidden', String(!visible));
    goalMoreButton.setAttribute('aria-expanded', String(visible));
    haptic(5);
  });
  goalDeleteButton.addEventListener('click', openGoalDeleteSheet);
  goalDeleteCancel.addEventListener('click', closeGoalDeleteSheet);
  goalDeleteConfirm.addEventListener('click', deleteSelectedGoal);
  goalResultDrawerClose.addEventListener('click', closeGoalResultDrawer);

  function commitGoalPlanChange(goal, message) {
    syncGoalTaskStats(goal);
    updateGoalCompletionSummary(goal);
    goal.updated = 'Updated now';
    persistCustomGoals();
    persistGoalPlanOverrides();
    renderGoalCommandCenter(goal);
    renderGoalCollection();
    if (typeof renderCalendar === 'function') renderCalendar('left', false);
    if (message) showToast(message);
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

  function navigateGoalPlanBy(direction) {
    const normalizedDirection = direction < 0 ? -1 : direction > 0 ? 1 : 0;
    const nextIndex = state.currentGoalIndex + normalizedDirection;
    if (!normalizedDirection || nextIndex < 0 || nextIndex >= goalProfiles.length) {
      haptic(4);
      return false;
    }

    goalPlanListOpen = false;
    goalPlanMoreOpen = false;
    goalPlanIntelDetail = null;
    goalPlanShareOpen = false;
    goalPlanTaskEditor = null;
    goalPlanSubgoalEditor = null;
    goalPlanFocusedTaskId = '';
    goalPlanTransitionDirection = normalizedDirection;
    window.clearTimeout(goalPlanTransitionTimer);
    selectGoal(nextIndex);

    window.requestAnimationFrame(() => {
      const preferredArrow = goalGameContent.querySelector(`[data-goal-direction="${normalizedDirection}"]`)
        || goalGameContent.querySelector(`[data-goal-direction="${normalizedDirection * -1}"]`);
      preferredArrow?.focus({ preventScroll: true });
    });

    goalPlanTransitionTimer = window.setTimeout(() => {
      goalPlanTransitionDirection = 0;
      goalGameContent.querySelector('.goal-plan-visual')?.classList.remove('goal-switch-previous', 'goal-switch-next');
    }, reduceMotion ? 0 : 430);
    haptic(8);
    return true;
  }

  function goalPlanDirectionAtPoint(clientX, clientY) {
    const arrows = [...goalGameContent.querySelectorAll('[data-goal-direction]')];
    const matchedArrow = arrows.find((arrow) => {
      const bounds = arrow.getBoundingClientRect();
      return clientX >= bounds.left && clientX <= bounds.right && clientY >= bounds.top && clientY <= bounds.bottom;
    });
    return matchedArrow ? Number(matchedArrow.dataset.goalDirection) : 0;
  }

  goalGameContent?.addEventListener('click', (event) => {
    if (!event.target.closest('.goal-plan-intel-scrim,.goal-plan-share-scrim')) return;
    const direction = goalPlanDirectionAtPoint(event.clientX, event.clientY);
    if (!direction) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigateGoalPlanBy(direction);
  }, true);

  goalGameContent?.addEventListener('click', (event) => {
    if (event.target.closest('[data-empty-goal-add]')) { openGoalCreateSheet(); return; }
    const goal = goalProfiles[state.currentGoalIndex];
    if (!goal) return;

    if (event.target.closest('[data-goal-list-toggle]')) { goalPlanListOpen = !goalPlanListOpen; renderGoalGameBoard(goal); if (goalPlanListOpen) window.requestAnimationFrame(() => goalGameContent.querySelector('.goal-plan-list input')?.focus()); haptic(5); return; }
    if (event.target.closest('[data-goal-list-close]')) { goalPlanListOpen = false; renderGoalGameBoard(goal); return; }
    const directionButton = event.target.closest('[data-goal-direction]');
    if (directionButton) {
      navigateGoalPlanBy(Number(directionButton.dataset.goalDirection));
      return;
    }
    const goalSelect = event.target.closest('[data-goal-plan-select]');
    if (goalSelect) { window.clearTimeout(goalPlanTransitionTimer); goalPlanTransitionDirection = 0; goalPlanListOpen = false; goalPlanMoreOpen = false; goalPlanIntelDetail = null; goalPlanFocusedTaskId = ''; selectGoal(Number(goalSelect.dataset.goalPlanSelect)); haptic(8); return; }
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
      createGoalShareCard(goal, shareButton.hasAttribute('data-goal-share-download')).then(result => { goalPlanShareOpen = false; renderGoalGameBoard(goal); showToast(result === 'shared' ? 'Goal momentum shared' : 'Private goal card downloaded'); }).catch(error => { shareButton.disabled = false; shareButton.textContent = 'Try again'; showToast('Sharing is unavailable in this browser'); });
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
      showToast(`${subgoal.name} accepted`); haptic(12);
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
      showToast(`${subgoal.name} rejected - no action will run`); haptic(9);
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
      showToast(`${subgoal.name} restored to your plan`); haptic(10);
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
      if (goal.subgoals.length === 1) { showToast('Keep at least one subgoal'); return; }
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
      showToast(`${subgoal.name} deleted`); haptic(10);
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
        showToast('Suggestion skipped - no action taken'); haptic(8);
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
      showToast('Suggestion timing saved'); haptic(8);
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
    if (event.target.closest('.goal-plan-art-navigation') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      navigateGoalPlanBy(event.key === 'ArrowLeft' ? -1 : 1);
      return;
    }
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
      showToast(`${subgoal.name} confirmed in your plan`);
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
      showToast('A goal needs at least one subgoal. Edit this one instead.');
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
    showToast(`${removedName} removed from the plan`);
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
        showToast('That subgoal is already in this plan');
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
      showToast(`${newName} added as your subgoal`);
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
    showToast(previousName === subgoal.name ? 'Subgoal kept unchanged' : 'Subgoal updated and confirmed');
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
      showToast(`${suggestion.selectedOption} selected for review`);
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
      showToast(goal.monitoringPaused ? 'AI monitoring paused for this goal' : 'AI monitoring resumed');
      return;
    }
    closeGoalMonitoringPopover();
    const whyButton = document.getElementById('predictionExplain');
    const evidence = document.getElementById('predictionEvidence');
    if (whyButton && evidence) {
      whyButton.setAttribute('aria-expanded', 'true');
      evidence.classList.add('visible');
      evidence.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      showToast('Authorized goal sources opened');
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

  function navigateGoalBy(direction) {
    const nextIndex = state.currentGoalIndex + direction;
    if (nextIndex < 0 || nextIndex >= goalProfiles.length) {
      haptic(4);
      showToast(direction < 0 ? 'This is your first goal' : 'This is your last goal');
      return;
    }
    goalCommandHero.classList.remove('swipe-left', 'swipe-right');
    void goalCommandHero.offsetWidth;
    goalCommandHero.classList.add(direction > 0 ? 'swipe-left' : 'swipe-right');
    selectGoal(nextIndex);
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
    if (!target) { showToast('All current goal actions are reviewed'); return; }
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
        showToast('AI subgoal proposals are ready for your review');
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
      showToast('AI proposal adjusted for review');
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
      showToast('Direct subgoal confirmed and added to the plan');
      return;
    }
    goal.draftSubgoals.splice(proposalIndex, 1);
    renderGoalProposalInbox(goal);
    persistCustomGoals();
    haptic(6);
    showToast('AI proposal rejected - confirmed plan unchanged');
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
      showToast(`${subgoal.name} ${markComplete ? 'completed' : 'reopened'}`);
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
      showToast(`${task.name} ${task.done ? 'completed' : 'reopened'}`);
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
    showToast(`${subgoal.name} ${completed ? 'reopened' : 'completed'}`);
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
      showToast(`${option.dataset.suggestionOption} selected for review`);
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
      showToast('Suggestion rejected — nothing was executed');
    }
    persistCustomGoals();
    renderGoalCommandCenter(goal);
    renderGoalCollection();
    triggerReasoningUpdate('Prediction recalculated');
    const unresolved = reasoningSuggestionList.querySelectorAll('.suggestion-card:not(.is-confirmed):not(.is-rejected)').length;
    suggestionCount.textContent = unresolved > 1 ? `1 best + ${unresolved - 1} more` : unresolved === 1 ? 'Ready' : 'Reviewed';
  });
  document.getElementById('settingsButton').addEventListener('click', () => showToast('System settings ready'));
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
      showToast(scheduledDate ? `Goal updated for ${formatGoalSchedule(scheduledDate, scheduledTime)}` : 'Goal changes saved');
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
      showToast('AI proposal ready — review before confirming');
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
    showToast(scheduledDate ? `Goal scheduled for ${formatGoalSchedule(scheduledDate, scheduledTime)}` : 'Goal created from your confirmed proposal');
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
        showToast('Interest recorded — identity stays private until the match is mutual');
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
      showToast('Private collaboration matching enabled');
    }, 680);
  });
  document.querySelectorAll('[data-source-filter]').forEach(button => button.addEventListener('click', () => {
    state.sourceFilter = button.dataset.sourceFilter;
    document.querySelectorAll('[data-source-filter]').forEach(item => item.classList.toggle('active', item === button));
    renderSourceGrid();
  }));
  addSourceButton.addEventListener('click', openConnectionWizard);
  sourceInspectorClose.addEventListener('click', () => closeSourceInspector());
  sourceInspectorBackdrop.addEventListener('click', () => closeSourceInspector());
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
  wizardContinue.addEventListener('click', () => { closeConnectionWizard(); showToast('Permission review opened — nothing connected yet'); });

  document.getElementById('memoryOpenButton').addEventListener('click', openMemoryDrawer);
  document.getElementById('memoryEntry').addEventListener('click', openMemoryDrawer);
  document.getElementById('memoryClose').addEventListener('click', closeMemoryDrawer);
  document.getElementById('voiceMemoryEdit').addEventListener('click', openMemoryProposal);
  document.getElementById('memoryProposalCancel').addEventListener('click', closeMemoryProposal);
  document.getElementById('memoryProposalConfirm').addEventListener('click', () => {
    const preference = memories.find(memory => memory.id === 2);
    if (preference) preference.detail = 'Best focus time is 8:30–11:00 on weekdays.';
    closeMemoryProposal(); renderMemories(); showToast('Memory corrected with your confirmation');
  });
  document.querySelectorAll('[data-memory-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-memory-filter]').forEach(item => item.classList.toggle('active', item === button)); renderMemories(button.dataset.memoryFilter);
  }));
  document.querySelectorAll('[data-use-prompt]').forEach(button => button.addEventListener('click', () => {
    assistantInput.value = button.dataset.usePrompt; assistantInput.focus();
  }));
  assistantComposer.addEventListener('submit', event => {
    event.preventDefault(); const prompt = assistantInput.value.trim(); if (!prompt) return; assistantInput.value = ''; appendAssistantExchange(prompt);
  });
  document.getElementById('assistantAttach').addEventListener('click', () => showToast('Choose authorized context — no source is added automatically'));
  document.getElementById('assistantVoice').addEventListener('click', () => { if (!state.voiceActive) startVoiceVisualization(); else stopVoiceVisualization(); });
  document.querySelectorAll('[data-decision]').forEach(button => button.addEventListener('click', () => {
    const decision = button.dataset.decision;
    const messages = { accept: 'Action confirmed — protected block and draft created', adjust: 'Recommendation opened for adjustment', reject: 'Recommendation rejected — no action taken' };
    button.closest('.decision-request').classList.add(`decision-${decision}`); showToast(messages[decision]);
  }));
  document.querySelectorAll('.context-section button').forEach(button => button.addEventListener('click', () => showToast(`${button.textContent.trim()} details opened`)));

  setupButton.addEventListener('click', openOnboarding);
  document.getElementById('onboardingClose').addEventListener('click', closeOnboarding);
  onboardingBack.addEventListener('click', () => { if (state.onboardingStep > 0) { state.onboardingStep -= 1; renderOnboarding(); } });
  onboardingNext.addEventListener('click', () => {
    if (state.onboardingStep < 3) { state.onboardingStep += 1; renderOnboarding(); }
    else { closeOnboarding(); showToast('First-value setup saved — connect real data when ready'); }
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
  const storedCalendarTasks = readPersisted('calendarTasks', 'weeple-calendar-tasks', []);
  if (Array.isArray(storedCalendarTasks)) calendarUserTasks = storedCalendarTasks;

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
  // Day-state accents keep the carousel easy to scan without coloring the
  // surrounding Overview background.
  const calendarCardColors = {
    past: '100,116,139',
    today: '255,107,44',
    upcoming: '139,92,246'
  };

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
    writePersisted('calendarTasks', 'weeple-calendar-tasks', calendarUserTasks);
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
        : Math.abs(date.getDate() + date.getMonth()) % sideDayStories.length;
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
      // A day should reflect its actual assignments. Do not pad it with demo
      // entries or truncate it to three items: some days are empty and busy
      // days need to expose every task.
      const agenda = [...linkedTasks, ...addedTasks, ...goalAgenda].sort((a, b) => {
        const aTime = /^\d{2}:\d{2}$/.test(a.timelineTime || '') ? a.timelineTime : '99:99';
        const bTime = /^\d{2}:\d{2}$/.test(b.timelineTime || '') ? b.timelineTime : '99:99';
        return aTime.localeCompare(bTime);
      });
      const agendaCount = agenda.length;
      // Keep adjacent day cards visually distinct. Goal accents belong to the
      // agenda item inside the card, not to the calendar day itself.
      const cardRgb = isToday
        ? calendarCardColors.today
        : isPast
          ? calendarCardColors.past
          : calendarCardColors.upcoming;
      // Side cards describe the day state. Scheduled goals remain available
      // in the expanded agenda when that day moves to the center.
      const story = isFuture
        ? sideDayStories[2]
        : isPast
          ? sideDayStories[0]
          : scheduledGoals.length
            ? { label: 'GOAL SCHEDULED', detail: scheduledGoals[0].goal.title, badge: scheduledGoals[0].goal.scheduledTime || 'Open goal', icon: 'target' }
            : sideDayStories[setIndex];
      const storyRgb = isPast ? '16,185,129' : isFuture ? '139,92,246' : cardRgb;
      const heading = isToday
        ? `Today · ${new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(date)}`
        : new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(date);
      const card = document.createElement('article');
      card.className = `calendar-day-card ${isFuture ? 'is-upcoming' : isPast ? 'is-past' : 'is-today'}`;
      card.dataset.position = String(offset);
      card.style.setProperty('--card-rgb', cardRgb);
      card.style.setProperty('--story-rgb', storyRgb);
      card.setAttribute('aria-label', new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(date));
      card.innerHTML = `
        <header class="day-card-heading">
          <small>${offset === 0 ? `${agendaCount} ${agendaCount === 1 ? 'TASK' : 'TASKS'} SCHEDULED` : new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date).toUpperCase()}</small>
          <strong>${heading}</strong>
          <p>${agendaCount ? 'Your actions and AI work are organized by time' : 'No tasks or goals are assigned to this day'}</p>
        </header>
        <div class="side-day-overview">
          <span class="side-orb"><svg viewBox="0 0 24 24" aria-hidden="true">${calendarIcons[story.icon]}</svg></span>
          <strong>${story.label}</strong>
          <p>${story.detail}</p>
          <span>${story.badge}</span>
          ${isFuture ? '<span class="preparing-loader" aria-label="AI preparation in progress"><i></i><i></i><i></i></span>' : ''}
        </div>
        <div class="expanded-agenda">
          ${agenda.length ? agenda.map(item => {
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
          }).join('') : `
            <div class="calendar-empty-agenda">
              <span><svg viewBox="0 0 24 24" aria-hidden="true">${calendarIcons.check}</svg></span>
              <strong>Nothing scheduled</strong>
              <p>This day is clear. Add a task when you are ready.</p>
            </div>`}
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
          openPrimaryView('goals');
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
    showToast(goal && subgoal ? 'Task linked to Goal and Calendar' : owner === 'ai' ? 'AI task added to the calendar' : 'Your task was added to the calendar');
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
      if (target === 'goals') openPrimaryView('goals', false);
      if (target === 'data' || target === 'memory') openPrimaryView(target, false);
      if (target === 'calendar') {
        selectedCalendarDate = new Date(calendarReferenceDate);
        renderCalendar('left');
      }
      showToast(`${action} opened`);
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
        showToast(`${action} opened`);
      }, 540);
    });
  });
  async function startVoiceVisualization() {
    state.voiceActive = true;
    voiceButton.classList.add('active');
    voiceButton.style.color = '#8b5cf6';
    voiceButton.setAttribute('aria-pressed', 'true');
    showToast('Listening… Goal Intelligence is active');
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
      showToast('Voice visualization active in ambient mode');
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
    showToast('Voice input stopped');
  }

  voiceButton.addEventListener('click', () => {
    if (state.voiceActive) stopVoiceVisualization();
    else startVoiceVisualization();
  });
  commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && commandInput.value.trim()) {
      showToast(`Weeple is thinking about “${commandInput.value.trim().slice(0, 32)}${commandInput.value.length > 32 ? '…' : ''}”`);
      commandInput.value = '';
      toggleCommand(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && sourceInspector.classList.contains('visible')) {
      const focusable = [...sourceInspector.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter(element => element.offsetParent !== null && element !== sourceInspectorBackdrop);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first && last && event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (first && last && !event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
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
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    state.visible = !document.hidden;
    if (state.visible) startTopologyLoop();
    else stopTopologyLoop(false);
  });

  window.WeepleLegacy = Object.freeze({
    openPrimaryView,
    showToast,
    refreshCalendar: () => renderCalendar('left', false),
  });

  buildUniverse();
  applyAmbientTheme();
  resize();
  const initialHash = window.location.hash.slice(1);
  const routeAliases = { '/overview': 'overview', '/goals': 'goals', '/import-data': 'data', '/use-memory': 'memory' };
  const initialCluster = routeAliases[initialHash] || initialHash;
  if (initialCluster === 'setup') openOnboarding();
  else if (initialCluster === 'new-goal') { openPrimaryView('goals', false); openGoalCreateSheet(); }
  else if (initialCluster === 'goal-plan') { openPrimaryView('goals', false); renderGoalResultDrawer('plan'); }
  else if (initialCluster === 'connect-source') { openPrimaryView('data', false); openConnectionWizard(); }
  else if (initialCluster === 'memory-manager') { openPrimaryView('memory', false); openMemoryDrawer(); }
  else if (focusContent[initialCluster]) openPrimaryView(initialCluster, false);
  startTopologyLoop();
})();
