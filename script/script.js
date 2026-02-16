document.addEventListener('DOMContentLoaded', function () {
    // Scroll Progress Bar Logic
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = scrollPercentage + '%';
        }
    });

    // --- Smash Counter Logic ---
    const counterElement = document.querySelector('.counter');
    if (counterElement) {
        const targetNumber = parseInt(counterElement.getAttribute('data-target'));
        const duration = 800;
        const steps = targetNumber - 1;
        const stepDuration = duration / steps;

        let currentStep = 1;
        let hasPlayedSmash = false;

        const counterWrapper = counterElement.closest('.counter-wrapper');
        const particleContainer = document.createElement('div');
        particleContainer.style.position = 'absolute';
        particleContainer.style.top = '0';
        particleContainer.style.left = '0';
        particleContainer.style.width = '100%';
        particleContainer.style.height = '100%';
        particleContainer.style.pointerEvents = 'none';
        particleContainer.style.zIndex = '100';
        counterWrapper.style.position = 'relative';
        counterWrapper.appendChild(particleContainer);

        function createParticles() {
            particleContainer.innerHTML = '';
            const particleCount = 8;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const angle = (i / particleCount) * Math.PI * 2;
                const distance = 30;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                particle.style.setProperty('--tx', `${tx}px`);
                particle.style.setProperty('--ty', `${ty}px`);
                const duration = Math.random() * 0.5 + 0.3;
                particle.style.animation = `particleFly ${duration}s ease-out forwards`;
                particleContainer.appendChild(particle);
            }
            setTimeout(() => { particleContainer.innerHTML = ''; }, 800);
        }

        function playSmashEffect() {
            counterElement.classList.add('smash-animation');
            const xElement = counterElement.nextSibling;
            if (xElement && xElement.nodeType === 3 && xElement.textContent === 'X') {
                const xSpan = document.createElement('span');
                xSpan.textContent = 'X';
                xSpan.classList.add('shake-animation');
                xElement.parentNode.replaceChild(xSpan, xElement);
                setTimeout(() => { xSpan.classList.remove('shake-animation'); }, 500);
            }
            createParticles();
            setTimeout(() => { counterElement.classList.remove('smash-animation'); }, 500);
        }

        const animateCounter = () => {
            if (currentStep <= targetNumber) {
                counterElement.textContent = currentStep;
                counterElement.style.transform = 'scale(1.1)';
                setTimeout(() => { counterElement.style.transform = 'scale(1)'; }, 80);

                if (currentStep === targetNumber && !hasPlayedSmash) {
                    hasPlayedSmash = true;
                    setTimeout(() => { playSmashEffect(); }, stepDuration / 2);
                }

                currentStep++;
                let currentStepDuration = stepDuration;
                if (currentStep > targetNumber - 2) {
                    currentStepDuration = stepDuration * 0.7;
                }
                setTimeout(animateCounter, currentStepDuration);
            }
        };

        // Start Counter Animation
        setTimeout(animateCounter, 500);
    }

    // --- Dashboard Counts Animation ---
    const animateDashboardCounts = () => {
        const counts = document.querySelectorAll('.hero-section-count');
        counts.forEach(countElement => {
            const target = parseInt(countElement.getAttribute('data-target'));
            const duration = 1500;
            const stepTime = Math.abs(Math.floor(duration / target));
            let current = 0;
            const timer = setInterval(() => {
                current += 1;
                countElement.textContent = current;
                countElement.style.transform = 'scale(1.1)';
                setTimeout(() => { countElement.style.transform = 'scale(1)'; }, 50);
                if (current === target) { clearInterval(timer); }
            }, stepTime);
        });
    };

    // --- Percentage Counter Animation ---
    const animatePercentageCounters = () => {
        const counters = document.querySelectorAll('.counter-percentage');
        const observerOptions = { threshold: 0.2 };
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseFloat(counter.getAttribute('data-target') || 0);
                    const prefix = counter.getAttribute('data-prefix') || '';
                    const suffix = counter.getAttribute('data-suffix') || '';
                    const decimals = parseInt(counter.getAttribute('data-decimals') || 0);
                    const box = counter.closest('.box-per, .hero-section-box1');
                    const animationDuration = 2000;
                    const holdDuration = 3000;

                    const startLoop = () => {
                        let startTime = null;
                        const step = (timestamp) => {
                            if (!startTime) startTime = timestamp;
                            const progress = Math.min((timestamp - startTime) / animationDuration, 1);
                            const ease = progress;
                            const current = (ease * target);
                            counter.textContent = prefix + current.toFixed(decimals) + suffix;
                            if (box) { box.style.setProperty('--fill-progress', `${ease * 100}%`); }

                            if (progress < 1) {
                                requestAnimationFrame(step);
                            } else {
                                counter.textContent = prefix + target.toFixed(decimals) + suffix;
                                if (box) { box.style.setProperty('--fill-progress', `100%`); }
                                setTimeout(() => {
                                    if (box) {
                                        box.style.transition = 'none';
                                        box.style.setProperty('--fill-progress', `0%`);
                                        counter.textContent = prefix + (0).toFixed(decimals) + suffix;
                                        void box.offsetWidth;
                                        box.style.transition = '';
                                    }
                                    startLoop();
                                }, holdDuration);
                            }
                        };
                        requestAnimationFrame(step);
                    };
                    startLoop();
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);
        counters.forEach(counter => counterObserver.observe(counter));
    };

    // Start Other Animations
    setTimeout(() => {
        animateDashboardCounts();
        animatePercentageCounters();
    }, 500);

    // Clients review carousel logic - Multi-instance support
    (function () {
        // Global YouTube API Ready check
        function ensureYTAPI() {
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                return;
            }
            if (window.YT && window.YT.Player) {
                initializeAllCarousels();
            }
        }

        let isApiReady = false;
        function initializeAllCarousels() {
            if (isApiReady) return;
            isApiReady = true;
            document.querySelectorAll('.review-carousel-container').forEach(initCarouselInstance);
        }

        function initCarouselInstance(reviewContainer) {
            const reviewTrack = reviewContainer.querySelector('.review-track');
            if (!reviewTrack) return;

            let reviewPlayers = [];
            let reviewCurrentTranslate = 0;
            let reviewSpeed = 1.0;
            let reviewIsHovered = false;
            let reviewAnimationId;
            let totalSetWidth = 0;

            function calculateWidths() {
                const items = reviewTrack.querySelectorAll('.review-item');
                if (items.length < 4) return;
                const firstItem = items[0];
                const itemWidth = firstItem.offsetWidth || 480;
                const style = window.getComputedStyle(reviewTrack);
                const gap = parseInt(style.gap || style.columnGap) || 40;
                totalSetWidth = (itemWidth + gap) * 4;
            }

            // Initialize Players
            const placeholders = reviewTrack.querySelectorAll('[data-review-id]');
            placeholders.forEach((placeholder, index) => {
                const videoId = placeholder.getAttribute('data-review-id');
                // Use DOM Element directly avoids ID conflicts
                try {
                    const player = new YT.Player(placeholder, {
                        videoId: videoId,
                        playerVars: {
                            'autoplay': 0,
                            'mute': 0, // Muted by default
                            'controls': 1,
                            'rel': 0,
                            'modestbranding': 1,
                            'playsinline': 1,
                            'iv_load_policy': 3
                        },
                        events: {
                            'onReady': (e) => {
                                const ifr = e.target.getIframe();
                                if (ifr) { ifr.style.width = '100%'; ifr.style.height = '100%'; }
                            },
                            'onStateChange': (event) => onReviewPlayerStateChange(event, index, reviewPlayers)
                        }
                    });
                    reviewPlayers.push(player);
                } catch (err) { console.error("YT Player init error:", err); }
            });

            // State Change Handler (Scoped to this instance)
            function onReviewPlayerStateChange(event, index, players) {
                if (event.data === YT.PlayerState.PLAYING) {
                    reviewIsHovered = true;
                    // Pause others in this carousel
                    players.forEach((p, i) => {
                        if (i !== index) { try { if (p && p.pauseVideo) p.pauseVideo(); } catch (e) { } }
                    });
                }
            }

            function startReviewAnimation() {
                function animate() {
                    const isAnyPlaying = reviewPlayers.some(p => {
                        try { return p && p.getPlayerState && p.getPlayerState() === YT.PlayerState.PLAYING; } catch (e) { return false; }
                    });

                    if (!reviewIsHovered && !isAnyPlaying && totalSetWidth > 0) {
                        reviewCurrentTranslate -= reviewSpeed;
                        if (Math.abs(reviewCurrentTranslate) >= totalSetWidth) {
                            reviewCurrentTranslate += totalSetWidth;
                        }
                        reviewTrack.style.transform = `translateX(${reviewCurrentTranslate}px)`;
                    }
                    reviewAnimationId = requestAnimationFrame(animate);
                }
                animate();
            }

            // Event Listeners
            reviewContainer.addEventListener('mouseenter', () => reviewIsHovered = true);
            reviewContainer.addEventListener('mouseleave', () => {
                const isAnyPlaying = reviewPlayers.some(p => {
                    try { return p && p.getPlayerState && p.getPlayerState() === YT.PlayerState.PLAYING; } catch (e) { return false; }
                });
                if (!isAnyPlaying) reviewIsHovered = false;
            });

            window.addEventListener('resize', calculateWidths);

            // Initial Width Calc & Start
            setTimeout(() => {
                calculateWidths();
                startReviewAnimation();
            }, 500);
        }

        // Bootstrap the logic
        ensureYTAPI();

        // Polling fallack for YT API
        const checkYT = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(checkYT);
                initializeAllCarousels();
            }
        }, 500);
    })();


    // Auto-hover sequential effect for promo section
    (function () {
        const promoSection = document.querySelector('.section-promo');
        const promoItems = document.querySelectorAll('.section-promo-feature-item');
        if (!promoSection || promoItems.length === 0) return;

        const observerOptions = {
            threshold: 0.3 // Trigger when 30% of section is visible
        };

        const promoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start sequence
                    runPulseSequence();
                    // Stop observing after triggering once
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        promoObserver.observe(promoSection);

        function runPulseSequence() {
            // Initial delay to let entry animations finish (approx 0.8s)
            setTimeout(() => {
                let delay = 0;
                promoItems.forEach((item, index) => {
                    // Add active class
                    setTimeout(() => {
                        item.classList.add('feature-item-active');

                        // Remove active class after a duration
                        setTimeout(() => {
                            item.classList.remove('feature-item-active');
                        }, 1200); // Keep active for 1.2s

                    }, delay);

                    delay += 800; // Overlap slightly: next starts 0.8s after previous
                });
            }, 800);
        }
    })();

    // Brands Marquee Cloning Logic
    (function () {
        const marqueeInner = document.querySelector('.brands-marquee-inner');
        if (marqueeInner) {
            const items = marqueeInner.innerHTML;
            // Duplicate items once to ensure the marquee container loops perfectly with -50% translation
            marqueeInner.innerHTML = items + items;
        }
    })();

    // Scroll Reveal Animation Logic
    (function () {
        const revealElements = document.querySelectorAll('.reveal');

        // Detect if mobile viewport
        const isMobile = window.innerWidth <= 768;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Once animated, we can unobserve if we only want it to happen once
                    // revealObserver.unobserve(entry.target);
                } else {
                    // Optional: remove 'active' to re-animate when scrolling back up
                    // entry.target.classList.remove('active');
                }
            });
        }, {
            threshold: isMobile ? 0.05 : 0.15, // Lower threshold on mobile for earlier trigger
            rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px' // Earlier trigger on mobile
        });

        revealElements.forEach(el => revealObserver.observe(el));
    })();

    // Synchronized Feature Points & Image Slider (Marketing Page)
    (function () {
        const featureItems = document.querySelectorAll('.marketing-points-feature-item[data-index]');
        const imageSlides = document.querySelectorAll('.marketing-points-image-slide');

        if (featureItems.length === 0 || imageSlides.length === 0) return;

        let currentIndex = 0;
        const totalItems = featureItems.length;
        const intervalTime = 3000; // 3 seconds per slide

        function setActiveItem(index) {
            // Remove active class from all
            featureItems.forEach(item => item.classList.remove('marketing-feature-point-active'));
            imageSlides.forEach(img => img.classList.remove('active'));

            // Add active class to current
            if (featureItems[index]) featureItems[index].classList.add('marketing-feature-point-active');
            if (imageSlides[index]) imageSlides[index].classList.add('active');
        }

        // Initialize first item
        setActiveItem(0);

        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalItems;
            setActiveItem(currentIndex);
        }, intervalTime);

        // Optional: Manual hover interaction
        featureItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                currentIndex = index;
                setActiveItem(currentIndex);
            });
        });
    })();

    // Synchronized Feature Points & Image Slider (Index Page)
    (function () {
        const featureItems = document.querySelectorAll('.index-points-feature-item[data-index]');
        const imageSlides = document.querySelectorAll('.index-points-image-slide');

        if (featureItems.length === 0 || imageSlides.length === 0) return;

        let currentIndex = 0;
        const totalItems = featureItems.length;
        const intervalTime = 3000; // 3 seconds per slide

        function setActiveItem(index) {
            // Remove active class from all
            featureItems.forEach(item => item.classList.remove('index-feature-point-active'));
            imageSlides.forEach(img => img.classList.remove('active'));

            // Add active class to current
            if (featureItems[index]) featureItems[index].classList.add('index-feature-point-active');
            if (imageSlides[index]) imageSlides[index].classList.add('active');
        }

        // Initialize first item
        setActiveItem(0);

        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalItems;
            setActiveItem(currentIndex);
        }, intervalTime);

        // Optional: Manual hover interaction
        featureItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                currentIndex = index;
                setActiveItem(currentIndex);
            });
        });
    })();

    // --- Blog Load More Logic (Mobile Only) ---
    (function () {
        const blogGrid = document.querySelector('.blog-grid');
        const loadMoreContainer = document.getElementById('blog-load-more-container');
        const loadMoreBtn = document.getElementById('load-more-btn');
        const loadingSpinner = document.getElementById('loading-spinner');
        const btnText = loadMoreBtn ? loadMoreBtn.querySelector('.btn-text') : null;

        if (!blogGrid || !loadMoreContainer || !loadMoreBtn) return;

        const cards = blogGrid.querySelectorAll('.blog-card');
        const MOBILE_LIMIT = 10;
        let isExpanded = false;

        function updateView() {
            const isMobile = window.innerWidth <= 768;

            if (!isMobile) {
                // Desktop: Show everything, hide button
                cards.forEach(card => card.style.display = '');
                loadMoreContainer.style.display = 'none';
                return;
            }

            // Mobile logic
            loadMoreContainer.style.display = 'block';

            if (isExpanded) {
                // Show all cards, button says "All Loaded"
                cards.forEach(card => card.style.display = '');
                if (btnText) btnText.textContent = 'All loaded';
                loadMoreBtn.disabled = true;
                if (loadingSpinner) loadingSpinner.style.display = 'none';
            } else {
                // Show first 10, hide rest
                cards.forEach((card, index) => {
                    if (index >= MOBILE_LIMIT) {
                        card.style.display = 'none';
                    } else {
                        card.style.display = '';
                    }
                });
                if (btnText) btnText.textContent = 'Load All Blogs';
                loadMoreBtn.disabled = false;
                if (loadingSpinner) loadingSpinner.style.display = 'none';
            }
        }

        // Click Handler
        loadMoreBtn.addEventListener('click', function () {
            if (isExpanded) return;

            // Loading State
            if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
            if (btnText) btnText.textContent = 'Loading...';
            // loadMoreBtn.disabled = true; // Don't disable immediately so click feels registered, or do based on preference. User asked for "loading icon inside button"

            // Simulated Network Request
            setTimeout(() => {
                isExpanded = true;
                updateView(); // This will show all cards and update text to "All Loaded"
            }, 1200);
        });

        // Initialize and listen for resize
        updateView();
        window.addEventListener('resize', updateView);
    })();
});

