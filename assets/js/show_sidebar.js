document.addEventListener("DOMContentLoaded", function () {
    const now = new Date();

    // For all hidden sidebar links
    const hiddenItems = document.querySelectorAll('.hidden-sidebar-item');

    hiddenItems.forEach(item => {
        // Check if this item has a data-hide-until attribute
        const hideUntil = item.getAttribute('data-hide-until');

        // Use hideUntil date if provided, else default global date
        const targetDate = hideUntil ? new Date(hideUntil) : new Date(new Date().getFullYear(), 8, 19, 8, 0, 0); // default Sept 19 8am

        if (now >= targetDate) {
            item.style.display = 'block';
        }
    });
});
