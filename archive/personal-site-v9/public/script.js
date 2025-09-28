window.onload = function() {
    console.log("Howdy")
    loadProjects();

    // Toggle functionality
    const crt = document.querySelector('.crt');
    const vignette = document.querySelector('.vignette');
    const backgroundCanvas = document.querySelector(".background");

    const crtToggle = document.getElementById('crtToggle');
    const vignetteToggle = document.getElementById('vignetteToggle');
    const backgroundToggle = document.getElementById('backgroundToggle');
    const paintToggle = document.getElementById('paintToggle');

    // Check if localStorage is available (won't work in Claude artifacts)
    const hasLocalStorage = typeof (Storage) !== "undefined";

    // Load saved preferences (fallback to defaults if localStorage unavailable)
    let savedCRT = true;
    let savedVignette = true;
    let savedBackground = true;

    if (hasLocalStorage) {
        savedCRT = localStorage.getItem('crt-enabled') !== 'false';
        savedVignette = localStorage.getItem('vignette-enabled') !== 'false';
        savedBackground = localStorage.getItem('background-enabled') !== 'false';
    }

    // Apply saved settings
    if (!savedCRT) {
        crt.classList.add('no-crt');
        crtToggle.classList.remove('active');
    }
    if (!savedVignette) {
        vignette.classList.add('no-vignette');
        vignetteToggle.classList.remove('active');
    }
    if (!savedBackground) {
        crt.classList.add('no-background');
        backgroundToggle.classList.remove('active');
    }

    crtToggle.addEventListener('click', () => {
        crt.classList.toggle('no-crt');
        crtToggle.classList.toggle('active');
        if (hasLocalStorage) {
            localStorage.setItem('crt-enabled', crtToggle.classList.contains('active'));
        }
    });

    vignetteToggle.addEventListener('click', () => {
        vignette.classList.toggle('no-vignette');
        vignetteToggle.classList.toggle('active');
        if (hasLocalStorage) {
            localStorage.setItem('vignette-enabled', vignetteToggle.classList.contains('active'));
        }
    });

    backgroundToggle.addEventListener('click', () => {
        const isActive = backgroundToggle.classList.toggle('active');
        crt.classList.toggle('no-background');
        if (hasLocalStorage) {
            localStorage.setItem('background-enabled', isActive);
        }

        if (isActive) {
            drawBackground(); // Start animation
        } else {
            cancelAnimationFrame(animationFrameId); // Stop animation
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    // Predefined pastel colorschemes
    const colorSchemes = [
        {
            name: 'purple',
            accentColor: '#BE89FF',
            redColor: '#EF798A',
            tealColor: '#D3F6DB',
            goldColor: '#FFD294',
            baseColor: '#232136',
            surface0Color: '#373F51',
            surface1Color: '#495061',
            overlayColor: '#778195',
            textColor: '#cdd6f4',
            text2Color: '#bac2de'
        },
        {
            name: 'mint',
            accentColor: '#89FFB3',
            redColor: '#FF8A9B',
            tealColor: '#D3F6F3',
            goldColor: '#FFE294',
            baseColor: '#1E3A2E',
            surface0Color: '#2F4A3D',
            surface1Color: '#405A4D',
            overlayColor: '#77957F',
            textColor: '#cdf4e0',
            text2Color: '#bad2c7'
        },
        {
            name: 'peach',
            accentColor: '#FFB389',
            redColor: '#FF8AA3',
            tealColor: '#F6F3D3',
            goldColor: '#94E2FF',
            baseColor: '#3A2E1E',
            surface0Color: '#4A3D2F',
            surface1Color: '#5A4D40',
            overlayColor: '#957F77',
            textColor: '#f4e0cd',
            text2Color: '#d2c7ba'
        },
        {
            name: 'lavender',
            accentColor: '#C089FF',
            redColor: '#FF8AD6',
            tealColor: '#E5D3F6',
            goldColor: '#94DAFF',
            baseColor: '#2E1E3A',
            surface0Color: '#3D2F4A',
            surface1Color: '#4D405A',
            overlayColor: '#8F7795',
            textColor: '#e8cdff',
            text2Color: '#d0bade'
        }
    ];

    let currentSchemeIndex = 0;

    // Helper function to convert hex to rgb
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Load saved color scheme
    if (hasLocalStorage) {
        const savedSchemeIndex = localStorage.getItem('color-scheme-index');
        if (savedSchemeIndex !== null) {
            currentSchemeIndex = parseInt(savedSchemeIndex);
        }
    }

    function applyColorScheme(scheme) {
        const root = document.documentElement;
        root.style.setProperty('--accent-color', scheme.accentColor);
        root.style.setProperty('--red-color', scheme.redColor);
        root.style.setProperty('--teal-color', scheme.tealColor);
        root.style.setProperty('--gold-color', scheme.goldColor);
        root.style.setProperty('--base-color', scheme.baseColor);
        root.style.setProperty('--surface0-color', scheme.surface0Color);
        root.style.setProperty('--surface1-color', scheme.surface1Color);
        root.style.setProperty('--overlay-color', scheme.overlayColor);
        root.style.setProperty('--text-color', scheme.textColor);
        root.style.setProperty('--text2-color', scheme.text2Color);

        // Update background color in the animated background
        const bgColorElements = document.querySelectorAll('.background');
        bgColorElements.forEach(element => {
            if (element.getContext) {
                const ctx = element.getContext('2d');
                // Update colors in the animation loop will handle this
            }
        });
    }

    // Apply initial color scheme
    applyColorScheme(colorSchemes[currentSchemeIndex]);

    paintToggle.addEventListener('click', () => {
        currentSchemeIndex = (currentSchemeIndex + 1) % colorSchemes.length;
        applyColorScheme(colorSchemes[currentSchemeIndex]);

        if (hasLocalStorage) {
            localStorage.setItem('color-scheme-index', currentSchemeIndex.toString());
        }

        paintToggle.classList.add('active');
        // Remove active class after a short delay to show the click effect
        setTimeout(() => {
            paintToggle.classList.remove('active');
        }, 150);
    });

    // Simple animated background
    const canvas = backgroundCanvas;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    const TARGET_FPS = 15;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    function drawBackground() {
        if (crt.classList.contains('no-background')) return;

        const canvas = document.querySelector(".background");
        const ctx = canvas.getContext("2d");
        canvas.width = canvas.height = 512;

        let lastRender = 0;
        let lastFrameTime = 0;

        function frame(now = performance.now()) {
            if (crt.classList.contains('no-background')) return;

            animationFrameId = requestAnimationFrame(frame);

            if (now - lastRender >= FRAME_INTERVAL) {
                const delta = (now - lastFrameTime) / 1000;
                lastFrameTime = now;
                lastRender = now;

                const img = new Image();
                img.src = ctx.canvas.toDataURL("image/jpeg", 0.75 + 0.25 * Math.sin(now / 1000));
                img.onload = () => {
                    ctx.drawImage(img, 0, delta * 32);

                    for (let i = 0; i < Math.random() * 64; i++) {
                        const currentScheme = colorSchemes[currentSchemeIndex];
                        ctx.fillStyle = Math.random() > 0.5 ? currentScheme.accentColor : currentScheme.baseColor;
                        ctx.beginPath();
                        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, 2 * Math.PI);
                        ctx.fill();
                    }

                    const currentScheme = colorSchemes[currentSchemeIndex];
                    const baseColorRgb = hexToRgb(currentScheme.baseColor);
                    ctx.fillStyle = `rgba(${baseColorRgb.r}, ${baseColorRgb.g}, ${baseColorRgb.b}, 0.05)`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                };
            }
        }

        animationFrameId = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawBackground();

    function loadProjects() {
        const loadingEl = document.getElementById('projects-loading');
        const errorEl = document.getElementById('projects-error');
        const tableEl = document.getElementById('projects-table');
        const tbodyEl = document.getElementById('projects-tbody');

        try {
            loadingEl.style.display = 'block';
            errorEl.style.display = 'none';
            tableEl.style.display = 'none';

            // Hardcoded project data
            const projects = [
                {
                    name: 'yuho',
                    description: 'Domain-specific language for Singapore Criminal Law',
                    url: 'https://github.com/gongahkia/yuho',
                    status: 'ACTIVE',
                    techStack: ['Python', 'ANTLR', 'Grammar', 'DSL']
                },
                {
                    name: 'sea-kayak',
                    description: "Singapore's Daily Legal Updates Web App",
                    url: 'https://github.com/gongahkia/sea-kayak',
                    status: 'ACTIVE',
                    techStack: ['React', 'Node.js', 'MongoDB', 'Web-scraping']
                },
                {
                    name: 'skill-hunter',
                    description: 'SSO Legislation Browser Extension',
                    url: 'https://github.com/gongahkia/skill-hunter',
                    status: 'ACTIVE',
                    techStack: ['JavaScript', 'Chrome Extension', 'API', 'Web-scraping']
                },
                {
                    name: 'dc4u',
                    description: 'Markup language for Charge Sheet Drafting',
                    url: 'https://github.com/gongahkia/dc4u',
                    status: 'ACTIVE',
                    techStack: ['Python', 'Parsing', 'Legal-tech', 'DSL']
                },
                {
                    name: 'jikai',
                    description: 'Tort Law hypothetical Generation Model',
                    url: 'https://github.com/gongahkia/jikai',
                    status: 'ACTIVE',
                    techStack: ['Python', 'NLP', 'Legal-AI', 'Machine-learning']
                },
                {
                    name: 'judgeman',
                    description: 'eLitigation Case Brief Browser Extension',
                    url: 'https://github.com/gongahkia/judgeman',
                    status: 'ACTIVE',
                    techStack: ['JavaScript', 'Chrome Extension', 'Legal-tech', 'PDF']
                },
                {
                    name: 'modo-app',
                    description: 'Social Media Web App for Niche Communities',
                    url: 'https://github.com/gongahkia/modo-app',
                    status: 'ACTIVE',
                    techStack: ['React', 'Firebase', 'Social-media', 'Real-time']
                },
                {
                    name: 'netero',
                    description: 'Blockchain-powered Voting Platform',
                    url: 'https://github.com/gongahkia/netero',
                    status: 'ACTIVE',
                    techStack: ['Solidity', 'Blockchain', 'Web3', 'Smart-contracts']
                },
                {
                    name: 'uzu',
                    description: 'Legal Case Summaries Browser Extension',
                    url: 'https://github.com/gongahkia/uzu',
                    status: 'ACTIVE',
                    techStack: ['JavaScript', 'Chrome Extension', 'AI', 'Legal-tech']
                }
            ];

            // Clear existing content
            tbodyEl.innerHTML = '';

            // Populate projects
            projects.forEach(project => {
                const row = document.createElement('tr');

                // Format date - using September 28, 2025 as requested
                const date = 'Sep 28, 2025';

                // Status badge class
                const statusClass = project.status.toLowerCase().replace('_', '-');

                // Tech stack display (limit to avoid overflow)
                const techStack = project.techStack.slice(0, 4).join(' • ');

                row.innerHTML = `
                    <td>-rwxr-xr-x</td>
                    <td>gabriel</td>
                    <td>${date}</td>
                    <td>
                        <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.name}</a>
                        <span class="status-badge status-${statusClass}">${project.status}</span><br>
                        <div class="project-description">${project.description}</div>
                        <div class="tech-stack">${techStack}</div>
                    </td>
                `;

                tbodyEl.appendChild(row);
            });

            loadingEl.style.display = 'none';
            tableEl.style.display = 'table';

        } catch (error) {
            console.error('Error loading projects:', error);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';

            // Show a more user-friendly error message
            const errorMessage = errorEl.querySelector('p');
            errorMessage.textContent = `Error: ${error.message} `;
        }
    }

    // Retry functionality
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', loadProjects);
    }

    // Set current year in footer
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

};