// Smooth gradient progress bar
let scrollTimeout;
const progressBar = document.getElementById('progress-bar');

window.addEventListener('scroll', function () {
    // Clear any existing timeout
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }

    // Use requestAnimationFrame for smoother animation
    scrollTimeout = requestAnimationFrame(function () {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const scrollPercent = Math.min(scrolled / documentHeight, 1);

        // Update progress bar width
        progressBar.style.width = (scrollPercent * 100) + '%';

        // Animate gradient based on scroll position
        // This creates a "moving gradient" effect
        const gradientPosition = (scrollPercent * 100) - 100;
        progressBar.style.backgroundPosition = gradientPosition + '% 0';

        // Add/remove complete class when at bottom
        if (scrollPercent >= 0.99) {
            progressBar.classList.add('complete');
        } else {
            progressBar.classList.remove('complete');
        }
    });
});

// Reset on page load
window.addEventListener('load', function () {
    progressBar.style.width = '0%';
    progressBar.style.backgroundPosition = '-100% 0';
});

// Video Modal - Stop video when modal is closed
// document.addEventListener('DOMContentLoaded', function () {
//     const videoModal = document.getElementById('VideoModal');
//     const iframe = document.getElementById('youtubeVideo');

//     if (!videoModal || !iframe) return;

//     const VIDEO_URL = "https://www.youtube.com/embed/LgrDGUmQoVI?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1";

