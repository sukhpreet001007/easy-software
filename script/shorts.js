/**
 * High-End Shorts Carousel Logic
 * Features: Infinite Looping, Dot Pagination, Autoplay on Scroll, Multi-video view
 */
(function () {
    const videoIds = [
        'VYYlVHE15II',
        'RzytFGrGDrc',
        'qGPQ8CRaWEE',
        'WeT2P1kFO94',
        '-Bi4pzA492I',
        'NjXpahXVHUw',
        's9hZEp0XBFE',
        'SHYRJ1XG_e0'
    ];

    const track = document.getElementById('shortsSliderTrack');
    const pagination = document.getElementById('shortsPagination');
    const prevBtn = document.getElementById('shortsPrev');
    const nextBtn = document.getElementById('shortsNext');

    if (!track) return;

    let currentIndex = videoIds.length; // Start at the beginning of the middle set
    let isTransitioning = false;
    const totalItems = videoIds.length;

    // Create cloned items for infinite scroll [Set1, Set2, Set3]
    const fullVideoList = [...videoIds, ...videoIds, ...videoIds];

    function init() {
        renderCards();
        renderDots();
        updateSlider(false); // Initial position without animation
        setupIntersectionObserver();

        // Event Listeners
        prevBtn.addEventListener('click', () => moveSlide(-1));
        nextBtn.addEventListener('click', () => moveSlide(1));

        window.addEventListener('resize', () => updateSlider(false));

        // Infinite Loop Cleanup
        track.addEventListener('transitionend', () => {
            if (currentIndex >= totalItems * 2) {
                currentIndex = totalItems;
                updateSlider(false);
            } else if (currentIndex < totalItems) {
                currentIndex = totalItems * 2 - 1;
                updateSlider(false);
            }
            isTransitioning = false;
            manageAutoPlay();
        });
    }

    function renderCards() {
        track.innerHTML = '';
        fullVideoList.forEach((id, index) => {
            const card = document.createElement('div');
            card.className = 'short-card';
            card.dataset.id = id;
            card.dataset.index = index % totalItems;

            card.innerHTML = `
                <div class="player-container"></div>
                <div class="shorts-logo-overlay">
                    <img src="assets/shorts-icon.png" alt="Shorts Icon">
                </div>
            `;

            card.addEventListener('click', () => {
                if (!card.classList.contains('active')) {
                    const diff = index - currentIndex;
                    moveSlide(diff);
                }
            });

            track.appendChild(card);
        });
    }

    function renderDots() {
        if (!pagination) return;
        pagination.innerHTML = '';
        videoIds.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                const targetIndex = totalItems + i;
                const diff = targetIndex - currentIndex;
                moveSlide(diff);
            });
            pagination.appendChild(dot);
        });
    }

    function updateSlider(animate = true) {
        if (animate) {
            track.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        } else {
            track.style.transition = 'none';
        }

        const cards = track.querySelectorAll('.short-card');
        if (cards.length === 0) return;

        const cardWidth = cards[0].offsetWidth;
        const gap = parseInt(window.getComputedStyle(track).gap) || 0;

        // Calculate the offset to center the "active" card
        const viewportWidth = track.parentElement.offsetWidth;
        const offset = (viewportWidth / 2) - (cardWidth / 2) - (currentIndex * (cardWidth + gap));

        track.style.transform = `translateX(${offset}px)`;

        // Update card states
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === currentIndex);
        });

        // Update Dots
        const dots = pagination?.querySelectorAll('.dot');
        if (dots) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === (currentIndex % totalItems));
            });
        }
    }

    function moveSlide(direction) {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex += direction;
        updateSlider(true);
    }

    function manageAutoPlay() {
        const cards = track.querySelectorAll('.short-card');
        const viewport = track.parentElement.getBoundingClientRect();

        cards.forEach((card) => {
            const cardRect = card.getBoundingClientRect();
            // Load iframes for cards that enter the viewport area (and keep them)
            const isNearVisible = (cardRect.right >= viewport.left - 500 && cardRect.left <= viewport.right + 500);
            const container = card.querySelector('.player-container');
            const videoId = card.dataset.id;

            if (isNearVisible && !container.innerHTML) {
                container.innerHTML = `
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3" 
                        frameborder="0" 
                        allow="autoplay; encrypted-media" 
                        allowfullscreen>
                    </iframe>
                `;
            }
        });
    }

    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    manageAutoPlay();
                }
            });
        }, { threshold: 0.1 });
        observer.observe(track.parentElement);
    }

    // Initialize after a small delay to ensure layout is ready
    setTimeout(init, 100);
})();
