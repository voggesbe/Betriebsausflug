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
                const showOnDate = slot.show_on ? new Date(slot.show_on) : null;

                // Determine visibility
                let isVisible = false;

                if (showOnDate) {
                    // If show_on is defined, use it
                    if (showOnDate <= now) {
                        isVisible = true;
                    }
                } else {
                    // Fallback to original rules
                    if (slotDate <= now || slot.surprise || slot.showAlways) {
                        isVisible = true;
                    }
                }

                if (isVisible) {
                    const li = document.createElement('li');
                    li.classList.add(slot.eventType || 'general');

                    if (slot.surprise && slotDate > now && !showOnDate) {
                        // Future surprise event (hidden until show_on if defined)
                        li.innerHTML = `
                            <strong>Überraschung</strong><br />
                            ${slot.datetime.replace('T', ' ')}<br />
                            <em>Details werden später bekannt gegeben.</em>
                        `;
                    } else {
                        // Place (address) handling
                        let placeHtml = '';
                        if (slot.place) {
                            placeHtml = `<br />📍 ${slot.place}`;
                        }

                        // Maps link handling
                        let mapsHtml = '';
                        if (slot.maps_link) {
                            mapsHtml = `
                                <br />
                                <a href="${slot.maps_link}" target="_blank" rel="noopener noreferrer">📍 Auf Google Maps ansehen</a>
                                <div style="margin-top: 0.5em;">
                                    <iframe 
                                        src="${slot.maps_link.replace('/maps/', '/maps/embed?')}" 
                                        width="300" 
                                        height="200" 
                                        style="border:0; border-radius:8px;" 
                                        allowfullscreen="" 
                                        loading="lazy" 
                                        referrerpolicy="no-referrer-when-downgrade">
                                    </iframe>
                                </div>
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
                            <strong>${slot.title}</strong><br />
                            ${slot.datetime.replace('T', ' ')}<br />
                            <em>${slot.description}</em>
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