//     function stopVideo() {
//         iframe.src = "about:blank"; // HARD stop (kills audio 100%)
//     }

//     function playVideo() {
//         iframe.src = VIDEO_URL;
//     }

//     // Play when modal opens
//     videoModal.addEventListener('shown.bs.modal', playVideo);

//     // Stop instantly when modal closes
//     videoModal.addEventListener('hide.bs.modal', stopVideo);

//     // EXTRA SAFETY: stop video on page change / refresh / back
//     window.addEventListener('beforeunload', stopVideo);
//     window.addEventListener('pagehide', stopVideo); // Safari / iOS fix
// });

// (function () {
//     const videoIds = [
//         'VYYlVHE15II',
//         'RzytFGrGDrc',
//         'qGPQ8CRaWEE',
//         'WeT2P1kFO94',
//         '-Bi4pzA492I',
//         'NjXpahXVHUw',
//         's9hZEp0XBFE',
//         'SHYRJ1XG_e0'
//     ];

//     let masterMuted = true;           // global state for "what should active videos be?"

//     const track = document.getElementById('shortsSliderTrack');
//     const pagination = document.getElementById('shortsPagination');
//     const prevBtn = document.getElementById('shortsPrev');
//     const nextBtn = document.getElementById('shortsNext');
//     if (!track) return;

