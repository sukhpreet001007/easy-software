let players = [];
let track = document.getElementById('shortsTrack');
let container = document.querySelector('.shorts-carousel-container');

let isDragging = false;
let startX;
let scrollLeft;
let animationId;
let currentTranslate = 0;
let speed = 1.5;
let isHovered = false;
let isInteracting = false;
let interactionTimeout;
let isAPIInjected = false;
let hasInitialized = false;

// Optimization: Use IntersectionObserver to lazy load the whole section
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasInitialized) {
            loadYouTubeAPI();
            hasInitialized = true;
        }
    });
}, { threshold: 0.1 });

sectionObserver.observe(document.querySelector('.shorts-section'));

function loadYouTubeAPI() {
    if (!window.YT && !isAPIInjected) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        isAPIInjected = true;
    } else if (window.YT && window.YT.Player) {
        initCarousel();
    }
}

window.onYouTubeIframeAPIReady = function () {
    initCarousel();
};

function initCarousel() {
    const allPlaceholders = track.querySelectorAll('[data-video-id]');

    // Performance: We only strictly need players for the active half for the loop logic
    // but the user wants native controls on all. We'll stagger initialization.
    allPlaceholders.forEach((placeholder, index) => {
        // Stagger initialization slightly to avoid browser hang
        setTimeout(() => {
            const videoId = placeholder.getAttribute('data-video-id');
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
                    'iv_load_policy': 3
                },
                events: {
                    'onReady': (event) => event.target.playVideo(),
                    'onStateChange': (event) => onPlayerStateChange(event, index)
                }
            });
            players.push(player);
        }, index * 100);
    });

    startAnimation();
    setupInteractions();
}

function onPlayerStateChange(event, index) {
    if (event.data === YT.PlayerState.PLAYING) {
        const currentPlayer = players[index];
        if (currentPlayer && currentPlayer.isMuted && !currentPlayer.isMuted()) {
            muteAllOthers(index);
        }
    }
}

// Optimization: Use a smaller interval or only check when necessary
setInterval(() => {
    players.forEach((player, index) => {
        if (player && player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) {
            if (player.isMuted && !player.isMuted()) {
                muteAllOthers(index);
            }
        }
    });
}, 1000);

function muteAllOthers(activeIndex) {
    players.forEach((player, i) => {
        if (i !== activeIndex) {
            if (player && player.mute) player.mute();
        }
    });
}

function startAnimation() {
    function animate() {
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
    const itemWidth = track.firstElementChild.offsetWidth + 30;
    const halfTrackWidth = itemWidth * 8;

    if (Math.abs(currentTranslate) >= halfTrackWidth) {
        currentTranslate += halfTrackWidth;
    } else if (currentTranslate > 0) {
        currentTranslate -= halfTrackWidth;
    }
}

function setupInteractions() {
    container.addEventListener('mouseenter', () => { isHovered = true; });
    container.addEventListener('mouseleave', () => { isHovered = false; });

    container.addEventListener('mousedown', dragStart);
    container.addEventListener('touchstart', dragStart, { passive: true });

    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, { passive: false });

    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        isDragging = true;
        isInteracting = true;
        startX = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX);
        scrollLeft = currentTranslate;
        clearTimeout(interactionTimeout);
    }

    function dragMove(e) {
        if (!isDragging) return;
        const x = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX);
        const walk = (x - startX) * 1.5;
        currentTranslate = scrollLeft + walk;
        checkWrapping();
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        interactionTimeout = setTimeout(() => {
            isInteracting = false;
        }, 3000);
    }
}
