/**
 * Advanced Anti-Screenshot & Anti-Screen-Recording Protection Layer
 * EFV Security System v1.0
 */

class EFVSecurity {
    constructor() {
        this.isActive = false; // Security is OFF by default, enabled only during reading/listening
        this.isProtected = false;
        this.isTampered = false;
        this.userId = 'N/A';
        this.userName = 'User';
        this.userEmail = 'N/A';
        this.userIP = '0.0.0.0';
        this.lastFocusTime = Date.now();
        this.watermarkInterval = null;
        this.captureCheckInterval = null;

        this.init();
    }

    applyWatermark(container) {
        if (!container) return;
        const text = `${this.userEmail} | ${this.userId} | ${new Date().toLocaleDateString()}`;
        const wm = document.createElement('div');
        wm.className = 'security-item-watermark';
        wm.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); opacity:0.1; pointer-events:none; font-size:24px; font-weight:bold; color:gold; white-space:nowrap; z-index:1000;';
        wm.textContent = text;
        container.appendChild(wm);
    }

    async init() {
        console.log("🔒 EFV Security Layer Initializing...");

        // 1. Load User Data
        this.loadUserData();

        // 2. Setup UI Elements
        this.setupUI();

        // 3. Start Protection Mechanisms
        this.preventInteractions();
        this.detectShortcuts();
        this.detectDevTools();
        this.detectScreenCapture();
        this.handleVisibility();

        // 4. Start Watermark
        this.startWatermark();

        // 5. Try to get IP (Optional but requested)
        this.fetchIP();

        console.log("✅ EFV Security Layer Initialized (Standby).");
    }

    enable() {
        console.log("🛡️ EFV Security: ACTIVATING PROTECTION");
        this.isActive = true;
        this.isProtected = true;

        // Show watermark
        const wmContainer = document.getElementById('security-watermark-container');
        if (wmContainer) wmContainer.style.display = 'block';
    }

    disable() {
        console.log("🔓 EFV Security: DEACTIVATING PROTECTION");
        this.isActive = false;
        this.isProtected = false;

        // Hide watermark
        const wmContainer = document.getElementById('security-watermark-container');
        if (wmContainer) wmContainer.style.display = 'none';

        // If we were in a blur state, clear it
        this.unlockContent();
    }

    loadUserData() {
        const user = JSON.parse(localStorage.getItem('efv_user') || '{}');
        this.userId = user._id || user.id || 'N/A';
        this.userName = user.name || 'Anonymous';
        this.userEmail = user.email || 'N/A';
    }

    async fetchIP() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            this.userIP = data.ip;
            this.updateWatermark(); // Refresh with real IP
        } catch (e) {
            console.warn("Could not fetch IP for watermark.");
        }
    }

    setupUI() {
        // Create Overlay if not exists
        if (!document.getElementById('security-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'security-overlay';
            overlay.innerHTML = `
                <div class="security-lock-icon"><i class="fas fa-user-shield"></i></div>
                <h1>Security Policy Violation Detected</h1>
                <p>Unauthorized screen capture, recording, or inspection is strictly prohibited.</p>
                <div class="security-meta">
                    Event Logged: ${new Date().toLocaleString()}<br>
                    User ID: ${this.userId}
                </div>
                <button onclick="location.reload()" class="security-retry-btn">Restore Session</button>
            `;
            document.body.appendChild(overlay);
        }

        // Create Watermark Container
        if (!document.getElementById('security-watermark-container')) {
            const wmContainer = document.createElement('div');
            wmContainer.id = 'security-watermark-container';
            wmContainer.style.display = 'none'; // Hidden by default
            document.body.appendChild(wmContainer);
        }

        // Create Security Shield (Physical block on top of content)
        if (!document.getElementById('security-shield')) {
            const shield = document.createElement('div');
            shield.id = 'security-shield';
            shield.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:black; z-index:999997; display:none; opacity:0; pointer-events:none; transition: opacity 0.1s ease-in-out;';
            document.body.appendChild(shield);
        }

        // Add Global CSS for blur/protection
        const style = document.createElement('style');
        style.textContent = `
            .security-locked #particles-js, 
            .security-locked main, 
            .security-locked header, 
            .security-locked section, 
            .security-locked nav, 
            .security-locked footer {
                filter: blur(40px) brightness(0.4) sepia(1) hue-rotate(-50deg) !important;
                pointer-events: none !important;
                user-select: none !important;
            }
            .watermark-item {
                opacity: 0.25 !important; /* Made it more visible */
                color: rgba(212, 175, 55, 0.4) !important;
            }
            .security-locked #security-overlay {
                display: flex !important;
                background: radial-gradient(circle at center, rgba(80, 0, 0, 0.98), rgba(0, 0, 0, 0.98));
                border-top: 8px solid #ff4d4d;
                opacity: 1;
            }
            .security-locked-blank {
                display: block !important;
                background: black !important;
            }
            .security-locked-blank > *:not(#security-overlay):not(#security-watermark-container) {
                display: none !important;
            }
            .security-blur #security-shield {
                display: block !important;
                opacity: 1 !important;
                pointer-events: all !important;
                transition: none !important;
            }
            .security-blur main, 
            .security-blur header, 
            .security-blur section, 
            .security-blur nav, 
            .security-blur footer,
            .security-blur .reader-overlay {
                filter: blur(100px) !important;
                opacity: 0 !important;
                display: none !important;
            }
            .security-retry-btn {
                margin-top: 2rem;
                padding: 12px 30px;
                background: transparent;
                border: 2px solid #ff4d4d;
                color: #ff4d4d;
                border-radius: 30px;
                cursor: pointer;
                text-transform: uppercase;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .security-retry-btn:hover {
                background: #ff4d4d;
                color: white;
            }
            .security-lock-icon {
                font-size: 5rem;
                margin-bottom: 1.5rem;
                animation: security-pulse 2s infinite;
            }
            @keyframes security-pulse {
                0% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }

    preventInteractions() {
        // Block Right Click -> Trigger Violation
        document.addEventListener('contextmenu', e => {
            if (this.isProtected) {
                e.preventDefault();
                this.triggerViolation("Right Click Attempt (Blocked)");
            }
        });

        // Block Text Selection & Copy
        document.addEventListener('copy', e => {
            if (this.isProtected) {
                e.preventDefault();
                this.triggerViolation("Copy attempt (Ctrl+C)");
            }
        });

        // Block Print
        window.onbeforeprint = (e) => {
            if (this.isProtected) {
                this.triggerViolation("Print attempt");
                return false;
            }
        };
    }

    detectShortcuts() {
        window.addEventListener('keydown', e => {
            // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (View Source)
            const isInspect = (e.key === 'F12') ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'u');

            // Ctrl+P (Print)
            const isPrint = (e.ctrlKey && e.key === 'p');

            // PrintScreen Detection
            const isPrintScreen = (e.key === 'PrintScreen');

            // Windows + Shift + S / R (Snippet Tool)
            const isWinSnippet = (e.metaKey && e.shiftKey && (e.key === 'S' || e.key === 'R' || e.key === 's' || e.key === 'r'));

            // Alt + PrintScreen
            const isAltPrintScreen = (e.altKey && e.key === 'PrintScreen');

            if (isInspect) {
                e.preventDefault();
                this.triggerViolation("Inspection Tools Detected (" + e.key + ")");
            }

            if (isPrint) {
                e.preventDefault();
                this.triggerViolation("Print Shortcut Detected");
            }

            if (isPrintScreen || isAltPrintScreen || isWinSnippet) {
                e.preventDefault();
                this.lockContent("Screenshot Shortcut Detected"); // Instant blanking
                this.handlePrintScreen(isWinSnippet ? "Win+Shift+S/R Shortcut" : "PrintScreen Key");
            }
        });
    }

    handlePrintScreen(reason) {
        // Just trigger violation (Red Alert), no black screen
        console.warn(`🛡️ Security: Triggering Red Alert due to ${reason}`);
        this.triggerViolation(`Screen Capture Attempt Detected (${reason})`);
    }

    detectDevTools() {
        // Trick 1: Window size difference
        const threshold = 160;
        setInterval(() => {
            const widthDiff = window.outerWidth - window.innerWidth > threshold;
            const heightDiff = window.outerHeight - window.innerHeight > threshold;
            if (widthDiff || heightDiff) {
                this.triggerViolation("DevTools Detected (Window Geometry)");
            }
        }, 1000);

        // Trick 2: Console profiling detection
        let devtools = { open: false, orientation: null };
        const threshold2 = 160;
        const emit = (state) => { if (state) this.triggerViolation("DevTools Opened"); };

        setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold2;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold2;
            const orientation = widthThreshold ? 'vertical' : 'horizontal';

            if (!(heightThreshold && widthThreshold) &&
                ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
                if (!devtools.open || devtools.orientation !== orientation) {
                    emit(true);
                }
                devtools.open = true;
                devtools.orientation = orientation;
            } else {
                devtools.open = false;
                devtools.orientation = null;
            }
        }, 500);

        // Trick 3: Debugger loop (optional, but requested for "aggressive detection")
        // This will slow down DevTools significantly if open
        (function () {
            const detect = function () {
                const start = Date.now();
                debugger;
                const end = Date.now();
                if (end - start > 100) {
                    // console.warn("DevTools presence detected via debugger speed.");
                }
            };
            // setInterval(detect, 2000); // Disabling for now to avoid freezing helper tools unless in "Super Aggressive" mode
        })();

        // Trick 4: Element ID trick
        const div = document.createElement('div');
        Object.defineProperty(div, 'id', {
            get: () => {
                this.triggerViolation("DevTools Inspection Attempt (Element ID Getter)");
                return 'security-check';
            }
        });
        // console.log(div); // This triggers if console is open and elements are inspected
    }

    detectScreenCapture() {
        // Monitoring display-capture API usage if possible
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
            navigator.mediaDevices.getDisplayMedia = (constraints) => {
                this.triggerViolation("Unauthorized getDisplayMedia request");
                return Promise.reject(new Error("Security Policy: Screen capture is disabled."));
            };
        }
    }

    handleVisibility() {
        // 1. Sudden blur events -> Trigger Violation
        window.addEventListener('blur', () => {
            this.lastFocusTime = Date.now();
            this.triggerViolation("Window Focus Lost");
        });

        window.addEventListener('focus', () => {
            const now = Date.now();
            const focusGap = now - this.lastFocusTime;

            if (focusGap < 800 && focusGap > 50) {
                this.triggerViolation("Rapid Focus Loss/Return (Snipping Tool)");
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.triggerViolation("Tab Hidden/Changed");
            }
        });

        // 2. Mouse Leave Detection -> Trigger Violation
        document.addEventListener('mouseleave', () => {
            if (this.isProtected) this.triggerViolation("Cursor Left Window Boundary");
        });

        // 3. Aggressive Focus Polling -> Trigger Violation
        setInterval(() => {
            if (!document.hasFocus() && this.isProtected && !this.isTampered) {
                this.triggerViolation("Focus Polling (Lost)");
            }
        }, 50);

        // 4. Window Resize Detection -> Trigger Violation
        let lastSize = { w: window.innerWidth, h: window.innerHeight };
        window.addEventListener('resize', () => {
            const dw = Math.abs(window.innerWidth - lastSize.w);
            const dh = Math.abs(window.innerHeight - lastSize.h);
            if (dw > 5 || dh > 5) {
                this.triggerViolation("Window Size Tampered");
                lastSize = { w: window.innerWidth, h: window.innerHeight };
            }
        });
    }

    lockContent(reason) {
        // console.log("🔒 Locking content: " + reason);
        document.body.classList.add('security-blur');
        this.pauseMedia();

        // If it's a hard event like blur, we might want to trigger violation if it happens too many times
        if (reason === 'Window Blur' || reason === 'Focus Polling') {
            // We just blur for now to avoid false positives, but keep it tight
        }
    }

    unlockContent() {
        if (this.isTampered) return;
        document.body.classList.remove('security-blur');
    }

    pauseMedia() {
        const media = document.querySelectorAll('video, audio');
        media.forEach(m => {
            try { m.pause(); } catch (e) { }
        });
    }

    startWatermark() {
        this.updateWatermark();
        this.watermarkInterval = setInterval(() => {
            this.updateWatermark();
        }, 2000);
    }

    updateWatermark() {
        const container = document.getElementById('security-watermark-container');
        if (!container) return;

        container.innerHTML = '';
        const timestamp = new Date().toLocaleTimeString();
        const partialIP = this.userIP.split('.').slice(0, 3).join('.') + '.*';
        const text = `${this.userName} | ${this.userEmail} | ${timestamp} | IP: ${partialIP}`;

        // Fill the screen with diagonal watermarks - increased density
        const rows = 15; // Increased
        const cols = 8;  // Increased
        const spacingH = 100 / cols;
        const spacingV = 100 / rows;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const item = document.createElement('div');
                item.className = 'watermark-item';
                item.textContent = text;
                item.style.top = `${(i * spacingV) - 2}%`;
                item.style.left = `${(j * spacingH) - 5}%`;
                // Add jitter to prevent easy algorithmic removal
                item.style.paddingLeft = `${Math.random() * 20}px`;
                container.appendChild(item);
            }
        }
    }

    triggerViolation(reason) {
        if (!this.isActive) return; // Only trigger if actively protecting content
        if (this.isTampered) return; // Don't trigger multiple alerts

        console.error(`🚨 SECURITY VIOLATION: ${reason}`);
        this.isTampered = true;

        // Log to backend (Mock)
        this.logViolation(reason);

        // Instantly: Blank everything, Blur, Red Alert Overlay, Stop Media
        document.body.classList.add('security-locked', 'security-locked-blank');
        this.pauseMedia();

        // Dispatch event for other modules to react (e.g. destroy buffers)
        window.dispatchEvent(new CustomEvent('efv-security-violation', { detail: { reason } }));

        // Destroy sensitive data from memory if possible (clobbering localStorage parts)
        // localStorage.removeItem('efv_token'); // Aggressive - maybe too much for simple blur?

        // Hide protected components (those with .protected-content)
        document.querySelectorAll('.protected-content').forEach(el => {
            el.style.display = 'none';
        });

        if (reason.includes("Inspect")) {
            // Optional: Infinite debugger loop to freeze devtools
            // setInterval(() => { debugger; }, 100); 
        }
    }

    logViolation(reason) {
        const logData = {
            userId: this.userId,
            userName: this.userName,
            email: this.userEmail,
            ip: this.userIP,
            timestamp: new Date().toISOString(),
            reason: reason,
            userAgent: navigator.userAgent
        };
        console.table(logData);
        // fetch('/api/security/log', { method: 'POST', body: JSON.stringify(logData) });
    }
}

// Initialize on Load
window.efvSecurity = new EFVSecurity();