//     let currentIndex = videoIds.length;
//     let isTransitioning = false;
//     const totalItems = videoIds.length;

//     const fullVideoList = [...videoIds, ...videoIds, ...videoIds];

//     function init() {
//         renderCards();
//         renderDots();
//         updateSlider(false);
//         setupIntersectionObserver();

//         prevBtn.addEventListener('click', () => moveSlide(-1));
//         nextBtn.addEventListener('click', () => moveSlide(1));
//         window.addEventListener('resize', () => updateSlider(false));

//         track.addEventListener('transitionend', () => {
//             if (currentIndex >= totalItems * 2) {
//                 currentIndex = totalItems;
//                 updateSlider(false);
//             } else if (currentIndex < totalItems) {
//                 currentIndex = totalItems * 2 - 1;
//                 updateSlider(false);
//             }
//             isTransitioning = false;
//             manageAutoPlay();
//         });

//         // Set initial active
//         setTimeout(applyMasterMuteToActive, 1200);
//     }

//     function renderCards() {
//         track.innerHTML = '';
//         fullVideoList.forEach((id, index) => {
//             const card = document.createElement('div');
//             card.className = 'short-card';
//             card.dataset.id = id;
//             card.dataset.index = index % totalItems;
//             card.innerHTML = `
//                 <div class="player-container"></div>
//                 <div class="shorts-logo-overlay">
//                     <img src="assets/shorts-icon.png" alt="Shorts Icon">
//                 </div>
//             `;
//             card.addEventListener('click', () => {
//                 if (!card.classList.contains('active')) {
//                     const diff = index - currentIndex;
//                     moveSlide(diff);
//                 }
//             });
//             track.appendChild(card);
//         });
//     }

