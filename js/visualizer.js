// Computer Science Lab Visualizer — Obafunso Ahmed Olamide Portfolio
// Implements Graph Traversal (Dijkstra, A*, BFS) & Algorithm Sorting Visualizers

(function() {
  'use strict';

  // --- TAB NAVIGATION ---
  const labTabs = document.querySelectorAll('.lab-tab');
  const labPanels = document.querySelectorAll('.lab-panel');

  labTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      labTabs.forEach(t => t.classList.remove('active'));
      labPanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  // ==========================================
  // 1. PATHFINDING & GRAPH TRAVERSAL LAB
  // ==========================================
  const COLS = window.innerWidth < 768 ? 20 : 28;
  const ROWS = 14;
  let grid = [];
  let isMousePressed = false;
  let isRunningPath = false;

  const START_NODE = { r: 6, c: 3 };
  const TARGET_NODE = { r: 6, c: COLS - 4 };

  const gridContainer = document.getElementById('pathGrid');
  const runPathBtn = document.getElementById('runPathBtn');
  const clearPathBtn = document.getElementById('clearPathBtn');
  const generateMazeBtn = document.getElementById('generateMazeBtn');
  const pathAlgoSelect = document.getElementById('pathAlgoSelect');
  const statNodesVisited = document.getElementById('statNodesVisited');
  const statPathLength = document.getElementById('statPathLength');
  const statExecTime = document.getElementById('statExecTime');
  const statComplexity = document.getElementById('statComplexity');

  function initGrid() {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${COLS}, ${window.innerWidth < 768 ? '15px' : '18px'})`;
    grid = [];

    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        const isStart = r === START_NODE.r && c === START_NODE.c;
        const isTarget = r === TARGET_NODE.r && c === TARGET_NODE.c;

        if (isStart) cell.classList.add('start');
        if (isTarget) cell.classList.add('target');

        cell.addEventListener('mousedown', (e) => {
          e.preventDefault();
          if (isRunningPath || isStart || isTarget) return;
          isMousePressed = true;
          cell.classList.toggle('wall');
        });

        cell.addEventListener('mouseenter', () => {
          if (!isMousePressed || isRunningPath || isStart || isTarget) return;
          cell.classList.toggle('wall');
        });

        gridContainer.appendChild(cell);
        row.push({
          r, c,
          isStart,
          isTarget,
          isWall: false,
          distance: Infinity,
          heuristic: 0,
          totalCost: Infinity,
          visited: false,
          previous: null,
          element: cell
        });
      }
      grid.push(row);
    }
  }

  window.addEventListener('mouseup', () => {
    isMousePressed = false;
  });

  function clearGrid(keepWalls = false) {
    if (isRunningPath) return;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const node = grid[r][c];
        node.distance = Infinity;
        node.heuristic = 0;
        node.totalCost = Infinity;
        node.visited = false;
        node.previous = null;

        const cell = node.element;
        cell.classList.remove('visited', 'path');
        if (!keepWalls && !node.isStart && !node.isTarget) {
          cell.classList.remove('wall');
          node.isWall = false;
        } else if (cell.classList.contains('wall')) {
          node.isWall = true;
        }
      }
    }
    if (statNodesVisited) statNodesVisited.textContent = '0';
    if (statPathLength) statPathLength.textContent = '0';
    if (statExecTime) statExecTime.textContent = '0ms';
  }

  function generateRandomMaze() {
    if (isRunningPath) return;
    clearGrid(false);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const node = grid[r][c];
        if (!node.isStart && !node.isTarget) {
          // Generate organic wall clusters with 28% density
          if (Math.random() < 0.28) {
            node.isWall = true;
            node.element.classList.add('wall');
          }
        }
      }
    }
  }

  async function runPathfinding() {
    if (isRunningPath) return;
    isRunningPath = true;
    clearGrid(true);

    const algo = pathAlgoSelect.value;
    const startTime = performance.now();

    let visitedInOrder = [];
    let endNode = null;

    if (algo === 'dijkstra') {
      if (statComplexity) statComplexity.textContent = 'O(E + V log V)';
      visitedInOrder = runDijkstra();
    } else if (algo === 'astar') {
      if (statComplexity) statComplexity.textContent = 'O(E) heuristic';
      visitedInOrder = runAStar();
    } else {
      if (statComplexity) statComplexity.textContent = 'O(V + E)';
      visitedInOrder = runBFS();
    }

    endNode = grid[TARGET_NODE.r][TARGET_NODE.c];

    // Animate visited nodes
    for (let i = 0; i < visitedInOrder.length; i++) {
      const node = visitedInOrder[i];
      if (!node.isStart && !node.isTarget) {
        node.element.classList.add('visited');
      }
      if (statNodesVisited) statNodesVisited.textContent = (i + 1).toString();
      await sleep(15);
    }

    const elapsed = Math.round(performance.now() - startTime);
    if (statExecTime) statExecTime.textContent = `${elapsed}ms`;

    // Reconstruct path
    const shortestPath = [];
    let current = endNode.previous;
    while (current && !current.isStart) {
      shortestPath.unshift(current);
      current = current.previous;
    }

    if (shortestPath.length > 0 || endNode.previous) {
      for (let i = 0; i < shortestPath.length; i++) {
        shortestPath[i].element.classList.add('path');
        if (statPathLength) statPathLength.textContent = (i + 1).toString();
        await sleep(30);
      }
    } else {
      if (statPathLength) statPathLength.textContent = 'Unreachable';
    }

    isRunningPath = false;
  }

  function getNeighbors(node) {
    const neighbors = [];
    const { r, c } = node;
    const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of deltas) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        neighbors.push(grid[nr][nc]);
      }
    }
    return neighbors;
  }

  function runBFS() {
    const visited = [];
    const queue = [grid[START_NODE.r][START_NODE.c]];
    grid[START_NODE.r][START_NODE.c].visited = true;

    while (queue.length > 0) {
      const current = queue.shift();
      visited.push(current);
      if (current.isTarget) break;

      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!neighbor.visited && !neighbor.isWall && !neighbor.element.classList.contains('wall')) {
          neighbor.visited = true;
          neighbor.previous = current;
          queue.push(neighbor);
        }
      }
    }
    return visited;
  }

  function runDijkstra() {
    const visited = [];
    const unvisited = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        unvisited.push(grid[r][c]);
      }
    }
    grid[START_NODE.r][START_NODE.c].distance = 0;

    while (unvisited.length > 0) {
      unvisited.sort((a, b) => a.distance - b.distance);
      const closest = unvisited.shift();
      if (closest.distance === Infinity) break;
      if (closest.isWall || closest.element.classList.contains('wall')) continue;

      closest.visited = true;
      visited.push(closest);
      if (closest.isTarget) break;

      const neighbors = getNeighbors(closest);
      for (const neighbor of neighbors) {
        if (!neighbor.visited) {
          const newDist = closest.distance + 1;
          if (newDist < neighbor.distance) {
            neighbor.distance = newDist;
            neighbor.previous = closest;
          }
        }
      }
    }
    return visited;
  }

  function manhattanDistance(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  }

  function runAStar() {
    const visited = [];
    const openSet = [grid[START_NODE.r][START_NODE.c]];
    grid[START_NODE.r][START_NODE.c].distance = 0;
    grid[START_NODE.r][START_NODE.c].heuristic = manhattanDistance(START_NODE, TARGET_NODE);
    grid[START_NODE.r][START_NODE.c].totalCost = grid[START_NODE.r][START_NODE.c].heuristic;

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.totalCost - b.totalCost);
      const current = openSet.shift();
      current.visited = true;
      visited.push(current);

      if (current.isTarget) break;

      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        if (neighbor.visited || neighbor.isWall || neighbor.element.classList.contains('wall')) continue;

        const tentativeDist = current.distance + 1;
        if (tentativeDist < neighbor.distance) {
          neighbor.previous = current;
          neighbor.distance = tentativeDist;
          neighbor.heuristic = manhattanDistance(neighbor, TARGET_NODE);
          neighbor.totalCost = neighbor.distance + neighbor.heuristic;

          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    return visited;
  }

  // ==========================================
  // 2. SORTING ALGORITHM BENCHMARK LAB
  // ==========================================
  const sortCanvas = document.getElementById('sortCanvas');
  const runSortBtn = document.getElementById('runSortBtn');
  const resetSortBtn = document.getElementById('resetSortBtn');
  const sortAlgoSelect = document.getElementById('sortAlgoSelect');
  const sortArraySize = document.getElementById('sortArraySize');
  const statComparisons = document.getElementById('statComparisons');
  const statSwaps = document.getElementById('statSwaps');
  const statSortComplexity = document.getElementById('statSortComplexity');

  let sortArray = [];
  let isSorting = false;
  let comparisonsCount = 0;
  let swapsCount = 0;

  function initSortArray() {
    if (!sortCanvas) return;
    isSorting = false;
    comparisonsCount = 0;
    swapsCount = 0;
    if (statComparisons) statComparisons.textContent = '0';
    if (statSwaps) statSwaps.textContent = '0';

    const size = parseInt(sortArraySize.value, 10) || 28;
    sortArray = [];
    sortCanvas.innerHTML = '';

    for (let i = 0; i < size; i++) {
      const val = Math.floor(Math.random() * 90) + 10;
      sortArray.push(val);

      const bar = document.createElement('div');
      bar.className = 'sort-bar';
      bar.style.height = `${(val / 100) * 220}px`;
      bar.dataset.index = i;
      sortCanvas.appendChild(bar);
    }
  }

  async function runSort() {
    if (isSorting) return;
    isSorting = true;
    comparisonsCount = 0;
    swapsCount = 0;
    const algo = sortAlgoSelect.value;
    const bars = document.querySelectorAll('.sort-bar');

    bars.forEach(b => b.classList.remove('sorted', 'active'));

    if (algo === 'quicksort') {
      if (statSortComplexity) statSortComplexity.textContent = 'O(N log N)';
      await quickSort(0, sortArray.length - 1, bars);
    } else if (algo === 'mergesort') {
      if (statSortComplexity) statSortComplexity.textContent = 'O(N log N)';
      await mergeSort(0, sortArray.length - 1, bars);
    } else if (algo === 'heapsort') {
      if (statSortComplexity) statSortComplexity.textContent = 'O(N log N)';
      await heapSort(bars);
    } else {
      if (statSortComplexity) statSortComplexity.textContent = 'O(N²)';
      await bubbleSort(bars);
    }

    // Mark all as sorted
    for (let i = 0; i < bars.length; i++) {
      bars[i].classList.add('sorted');
      await sleep(15);
    }
    isSorting = false;
  }

  async function bubbleSort(bars) {
    const n = sortArray.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isSorting) return;
        comparisonsCount++;
        if (statComparisons) statComparisons.textContent = comparisonsCount;

        bars[j].classList.add('active');
        bars[j + 1].classList.add('active');
        await sleep(25);

        if (sortArray[j] > sortArray[j + 1]) {
          swapsCount++;
          if (statSwaps) statSwaps.textContent = swapsCount;
          swap(j, j + 1, bars);
        }

        bars[j].classList.remove('active');
        bars[j + 1].classList.remove('active');
      }
    }
  }

  async function quickSort(low, high, bars) {
    if (low < high) {
      const pi = await partition(low, high, bars);
      await quickSort(low, pi - 1, bars);
      await quickSort(pi + 1, high, bars);
    }
  }

  async function partition(low, high, bars) {
    const pivot = sortArray[high];
    bars[high].classList.add('active');
    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisonsCount++;
      if (statComparisons) statComparisons.textContent = comparisonsCount;
      bars[j].classList.add('active');
      await sleep(20);

      if (sortArray[j] < pivot) {
        i++;
        swapsCount++;
        if (statSwaps) statSwaps.textContent = swapsCount;
        swap(i, j, bars);
      }
      bars[j].classList.remove('active');
    }
    swapsCount++;
    if (statSwaps) statSwaps.textContent = swapsCount;
    swap(i + 1, high, bars);
    bars[high].classList.remove('active');
    return i + 1;
  }

  async function heapSort(bars) {
    const n = sortArray.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(n, i, bars);
    }
    for (let i = n - 1; i > 0; i--) {
      swapsCount++;
      if (statSwaps) statSwaps.textContent = swapsCount;
      swap(0, i, bars);
      await heapify(i, 0, bars);
    }
  }

  async function heapify(n, i, bars) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      comparisonsCount++;
      if (sortArray[left] > sortArray[largest]) largest = left;
    }
    if (right < n) {
      comparisonsCount++;
      if (sortArray[right] > sortArray[largest]) largest = right;
    }
    if (statComparisons) statComparisons.textContent = comparisonsCount;

    if (largest !== i) {
      swapsCount++;
      if (statSwaps) statSwaps.textContent = swapsCount;
      bars[i].classList.add('active');
      bars[largest].classList.add('active');
      await sleep(20);
      swap(i, largest, bars);
      bars[i].classList.remove('active');
      bars[largest].classList.remove('active');
      await heapify(n, largest, bars);
    }
  }

  async function mergeSort(l, r, bars) {
    if (l >= r) return;
    const m = Math.floor(l + (r - l) / 2);
    await mergeSort(l, m, bars);
    await mergeSort(m + 1, r, bars);
    await merge(l, m, r, bars);
  }

  async function merge(l, m, r, bars) {
    const n1 = m - l + 1;
    const n2 = r - m;
    const L = [];
    const R = [];

    for (let i = 0; i < n1; i++) L.push(sortArray[l + i]);
    for (let j = 0; j < n2; j++) R.push(sortArray[m + 1 + j]);

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
      comparisonsCount++;
      if (statComparisons) statComparisons.textContent = comparisonsCount;
      bars[k].classList.add('active');
      await sleep(20);

      if (L[i] <= R[j]) {
        sortArray[k] = L[i];
        bars[k].style.height = `${(L[i] / 100) * 220}px`;
        i++;
      } else {
        sortArray[k] = R[j];
        bars[k].style.height = `${(R[j] / 100) * 220}px`;
        j++;
      }
      swapsCount++;
      if (statSwaps) statSwaps.textContent = swapsCount;
      bars[k].classList.remove('active');
      k++;
    }

    while (i < n1) {
      sortArray[k] = L[i];
      bars[k].style.height = `${(L[i] / 100) * 220}px`;
      i++;
      k++;
      await sleep(10);
    }

    while (j < n2) {
      sortArray[k] = R[j];
      bars[k].style.height = `${(R[j] / 100) * 220}px`;
      j++;
      k++;
      await sleep(10);
    }
  }

  function swap(i, j, bars) {
    const temp = sortArray[i];
    sortArray[i] = sortArray[j];
    sortArray[j] = temp;

    bars[i].style.height = `${(sortArray[i] / 100) * 220}px`;
    bars[j].style.height = `${(sortArray[j] / 100) * 220}px`;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- ATTACH EVENT LISTENERS ---
  if (runPathBtn) runPathBtn.addEventListener('click', runPathfinding);
  if (clearPathBtn) clearPathBtn.addEventListener('click', () => clearGrid(false));
  if (generateMazeBtn) generateMazeBtn.addEventListener('click', generateRandomMaze);

  if (runSortBtn) runSortBtn.addEventListener('click', runSort);
  if (resetSortBtn) resetSortBtn.addEventListener('click', initSortArray);
  if (sortArraySize) sortArraySize.addEventListener('change', initSortArray);

  // Initialize upon DOM readiness
  document.addEventListener('DOMContentLoaded', () => {
    initGrid();
    initSortArray();
  });

})();
