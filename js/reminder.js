document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.reminder-row').forEach(function (row) {
    const reminderId = row.dataset.reminderId;
    const setDateButton = row.querySelector('.set-date-btn');
    const pickerPanel = row.querySelector('.reminder-date-panel');
    const dateInput = row.querySelector('.reminder-date-input');
    const saveButton = row.querySelector('.reminder-save-date');
    const dateLabel = row.querySelector('.reminder-date-label');

    if (!reminderId || !setDateButton || !pickerPanel || !dateInput || !saveButton || !dateLabel) return;

    const savedDate = SpendWise.getReminderDate(reminderId);
    if (savedDate) {
      dateLabel.textContent = 'Scheduled for ' + savedDate;
      dateLabel.style.fontWeight = '700';
    }

    setDateButton.addEventListener('click', function () {
      pickerPanel.hidden = !pickerPanel.hidden;
      if (!pickerPanel.hidden) {
        dateInput.focus();
      }
    });

    saveButton.addEventListener('click', function () {
      const selectedDate = dateInput.value;
      if (!selectedDate) {
        alert('Please choose a date first.');
        return;
      }
      SpendWise.setReminderDate(reminderId, selectedDate);
      dateLabel.textContent = 'Scheduled for ' + selectedDate;
      dateLabel.style.fontWeight = '700';
      pickerPanel.hidden = true;
      alert('Reminder date set for ' + selectedDate + '.');
    });
  });
});