//     function renderDots() {
//         if (!pagination) return;
//         pagination.innerHTML = '';
//         videoIds.forEach((_, i) => {
//             const dot = document.createElement('div');
//             dot.className = 'dot';
//             if (i === 0) dot.classList.add('active');
//             dot.addEventListener('click', () => {
//                 const targetIndex = totalItems + i;
//                 const diff = targetIndex - currentIndex;
//                 moveSlide(diff);
//             });
//             pagination.appendChild(dot);
//         });
//     }

//     function updateSlider(animate = true) {
//         if (animate) {
//             track.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
//         } else {
//             track.style.transition = 'none';
//         }

//         const cards = track.querySelectorAll('.short-card');
//         if (cards.length === 0) return;

//         const cardWidth = cards[0].offsetWidth;
//         const gap = parseInt(window.getComputedStyle(track).gap) || 0;
//         const viewportWidth = track.parentElement.offsetWidth;
//         const offset = (viewportWidth / 2) - (cardWidth / 2) - (currentIndex * (cardWidth + gap));

//         track.style.transform = `translateX(${offset}px)`;

//         cards.forEach((card, i) => {
//             const isActive = i === currentIndex;
//             card.classList.toggle('active', isActive);

//             // Force-mute non-active cards
//             if (!isActive) {
//                 const iframe = card.querySelector('iframe');
//                 if (iframe?.contentWindow) {
//                     iframe.contentWindow.postMessage(JSON.stringify({
//                         event: 'command',
//                         func: 'mute',
//                         args: []
//                     }), '*');
//                 }
//             }
//         });

