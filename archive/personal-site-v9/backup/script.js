window.onload = function() {
    console.log("Gabriel Ong's Personal Site v9 - Loaded!");
    loadProjects();
    setupCurrentYear();

    // Toggle functionality
    const crt = document.querySelector('.crt');
    const vignette = document.querySelector('.vignette');
    const backgroundCanvas = document.querySelector(".background");
    const body = document.body;

    const crtToggle = document.getElementById('crtToggle');
    const vignetteToggle = document.getElementById('vignetteToggle');
    const backgroundToggle = document.getElementById('backgroundToggle');
    const colorToggle = document.getElementById('colorToggle');

    // Check if localStorage is available
    const hasLocalStorage = typeof (Storage) !== "undefined";

    // Load saved preferences
    let savedCRT = true;
    let savedVignette = true;
    let savedBackground = true;
    let savedColorTheme = 'default';

    if (hasLocalStorage) {
        savedCRT = localStorage.getItem('crt-enabled') !== 'false';
        savedVignette = localStorage.getItem('vignette-enabled') !== 'false';
        savedBackground = localStorage.getItem('background-enabled') !== 'false';
        savedColorTheme = localStorage.getItem('color-theme') || 'default';
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

    // Apply saved color theme
    applyColorTheme(savedColorTheme);

    // Color themes
    const colorThemes = ['default', 'ocean', 'sunset', 'forest', 'cyberpunk'];
    let currentColorIndex = colorThemes.indexOf(savedColorTheme);

    // Event listeners
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

    colorToggle.addEventListener('click', () => {
        currentColorIndex = (currentColorIndex + 1) % colorThemes.length;
        const newTheme = colorThemes[currentColorIndex];
        applyColorTheme(newTheme);

        if (hasLocalStorage) {
            localStorage.setItem('color-theme', newTheme);
        }

        // Provide visual feedback
        showColorChangeNotification(newTheme);
    });

    function applyColorTheme(theme) {
        // Remove all existing color theme classes
        colorThemes.forEach(t => {
            body.classList.remove(`color-theme-${t}`);
        });

        // Add the new theme class
        body.classList.add(`color-theme-${theme}`);

        // Update button text to show current theme
        colorToggle.textContent = `Color: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
    }

    function showColorChangeNotification(theme) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.textContent = `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-color);
            color: var(--base-color);
            padding: 8px 16px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 0.8rem;
            font-weight: bold;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 1500);
    }

    // Animated background functionality
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
                        // Use current theme accent color for particles
                        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
                        ctx.fillStyle = Math.random() > 0.5 ? accentColor : "#232136";
                        ctx.beginPath();
                        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, 2 * Math.PI);
                        ctx.fill();
                    }

                    ctx.fillStyle = "rgba(13, 14, 21, 0.05)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                };
            }
        }

        animationFrameId = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawBackground();

    // Projects loading functionality
    async function loadProjects() {
        const loadingEl = document.getElementById('projects-loading');
        const errorEl = document.getElementById('projects-error');
        const tableEl = document.getElementById('projects-table');
        const tbodyEl = document.getElementById('projects-tbody');

        try {
            loadingEl.style.display = 'block';
            errorEl.style.display = 'none';
            tableEl.style.display = 'none';

            // Simulate loading Gabriel's projects from GitHub API or static data
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

            // Gabriel's featured projects from his live site
            const projects = [
                {
                    name: "yuho",
                    description: "Domain-specific language for Singapore Criminal Law",
                    url: "https://github.com/gongahkia/yuho",
                    status: "ACTIVE",
                    techStack: ["Python", "DSL", "Legal Tech"],
                    updatedAt: "2024-12-01"
                },
                {
                    name: "sea-kayak",
                    description: "Singapore's Daily Legal Updates Web App",
                    url: "https://github.com/gongahkia/sea-kayak",
                    status: "ACTIVE",
                    techStack: ["React", "Node.js", "Web Scraping"],
                    updatedAt: "2024-11-28"
                },
                {
                    name: "skill-hunter",
                    description: "SSO Legislation Browser Extension",
                    url: "https://github.com/gongahkia/skill-hunter",
                    status: "ACTIVE",
                    techStack: ["JavaScript", "Chrome Extension", "Legal"],
                    updatedAt: "2024-11-15"
                },
                {
                    name: "dc4u",
                    description: "Markup language for Charge Sheet Drafting",
                    url: "https://github.com/gongahkia/dc4u",
                    status: "ACTIVE",
                    techStack: ["Python", "Legal Tech", "Markup"],
                    updatedAt: "2024-10-20"
                },
                {
                    name: "jikai",
                    description: "Tort Law hypothetical Generation Model",
                    url: "https://github.com/gongahkia/jikai",
                    status: "ACTIVE",
                    techStack: ["Python", "ML", "Legal"],
                    updatedAt: "2024-10-10"
                },
                {
                    name: "judgeman",
                    description: "eLitigation Case Brief Browser Extension",
                    url: "https://github.com/gongahkia/judgeman",
                    status: "ACTIVE",
                    techStack: ["JavaScript", "Chrome Extension"],
                    updatedAt: "2024-09-25"
                },
                {
                    name: "modo-app",
                    description: "Social Media Web App for Niche Communities",
                    url: "https://github.com/gongahkia/modo-app",
                    status: "ARCHIVED",
                    techStack: ["React", "Node.js", "Social"],
                    updatedAt: "2024-08-15"
                },
                {
                    name: "netero",
                    description: "Blockchain-powered Voting Platform",
                    url: "https://github.com/gongahkia/netero",
                    status: "MAINTENANCE",
                    techStack: ["Blockchain", "Voting", "Web3"],
                    updatedAt: "2024-07-30"
                },
                {
                    name: "uzu",
                    description: "Legal Case Summaries Browser Extension",
                    url: "https://github.com/gongahkia/uzu",
                    status: "ACTIVE",
                    techStack: ["JavaScript", "Legal Tech"],
                    updatedAt: "2024-07-12"
                }
            ];

            // Clear existing content
            tbodyEl.innerHTML = '';

            // Populate projects
            projects.forEach(project => {
                const row = document.createElement('tr');

                // Format date
                const date = new Date(project.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                });

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

            const errorMessage = errorEl.querySelector('p');
            errorMessage.textContent = `Error: ${error.message} `;
        }
    }

    // Retry functionality
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', loadProjects);
    }

    // Setup current year
    function setupCurrentYear() {
        const currentYear = new Date().getFullYear();
        const yearElement = document.querySelector("#current-year");
        if (yearElement) {
            yearElement.textContent = currentYear;
        }
    }
};