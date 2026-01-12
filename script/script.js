document.addEventListener('DOMContentLoaded', function () {
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
});