//         // Update dots
//         const dots = pagination?.querySelectorAll('.dot');
//         if (dots) {
//             dots.forEach((dot, i) => {
//                 dot.classList.toggle('active', i === (currentIndex % totalItems));
//             });
//         }

//         // Apply current desired state to the NEW active video
//         setTimeout(applyMasterMuteToActive, 400);
//     }

//     function moveSlide(direction) {
//         if (isTransitioning) return;
//         isTransitioning = true;
//         currentIndex += direction;
//         updateSlider(true);
//     }

//     function manageAutoPlay() {
//         const cards = track.querySelectorAll('.short-card');
//         const viewport = track.parentElement.getBoundingClientRect();

//         cards.forEach((card) => {
//             const rect = card.getBoundingClientRect();
//             const isNear = rect.right > viewport.left - 600 && rect.left < viewport.right + 600;
//             const container = card.querySelector('.player-container');
//             const id = card.dataset.id;

//             if (isNear && !container.innerHTML) {
//                 container.innerHTML = `
//                     <iframe
//                         src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1"
//                         frameborder="0"
//                         allow="autoplay; encrypted-media; picture-in-picture"
//                         allowfullscreen>
//                     </iframe>
//                 `;
//             }
//         });
//     }

//     // ─── Main logic: detect user mute/unmute on ACTIVE card only ───
//     window.addEventListener('message', (event) => {
//         if (!event.origin.includes('youtube.com')) return;

//         let data;
//         try {
//             data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
//         } catch {
//             return;
//         }

//         if (!data || !data.info) return;

//         const sourceWindow = event.source;
//         const activeIframe = track.querySelector('.short-card.active iframe');

//         // Only care about messages from the currently active player
//         if (!activeIframe || activeIframe.contentWindow !== sourceWindow) {
//             // Still mute others if someone tries to unmute in background
//             if (data.info.muted === false || (data.info.volume > 0 && data.info.muted !== true)) {
//                 document.querySelectorAll('.short-card iframe').forEach(iframe => {
//                     if (iframe.contentWindow !== sourceWindow) {
//                         iframe.contentWindow?.postMessage(JSON.stringify({
//                             event: 'command',
//                             func: 'mute',
//                             args: []
//                         }), '*');
//                     }
//                 });
//             }
//             return;
//         }

//         // ─── We are dealing with the ACTIVE player ───

//         // User just unmuted
//         if (data.info.muted === false || (data.info.volume > 0 && data.info.muted !== true)) {
//             masterMuted = false;
//             // No need to unmute again — player is already unmuted
//         }

//         // User just muted
//         else if (data.info.muted === true) {
//             masterMuted = true;
//             // Player is already muted — no extra command needed
//         }
//     });

//     function applyMasterMuteToActive() {
//         const activeCard = track.querySelector('.short-card.active');
//         if (!activeCard) return;

//         const iframe = activeCard.querySelector('iframe');
//         if (!iframe?.contentWindow) return;

//         const command = masterMuted ? 'mute' : 'unMute';

//         iframe.contentWindow.postMessage(JSON.stringify({
//             event: 'command',
//             func: command,
//             args: []
//         }), '*');
//     }

//     function setupIntersectionObserver() {
//         const observer = new IntersectionObserver((entries) => {
//             entries.forEach(entry => {
//                 if (entry.isIntersecting) manageAutoPlay();
//             });
//         }, { threshold: 0.1 });
//         observer.observe(track.parentElement);
//     }

