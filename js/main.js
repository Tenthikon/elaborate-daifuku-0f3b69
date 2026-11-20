// Main Application Logic — Obafunso Ahmed Olamide Portfolio

(function () {
  'use strict';

  // --- MOBILE NAV TOGGLE ---
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '72px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = '#0E1626';
        navLinks.style.padding = '1.5rem';
        navLinks.style.borderBottom = '1px solid var(--border-subtle)';
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          navLinks.style.display = 'none';
        }
      });
    });
  }

  // --- ACTIVE NAVBAR LINK TRACKING ON SCROLL ---
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let currentSection = '';
    const scrollPosition = window.pageYOffset + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // --- INTERACTIVE HERO TERMINAL ---
  const heroTermBody = document.getElementById('heroTermBody');
  const heroCommands = [
    { cmd: 'whoami', output: 'Obafunso Ahmed Olamide — Computer Scientist & Systems Architect' },
    { cmd: 'cat research_kernel.h', output: 'Distributed Consensus | Algorithmic Complexity | JIT Compilation | Formal Systems' },
    { cmd: 'uname -a', output: 'OAO-Kernel 6.14.0-cs-release x86_64 SMP PREEMPT GNU/Linux [ONLINE]' },
    { cmd: 'status --uptime', output: 'All services nominal. Theoretical complexity: optimal O(log n).' }
  ];

  let currentHeroCmdIdx = 0;

  function cycleHeroTerminal() {
    if (!heroTermBody) return;
    const item = heroCommands[currentHeroCmdIdx];
    
    // Add command line
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = `
      <span class="term-prompt">olamide@research:~$</span>
      <span class="term-cmd">${item.cmd}</span>
    `;
    heroTermBody.appendChild(line);

    // Add output
    const out = document.createElement('div');
    out.className = 'term-output';
    out.innerHTML = `<span class="term-highlight">&gt;</span> ${item.output}`;
    heroTermBody.appendChild(out);

    // Keep scroll at bottom
    heroTermBody.scrollTop = heroTermBody.scrollHeight;

    // Prune if too long
    if (heroTermBody.children.length > 12) {
      heroTermBody.removeChild(heroTermBody.children[0]);
      heroTermBody.removeChild(heroTermBody.children[0]);
    }

    currentHeroCmdIdx = (currentHeroCmdIdx + 1) % heroCommands.length;
  }

  // Cycle hero terminal every 4.5 seconds
  setInterval(cycleHeroTerminal, 4500);

  // --- COMMAND PALETTE / INTERACTIVE UNIX TERMINAL ---
  const cmdModalBackdrop = document.getElementById('cmdModalBackdrop');
  const cmdModalBody = document.getElementById('cmdModalBody');
  const cmdInputField = document.getElementById('cmdInputField');
  const closeCmdBtn = document.getElementById('closeCmdBtn');
  const openCmdButtons = document.querySelectorAll('.open-terminal-btn');

  function openTerminal() {
    if (cmdModalBackdrop) {
      cmdModalBackdrop.classList.add('open');
      if (cmdInputField) {
        cmdInputField.focus();
      }
    }
  }

  function closeTerminal() {
    if (cmdModalBackdrop) {
      cmdModalBackdrop.classList.remove('open');
    }
  }

  openCmdButtons.forEach(btn => btn.addEventListener('click', openTerminal));
  if (closeCmdBtn) closeCmdBtn.addEventListener('click', closeTerminal);

  if (cmdModalBackdrop) {
    cmdModalBackdrop.addEventListener('click', (e) => {
      if (e.target === cmdModalBackdrop) closeTerminal();
    });
  }

  // Keyboard shortcut: Cmd+K or Ctrl+K or `~`
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdModalBackdrop && cmdModalBackdrop.classList.contains('open')) {
        closeTerminal();
      } else {
        openTerminal();
      }
    } else if (e.key === 'Escape' && cmdModalBackdrop && cmdModalBackdrop.classList.contains('open')) {
      closeTerminal();
    }
  });

  // Terminal command processor
  const COMMANDS = {
    help: `Available commands:
  • whoami      - Display profile information for Obafunso Ahmed Olamide
  • focus       - List core theoretical & research areas
  • projects    - View flagship computer science architectures
  • lab         - Jump straight to interactive algorithm lab
  • skills      - Output technical competence matrix
  • papers      - List published academic works & manuscripts
  • contact     - Display communication endpoints
  • clear       - Clean terminal screen
  • sudo hire   - Grant offer execution privilege`,
    whoami: `Obafunso Ahmed Olamide
Role: Computer Scientist, Systems Architect & Algorithm Engineer
Specialization: Distributed Systems, Low-Level Concurrency, Compilers & Computational Graph Optimization.
Status: Available for high-impact engineering & research collaborations.`,
    focus: `Core Research Domains:
1. Distributed Systems & Consensus Protocols (Raft, Paxos, Multi-Leader WAL)
2. Advanced Algorithms, Graph Analytics & Computational Geometry
3. JIT Compilation, SSA Bytecode Virtual Machines & Kernel Internals
4. Neural Architecture Sharding & Large-Scale Inference Acceleration`,
    projects: `Featured Flagship Systems:
1. Aether-Raft — High-throughput distributed state-machine replication engine in Rust.
2. Chronos-JIT — Dynamic JIT compiler with SSA register allocation.
3. QuantumSim-Core — Arbitrary-precision quantum state-vector simulator.
4. NeuroShard — Model-parallel parameter server for distributed transformer inference.`,
    lab: `Navigating to Interactive Computer Science Lab...`,
    skills: `Technical Matrix:
• Languages: Rust, C/C++, Go, Python, TypeScript, CUDA, x86 Assembly
• Core Systems: Linux Kernel Internals, eBPF, Distributed Storage, Memory Allocators, POSIX
• Theory: Automata, Algorithmic Complexity, Lock-Free Concurrency, State Machine Replication`,
    papers: `Academic & Technical Publications:
[1] "Optimizing Cache Locality in Lock-Free Concurrent Skip Lists" (2025)
[2] "Fault-Tolerant State Machine Replication Under Asymmetric Network Partitions" (2024)
[3] "Empirical Performance of Dynamic SSA Transformations on Edge Devices" (2023)`,
    contact: `Direct Communication:
• Email: contact@obafunso-ahmed.dev
• Location: Systems Engineering Lab
• Public Key: Available via keyserver (0x0F3B69)`,
    'sudo hire': `[PRIVILEGE GRANTED]: Welcome to the team. Routing transmission protocol to Obafunso Ahmed Olamide. Let's build remarkable computing systems together.`
  };

  if (cmdInputField && cmdModalBody) {
    cmdInputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawInput = cmdInputField.value.trim();
        const cmd = rawInput.toLowerCase();
        cmdInputField.value = '';

        if (!cmd) return;

        // Print input line
        const inputEcho = document.createElement('div');
        inputEcho.className = 'term-line';
        inputEcho.innerHTML = `<span class="term-prompt">visitor@olamide-sys:~$</span> <span class="term-cmd">${escapeHtml(rawInput)}</span>`;
        cmdModalBody.appendChild(inputEcho);

        if (cmd === 'clear') {
          cmdModalBody.innerHTML = '';
          return;
        }

        if (cmd === 'lab') {
          closeTerminal();
          const labSection = document.getElementById('cs-lab');
          if (labSection) labSection.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        const responseText = COMMANDS[cmd] || `command not found: "${escapeHtml(rawInput)}". Type 'help' for available commands.`;
        const resp = document.createElement('div');
        resp.className = 'term-output';
        resp.style.whiteSpace = 'pre-wrap';
        resp.style.paddingLeft = '0.5rem';
        resp.innerHTML = responseText;
        cmdModalBody.appendChild(resp);

        cmdModalBody.scrollTop = cmdModalBody.scrollHeight;
      }
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- CONTACT FORM AJAX HANDLER ---
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          Transmitting...
        `;
      }

      const formData = new FormData(contactForm);
      const urlEncoded = new URLSearchParams(formData).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      })
      .then(response => {
        if (response.ok) {
          window.location.href = '/thank-you';
        } else {
          // Fallback normal submission if needed
          contactForm.submit();
        }
      })
      .catch(() => {
        // Fallback standard submit
        contactForm.submit();
      });
    });
  }

  // --- UI THEME PICKER & PERSISTENCE ---
  const themeBtns = document.querySelectorAll('.theme-btn');
  const savedTheme = localStorage.getItem('oao_ui_theme') || 'emerald';

  function applyTheme(theme) {
    if (theme === 'emerald') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.setTheme === theme);
    });
    try {
      localStorage.setItem('oao_ui_theme', theme);
    } catch (_) {}
  }

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.setTheme;
      applyTheme(selected);
    });
  });

  if (savedTheme) {
    applyTheme(savedTheme);
  }

})();
