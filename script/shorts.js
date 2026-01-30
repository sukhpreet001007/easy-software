// Shorts Carousel Logic - Optimized
(function () {
    let players = [];
    let track = document.getElementById('shortsTrack');
    let container = document.querySelector('.shorts-carousel-container');

    // If essential elements are missing, exit early
    if (!track || !container) return;

    let isDragging = false;
    let startX;
    let scrollLeft;
    let animationId;
    let currentTranslate = 0;
    let speed = 2.5;
    let isHovered = false;
    let isInteracting = false;
    let interactionTimeout;
    let isAPIInjected = false;
    let hasInitialized = false;

    // Use IntersectionObserver to lazy load the API only when section is visible
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasInitialized) {
                loadYouTubeAPI();
                hasInitialized = true;
                sectionObserver.disconnect(); // Only need to load once
            }
        });
    }, { threshold: 0.1 });

    const section = document.querySelector('.shorts-section');
    if (section) sectionObserver.observe(section);

    function loadYouTubeAPI() {
        if (!window.YT) {
            // Check if another script has already requested the API
            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
            // Wait for global callback
            const existingCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function () {
                if (existingCallback) existingCallback();
                initCarousel();
            };
        } else {
            initCarousel();
        }
    }

    function initCarousel() {
        const allPlaceholders = track.querySelectorAll('[data-video-id]');

        // Limit active players to reduce WebGL context usage
        // We will only initialize players, but not force them all to play immediately/heavy load
        allPlaceholders.forEach((placeholder, index) => {
            // Stagger initialization to prevent UI freeze and reduce immediate context demand
            setTimeout(() => {
                const videoId = placeholder.getAttribute('data-video-id');
                // Check if element still exists
                if (!document.getElementById(placeholder.id)) return;

                const player = new YT.Player(placeholder.id, {
                    videoId: videoId,
                    playerVars: {
                        'autoplay': 1,
                        'mute': 1,
                        'controls': 1,
                        'loop': 1,
                        'playlist': videoId,
                        'modestbranding': 1,
                        'rel': 0,
                        'playsinline': 1,
                        'iv_load_policy': 3,
                        'fs': 0, // Disable fullscreen to simplify
                        'disablekb': 1
                    },
                    events: {
                        'onReady': (event) => {
                            event.target.mute(); // Ensure muted
                            event.target.playVideo();
                        },
                        'onStateChange': (event) => onPlayerStateChange(event, index),
                        'onError': (e) => console.log("YT Error:", e.data)
                    }
                });
                players[index] = player; // Store by index
            }, index * 200); // 200ms stagger
        });

        startAnimation();
        setupInteractions();
    }

    function onPlayerStateChange(event, index) {
        // If user unmutes or plays a video, we pause others
        if (event.data === YT.PlayerState.PLAYING) {
            const currentPlayer = players[index];
            if (currentPlayer && typeof currentPlayer.isMuted === 'function') {
                if (!currentPlayer.isMuted()) {
                    muteAllOthers(index);
                }
            }
        }
    }

    function muteAllOthers(activeIndex) {
        players.forEach((player, i) => {
            if (i !== activeIndex && player && typeof player.mute === 'function') {
                player.mute();
            }
        });
    }

    function startAnimation() {
        // Cancel any existing loop to prevent duplicates
        if (animationId) cancelAnimationFrame(animationId);

        function animate() {
            // Flow logic: Move if not hovered, not dragging, and not actively interacting
            if (!isHovered && !isDragging && !isInteracting) {
                currentTranslate -= speed;
                checkWrapping();
                track.style.transform = `translateX(${currentTranslate}px)`;
            }
            animationId = requestAnimationFrame(animate);
        }
        animate();
    }

    function checkWrapping() {
        if (!track.firstElementChild) return;

        const itemWidth = track.firstElementChild.offsetWidth + 20; // + gap (approx 20px based on CSS)
        // Ensure halfTrackWidth calculation is robust
        const totalItems = track.children.length;
        const halfItems = Math.floor(totalItems / 2);
        const halfTrackWidth = itemWidth * halfItems;

        // Wrap around logic
        if (Math.abs(currentTranslate) >= halfTrackWidth) {
            currentTranslate += halfTrackWidth;
        } else if (currentTranslate > 0) {
            currentTranslate -= halfTrackWidth;
        }
    }

    function setupInteractions() {
        container.addEventListener('mouseenter', () => { isHovered = true; });
        container.addEventListener('mouseleave', () => {
            isHovered = false;
            // Force restart animation loop if it somehow stopped, though rqAF keeps specific logic running
        });

        container.addEventListener('mousedown', dragStart);
        container.addEventListener('touchstart', dragStart, { passive: true });

        window.addEventListener('mousemove', dragMove);
        window.addEventListener('touchmove', dragMove, { passive: false });

        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('touchend', dragEnd);
    }

    function dragStart(e) {
        isDragging = true;
        isInteracting = true;
        startX = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX);
        scrollLeft = currentTranslate;

        // Stop momentum interaction timeout if new drag starts
        if (interactionTimeout) clearTimeout(interactionTimeout);
    }

    function dragMove(e) {
        if (!isDragging) return;
        const x = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX);
        const walk = (x - startX) * 1.5; // Drag multiplier
        currentTranslate = scrollLeft + walk;
        checkWrapping();
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;

        // Delay resuming flow to let user finish "watching" or settling
        // Reduced from 3000ms to 1000ms for better responsiveness
        if (interactionTimeout) clearTimeout(interactionTimeout);
        interactionTimeout = setTimeout(() => {
            isInteracting = false;
        }, 1000);
    }

})();
