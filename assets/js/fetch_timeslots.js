document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const listElement = document.getElementById('timeslot-list');
    const base = window.location.origin + '/Betriebsausflug';

    fetch(`${base}/assets/data/timeslots.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(timeslots => {
            timeslots.forEach(slot => {
                const slotDate = new Date(slot.datetime);
                const showOnDate = slot.show_on ? new Date(slot.show_on) : null;
                const isSurprise = slot.surprise || slot.eventType === 'surprise';

                // Determine visibility
                let isVisible = false;

                if (slot.showAlways) {
                    isVisible = true;
                } else if (isSurprise) {
                    // Surprises are always visible (as placeholder or full event)
                    isVisible = true;
                } else if (showOnDate) {
                    if (showOnDate <= now) isVisible = true;
                } else if (slotDate <= now) {
                    isVisible = true;
                }

                if (isVisible) {
                    const li = document.createElement('li');
                    li.classList.add(slot.eventType || 'general');

                    // Rendering
                    if (isSurprise && slotDate > now) {
                        // Show placeholder for future surprises
                        li.innerHTML = `
                            <strong>Überraschung</strong><br />
                            ${slot.datetime.replace('T', ' ')}<br />
                            <em>Details werden später bekannt gegeben.</em>
                        `;
                    } else {
                        // Place (address) handling
                        let placeHtml = slot.place ? `<br />📍 ${slot.place}` : '';

                        // Maps link handling
                        let mapsHtml = '';
                        if (slot.maps_link) {
                            mapsHtml = `
                                <br />
                                <a href="${slot.maps_link}" target="_blank" rel="noopener noreferrer">📍 Auf Google Maps ansehen</a>
                            `;
                        }

                        // Website handling
                        let websiteHtml = '';
                        if (slot.website) {
                            const url = slot.website.startsWith('http') ? slot.website : `https://${slot.website}`;
                            websiteHtml = `<br /><a href="${url}" target="_blank" rel="noopener noreferrer">🌐 Website</a>`;
                        }

                        // Final event HTML
                        li.innerHTML = `
                            <strong>${slot.title || 'Überraschung'}</strong><br />
                            ${slot.datetime.replace('T', ' ')}<br />
                            <em>${slot.description || 'Details werden später bekannt gegeben.'}</em>
                            ${placeHtml}
                            ${mapsHtml}
                            ${websiteHtml}
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
