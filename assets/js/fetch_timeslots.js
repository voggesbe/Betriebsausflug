document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const listElement = document.getElementById('timeslot-list');

    fetch('/assets/data/timeslots.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(timeslots => {
            timeslots.forEach(slot => {
                const slotDate = new Date(slot.datetime);

                // Show events if:
                // 1) eventDate <= now (past or current)
                // OR 2) event marked as surprise
                // OR 3) event marked to always show
                if (slotDate <= now || slot.surprise || slot.showAlways) {
                    const li = document.createElement('li');
                    li.classList.add(slot.eventType || 'general');

                    if (slot.surprise && slotDate > now) {
                        // Future surprise event - show placeholder
                        li.innerHTML = `
              <strong>Surprise event</strong><br />
              ${slot.datetime.replace('T', ' ')}<br />
              <em>Details will be revealed later.</em>
            `;
                    } else {
                        // Show real event info
                        li.innerHTML = `
              <strong>${slot.title}</strong><br />
              ${slot.datetime.replace('T', ' ')}<br />
              <em>${slot.description}</em>
            `;
                    }

                    listElement.appendChild(li);
                }
            });
        })
        .catch(error => {
            console.error('Error loading timeslots:', error);
            listElement.innerHTML = '<li>Failed to load events.</li>';
        });
});
