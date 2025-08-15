document.addEventListener('DOMContentLoaded', function () {
  const now = new Date();

  document.querySelectorAll('.timeslot').forEach(slot => {
    const dateTimeStr = slot.getAttribute('data-datetime');
    const slotDate = new Date(dateTimeStr);

    // If parsing failed (Invalid Date), skip this slot (optionally log a warning)
    if (isNaN(slotDate.getTime())) {
      console.warn('Could not parse date:', dateTimeStr);
      return;
    }
    // Hide slots in the future
    if (slotDate > now) {
      slot.style.display = 'none';
    }
  });
});
