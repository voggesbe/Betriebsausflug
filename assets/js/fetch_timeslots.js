document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const listElement = document.getElementById('timeslot-list');
    const base = window.location.origin + '/Betriebsausflug';

    fetch(`${base}/assets/data/timeslots.json`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(timeslots => {
            timeslots.forEach(slot => {
                const slotDate = new Date(slot.datetime);

                if (isNaN(slotDate.getTime())) {
                    console.warn('Invalid date in timeslot:', slot.datetime);
                    return;
                }

                if (slotDate <= now || slot.surprise || slot.showAlways) {
                    const li = document.createElement('li');
                    li.classList.add(slot.eventType || 'general');
                    li.setAttribute('data-datetime', slot.datetime);

                    if (slot.surprise && slotDate > now) {
                        li.innerHTML = `
              <strong>Surprise event</strong><br />
              ${slot.datetime.replace('T', ' ')}<br />
              <em>Details will be revealed later.</em>
            `;
                    } else {
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
