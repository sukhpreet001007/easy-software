document.addEventListener('DOMContentLoaded', function () {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const articles = document.querySelectorAll('.terms-article');

    // Click handler for active state
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked
            this.classList.add('active');
        });
    });

    // ScrollSpy using IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Active when element is in the top-ish part of viewport
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                // Remove active from all
                navItems.forEach(nav => nav.classList.remove('active'));

                // Add active to corresponding nav item
                const activeNav = document.querySelector(`.sidebar-nav .nav-item[href="#${id}"]`);
                if (activeNav) {
                    activeNav.classList.add('active');
                }
            }
        });
    }, observerOptions);

    articles.forEach(article => {
        observer.observe(article);
    });
});