//     setTimeout(init, 100);
// })();
document.addEventListener('DOMContentLoaded', function () {
    const videoModal = document.getElementById('VideoModal');
    const iframe = document.getElementById('youtubeVideo');

    if (!videoModal || !iframe) return;

    const VIDEO_URL = "https://www.youtube.com/embed/LgrDGUmQoVI?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1";

    function stopVideo() {
        iframe.src = "about:blank"; // HARD stop (kills audio 100%)
    }

    function playVideo() {
        iframe.src = VIDEO_URL;
    }

    // Play when modal opens
    videoModal.addEventListener('shown.bs.modal', playVideo);

    // Stop instantly when modal closes
    videoModal.addEventListener('hide.bs.modal', stopVideo);

    // EXTRA SAFETY: stop video on page change / refresh / back
    window.addEventListener('beforeunload', stopVideo);
    window.addEventListener('pagehide', stopVideo); // Safari / iOS fix
});

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

    let masterMuted = true;           // global state for "what should active videos be?"

    const track = document.getElementById('shortsSliderTrack');
    const pagination = document.getElementById('shortsPagination');
    const prevBtn = document.getElementById('shortsPrev');
    const nextBtn = document.getElementById('shortsNext');
    if (!track) return;

    let currentIndex = videoIds.length;
    let isTransitioning = false;
    const totalItems = videoIds.length;

    const fullVideoList = [...videoIds, ...videoIds, ...videoIds];

    function init() {
        renderCards();
        renderDots();
        updateSlider(false);
        setupIntersectionObserver();

        prevBtn.addEventListener('click', () => moveSlide(-1));
        nextBtn.addEventListener('click', () => moveSlide(1));
        window.addEventListener('resize', () => updateSlider(false));

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

        // Set initial active
        setTimeout(applyMasterMuteToActive, 1200);
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
        const viewportWidth = track.parentElement.offsetWidth;
        const offset = (viewportWidth / 2) - (cardWidth / 2) - (currentIndex * (cardWidth + gap));

        track.style.transform = `translateX(${offset}px)`;

        cards.forEach((card, i) => {
            const isActive = i === currentIndex;
            card.classList.toggle('active', isActive);

            // Force-mute non-active cards
            if (!isActive) {
                const iframe = card.querySelector('iframe');
                if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'mute',
                        args: []
                    }), '*');
                }
            }
        });

        // Update dots
        const dots = pagination?.querySelectorAll('.dot');
        if (dots) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === (currentIndex % totalItems));
            });
        }

        // Apply current desired state to the NEW active video
        setTimeout(applyMasterMuteToActive, 400);
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
            const rect = card.getBoundingClientRect();
            const isNear = rect.right > viewport.left - 600 && rect.left < viewport.right + 600;
            const container = card.querySelector('.player-container');
            const id = card.dataset.id;

            if (isNear && !container.innerHTML) {
                const currentOrigin = window.location.origin;

                container.innerHTML = `
                    <iframe
                        src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1&origin=${encodeURIComponent(currentOrigin)}"
                        frameborder="0"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowfullscreen
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                `;
            }
        });
    }

    // ─── Main logic: detect user mute/unmute on ACTIVE card only ───
    window.addEventListener('message', (event) => {
        if (!event.origin.includes('youtube.com')) return;

        let data;
        try {
            data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch {
            return;
        }

        if (!data || !data.info) return;

        const sourceWindow = event.source;
        const activeIframe = track.querySelector('.short-card.active iframe');

        // Only care about messages from the currently active player
        if (!activeIframe || activeIframe.contentWindow !== sourceWindow) {
            // Still mute others if someone tries to unmute in background
            if (data.info.muted === false || (data.info.volume > 0 && data.info.muted !== true)) {
                document.querySelectorAll('.short-card iframe').forEach(iframe => {
                    if (iframe.contentWindow !== sourceWindow) {
                        iframe.contentWindow?.postMessage(JSON.stringify({
                            event: 'command',
                            func: 'mute',
                            args: []
                        }), '*');
                    }
                });
            }
            return;
        }

        // ─── We are dealing with the ACTIVE player ───

        // User just unmuted
        if (data.info.muted === false || (data.info.volume > 0 && data.info.muted !== true)) {
            masterMuted = false;
        }

        // User just muted
        else if (data.info.muted === true) {
            masterMuted = true;
        }
    });

    function applyMasterMuteToActive() {
        const activeCard = track.querySelector('.short-card.active');
        if (!activeCard) return;

        const iframe = activeCard.querySelector('iframe');
        if (!iframe?.contentWindow) return;

        const command = masterMuted ? 'mute' : 'unMute';

        iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: command,
            args: []
        }), '*');
    }

    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) manageAutoPlay();
            });
        }, { threshold: 0.1 });
        observer.observe(track.parentElement);
    }

    setTimeout(init, 100);
})();

