document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Helper to update button text
    function updateButtonText(isDark) {
        toggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    // Load saved mode from localStorage
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode === 'enabled') {
        body.classList.add('dark-mode');
        updateButtonText(true);
    } else if (savedMode === 'disabled') {
        body.classList.remove('dark-mode');
        updateButtonText(false);
    } else {
        // No saved preference, check system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            body.classList.add('dark-mode');
            updateButtonText(true);
            localStorage.setItem('darkMode', 'enabled'); // Optional: save the system preference
        } else {
            body.classList.remove('dark-mode');
            updateButtonText(false);
            localStorage.setItem('darkMode', 'disabled'); // Optional
        }
    }

    toggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        updateButtonText(isDark);
    });
});
