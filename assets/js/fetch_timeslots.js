const slotDate = new Date(slot.datetime);
const showOnDate = slot.show_on ? new Date(slot.show_on) : null;

// Determine visibility
let isVisible = false;

// Surprises are always visible as placeholders
if (slot.surprise) {
    isVisible = true;
} else if (showOnDate) {
    if (showOnDate <= now) isVisible = true;
} else if (slotDate <= now || slot.showAlways) {
    isVisible = true;
}

// Rendering
if (isVisible) {
    const li = document.createElement('li');
    li.classList.add(slot.eventType || 'general');

    if (slot.surprise && (slotDate > now || (showOnDate && showOnDate > now))) {
        // Show placeholder for surprise
        li.innerHTML = `
            <strong>Überraschung</strong><br />
            ${slot.datetime.replace('T', ' ')}<br />
            <em>Details werden später bekannt gegeben.</em>
        `;
    } else {
        // Show normal event info
        let placeHtml = slot.place ? `<br />📍 ${slot.place}` : '';
        let mapsHtml = slot.maps_link ? `
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
        ` : '';
        let websiteHtml = slot.website ? `<br /><a href="${slot.website.startsWith('http') ? slot.website : 'https://' + slot.website}" target="_blank" rel="noopener noreferrer">🌐 Website</a>` : '';

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
