document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('darkModeToggle');

    // Check saved preference first
    const saved = localStorage.getItem('darkModeEnabled');

    if (saved === 'true') {
        toggle.checked = true;
        document.body.classList.add('dark-mode');
    } else if (saved === 'false') {
        toggle.checked = false;
        document.body.classList.remove('dark-mode');
    } else {
        // No saved preference: fallback to OS/browser preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            toggle.checked = true;
            document.body.classList.add('dark-mode');
        }
    }

    // Listen for toggle changes and save preference
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkModeEnabled', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkModeEnabled', 'false');
        }
    });
});
