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

    const counterElement = document.querySelector('.counter');
    if (!counterElement) return;

    const targetNumber = parseInt(counterElement.getAttribute('data-target'));
    const duration = 800; // Slightly faster counting (0.8 seconds)
    const steps = targetNumber - 1; // Since we start at 1
    const stepDuration = duration / steps;

    let currentStep = 1;
    let hasPlayedSmash = false;

    // Create particle container
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
        // Clear previous particles
        particleContainer.innerHTML = '';

        // Create 8 particles in a circle
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Calculate angle for circular distribution
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 30;

            // Set custom properties for animation
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);

            // Randomize animation duration
            const duration = Math.random() * 0.5 + 0.3;

            particle.style.animation = `particleFly ${duration}s ease-out forwards`;

            particleContainer.appendChild(particle);
        }

        // Remove particles after animation
        setTimeout(() => {
            particleContainer.innerHTML = '';
        }, 800);
    }

    function playSmashEffect() {
        // Add smash animation class
        counterElement.classList.add('smash-animation');

        // Add shake effect to the X
        const xElement = counterElement.nextSibling;
        if (xElement && xElement.nodeType === 3 && xElement.textContent === 'X') {
            // Create a span for the X to animate separately
            const xSpan = document.createElement('span');
            xSpan.textContent = 'X';
            xSpan.classList.add('shake-animation');

            // Replace the text node with our span
            xElement.parentNode.replaceChild(xSpan, xElement);

            // Remove animation class after completion
            setTimeout(() => {
                xSpan.classList.remove('shake-animation');
            }, 500);
        }

        // Create particle explosion
        createParticles();

        // Remove animation class after completion
        setTimeout(() => {
            counterElement.classList.remove('smash-animation');
        }, 500);
    }

    const animateCounter = () => {
        if (currentStep <= targetNumber) {
            counterElement.textContent = currentStep;

            // Add a subtle scale effect for each number change
            counterElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                counterElement.style.transform = 'scale(1)';
            }, 80);

            // Check if we reached the final number
            if (currentStep === targetNumber && !hasPlayedSmash) {
                hasPlayedSmash = true;

                // Small delay before smash effect
                setTimeout(() => {
                    playSmashEffect();
                }, stepDuration / 2);
            }

            currentStep++;

            // Speed up counting as we approach the end
            let currentStepDuration = stepDuration;
            if (currentStep > targetNumber - 2) {
                // Speed up last two steps
                currentStepDuration = stepDuration * 0.7;
            }

            setTimeout(animateCounter, currentStepDuration);
        }
    };

    // Dashboard counts animation function
    const animateDashboardCounts = () => {
        const counts = document.querySelectorAll('.hero-section-count');
        counts.forEach(countElement => {
            const target = parseInt(countElement.getAttribute('data-target'));
            const duration = 1500; // 1.5 seconds for dashboard counts
            const stepTime = Math.abs(Math.floor(duration / target));
            let current = 0;

            const timer = setInterval(() => {
                current += 1;
                countElement.textContent = current;

                // Add digital watch scale effect
                countElement.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    countElement.style.transform = 'scale(1)';
                }, 50);

                if (current === target) {
                    clearInterval(timer);
                }
            }, stepTime);
        });
    };

    // Percentage section counter animation
    const animatePercentageCounters = () => {
        const counters = document.querySelectorAll('.counter-percentage');

        const observerOptions = {
            threshold: 0.5
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const start = parseInt(counter.getAttribute('data-start') || 0);
                    const prefix = counter.getAttribute('data-prefix') || '';
                    const suffix = counter.getAttribute('data-suffix') || '';
                    const duration = 2000; // 2 seconds

                    let startTime = null;

                    const animation = (currentTime) => {
                        if (!startTime) startTime = currentTime;
                        const progress = Math.min((currentTime - startTime) / duration, 1);
                        const current = Math.floor(progress * (target - start) + start);

                        counter.textContent = prefix + current + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(animation);
                        } else {
                            counter.textContent = prefix + target + suffix;
                        }
                    };

                    requestAnimationFrame(animation);
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(counter => counterObserver.observe(counter));
    };

    // Start animations
    setTimeout(() => {
        animateCounter();
        animateDashboardCounts();
        animatePercentageCounters();
    }, 500);

    // Clients review carousel logic
    (function () {
        let reviewPlayers = [];
        const reviewTrack = document.getElementById('reviewTrack');
        const reviewContainer = document.querySelector('.review-carousel-container');
        if (!reviewTrack || !reviewContainer) return;

        let reviewCurrentTranslate = 0;
        let reviewSpeed = 1.0;
        let reviewIsHovered = false;
        let reviewAnimationId;
        let totalSetWidth = 0;
        let isInitializing = false;

        // Force load YouTube API independently of other scripts
        function ensureYTAPI() {
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                return;
            }
            if (window.YT && window.YT.Player && !isInitializing) {
                startInit();
            }
        }

        function calculateWidths() {
            const items = reviewTrack.querySelectorAll('.review-item');
            if (items.length < 4) return;
            const firstItem = items[0];
            const itemWidth = firstItem.offsetWidth || 480;
            const style = window.getComputedStyle(reviewTrack);
            const gap = parseInt(style.gap || style.columnGap) || 40;
            totalSetWidth = (itemWidth + gap) * 4;
            console.log("Calculated set width:", totalSetWidth);
        }

        function startInit() {
            isInitializing = true;
            setTimeout(() => {
                calculateWidths();
                window.addEventListener('resize', calculateWidths);

                const placeholders = reviewTrack.querySelectorAll('[data-review-id]');
                placeholders.forEach((placeholder, index) => {
                    const videoId = placeholder.getAttribute('data-review-id');
                    try {
                        const player = new YT.Player(placeholder.id, {
                            videoId: videoId,
                            playerVars: {
                                'autoplay': 0,
                                'mute': 0,
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
                                'onStateChange': (event) => onReviewPlayerStateChange(event, index)
                            }
                        });
                        reviewPlayers.push(player);
                    } catch (err) { console.error("YT Player init error:", err); }
                });
                startReviewAnimation();
            }, 1000);
        }

        function onReviewPlayerStateChange(event, index) {
            if (event.data === YT.PlayerState.PLAYING) {
                reviewIsHovered = true;
                reviewPlayers.forEach((p, i) => {
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

        reviewContainer.addEventListener('mouseenter', () => reviewIsHovered = true);
        reviewContainer.addEventListener('mouseleave', () => {
            const isAnyPlaying = reviewPlayers.some(p => {
                try { return p && p.getPlayerState && p.getPlayerState() === YT.PlayerState.PLAYING; } catch (e) { return false; }
            });
            if (!isAnyPlaying) reviewIsHovered = false;
        });

        ensureYTAPI();
        const checkYT = setInterval(() => {
            if (window.YT && window.YT.Player && !isInitializing) {
                clearInterval(checkYT);
                startInit();
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
});