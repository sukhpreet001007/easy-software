// Shorts 3D Carousel Logic - No Widget API Version
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

    let activeIndex = 0;

    // DOM Elements
    const container3D = document.getElementById('shorts3DContainer');
    const thumbnailsTrack = document.getElementById('thumbnailsTrack');
    const prevBtn = document.getElementById('shortsPrev');
    const nextBtn = document.getElementById('shortsNext');

    if (!container3D) return;

    // Initialization
    function init() {
        renderCarouselItems();
        renderThumbnails();
        updateCarouselState();
        setupEventListeners();

        // Autoplay on refresh fix
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    refreshActiveVideo();
                } else {
                    stopAllVideos();
                }
            });
        }, { threshold: 0.1 });
        observer.observe(container3D);
    }

    // Render 3D Cards
    function renderCarouselItems() {
        container3D.innerHTML = '';
        videoIds.forEach((id, index) => {
            const card = document.createElement('div');
            card.className = 'short-card';
            card.dataset.index = index;
            card.dataset.id = id;

            // Shorts Logo Overlay
            const logoOverlay = document.createElement('div');
            logoOverlay.className = 'shorts-logo-overlay';
            logoOverlay.innerHTML = `<img src="assets/shorts-icon.png" alt="Shorts Icon">`;
            card.appendChild(logoOverlay);

            // Inner container for the video
            const playerDiv = document.createElement('div');
            playerDiv.id = `player-${id}-${index}`;
            playerDiv.className = 'player-placeholder';
            card.appendChild(playerDiv);

            // Click on side card to navigate
            card.addEventListener('click', (e) => {
                // If it's an iframe click, don't navigate (it's active)
                if (e.target.tagName !== 'IFRAME' && activeIndex !== index) {
                    goToIndex(index);
                }
            });

            container3D.appendChild(card);
        });
    }

    // Render Thumbnails
    function renderThumbnails() {
        if (!thumbnailsTrack) return;
        thumbnailsTrack.innerHTML = '';
        videoIds.forEach((id, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumb-item';
            thumb.dataset.index = index;

            const img = document.createElement('img');
            img.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
            img.alt = `Thumbnail ${index}`;

            thumb.appendChild(img);

            thumb.addEventListener('click', () => {
                goToIndex(index);
            });

            thumbnailsTrack.appendChild(thumb);
        });
    }

    // Update Carousel Classes & Transforms
    function updateCarouselState() {
        const cards = Array.from(container3D.children);
        const thumbs = Array.from(thumbnailsTrack?.children || []);
        const total = videoIds.length;

        for (let i = 0; i < total; i++) {
            const card = cards[i];
            let diff = (i - activeIndex) % total;
            if (diff < -total / 2) diff += total;
            if (diff > total / 2) diff -= total;

            card.className = 'short-card'; // Reset classes

            if (diff === 0) card.classList.add('active');
            else if (diff === -1) card.classList.add('prev');
            else if (diff === 1) card.classList.add('next');
            else if (diff === -2) card.classList.add('prev-2');
            else if (diff === 2) card.classList.add('next-2');
            else if (diff === -3) card.classList.add('prev-3');
            else if (diff === 3) card.classList.add('next-3');

            // Hide far neighbors
            if (Math.abs(diff) > 3) {
                card.style.opacity = '0';
                card.style.zIndex = '-1';
                card.style.pointerEvents = 'none';
            } else {
                card.style.opacity = '';
                card.style.zIndex = '';
                card.style.pointerEvents = '';
            }
        }

        // Update Thumbnails track
        thumbs.forEach((t, i) => t.classList.toggle('active', i === activeIndex));

        if (thumbnailsTrack) {
            let itemWidth = 75;
            if (thumbnailsTrack.children.length > 0) {
                const firstThumb = thumbnailsTrack.children[0];
                const gap = parseFloat(window.getComputedStyle(thumbnailsTrack).gap) || 0;
                itemWidth = firstThumb.offsetWidth + gap;
            }
            const shift = (total * itemWidth / 2) - (activeIndex * itemWidth + itemWidth / 2);
            thumbnailsTrack.style.transform = `translate(calc(-50% + ${shift}px), -50%)`;
        }

        refreshActiveVideo();
    }

    function refreshActiveVideo() {
        const cards = Array.from(container3D.children);
        cards.forEach((card, i) => {
            const placeholder = card.querySelector('.player-placeholder');
            const videoId = card.dataset.id;

            if (i === activeIndex) {
                // Remove background image on active to prevent overlap/leakage
                card.style.backgroundImage = 'none';
                card.style.backgroundColor = '#000';

                // Load iframe for active video if not already there
                if (!placeholder.querySelector('iframe')) {
                    placeholder.innerHTML = `
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0" 
                            frameborder="0" 
                            allow="autoplay; encrypted-media" 
                            allowfullscreen>
                        </iframe>`;
                }
            } else {
                // Restore background image for non-active cards
                card.style.backgroundImage = `url('https://img.youtube.com/vi/${videoId}/hqdefault.jpg')`;
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';

                // Remove iframe for non-active videos to save resources
                placeholder.innerHTML = '';
            }
        });
    }

    function stopAllVideos() {
        const placeholders = container3D.querySelectorAll('.player-placeholder');
        placeholders.forEach(p => p.innerHTML = '');
    }

    function goToIndex(index) {
        if (index === activeIndex) return;
        activeIndex = index;
        updateCarouselState();
    }

    function next() {
        activeIndex = (activeIndex + 1) % videoIds.length;
        updateCarouselState();
    }

    function prev() {
        activeIndex = (activeIndex - 1 + videoIds.length) % videoIds.length;
        updateCarouselState();
    }

    function setupEventListeners() {
        prevBtn?.addEventListener('click', prev);
        nextBtn?.addEventListener('click', next);

        let touchStartX = 0;
        container3D.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container3D.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) next();
            if (touchEndX - touchStartX > 50) prev();
        }, { passive: true });
    }

    init();
})();
