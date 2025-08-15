function updateFoodRequirement() {
    var attendance = document.getElementById('attendance_dinner').value;
    var food = document.getElementById('food');
    if (attendance === "Nein") {
        food.required = false;
        food.disabled = true;
        food.value = "";

        // Hide and clear "Andere" field
        document.getElementById('food-other-container').style.display = 'none';
        document.getElementById('food-other').required = false;
        document.getElementById('food-other').value = '';
    } else {
        food.required = true;
        food.disabled = false;
    }
}


// Show/hide "Andere"-explanation as before
function updateFoodOther() {
    var foodSelect = document.getElementById('food');
    var otherContainer = document.getElementById('food-other-container');
    var foodOtherInput = document.getElementById('food-other');
    if (foodSelect.value === 'Andere' && !foodSelect.disabled) {
        otherContainer.style.display = 'block';
        foodOtherInput.required = true;
    } else {
        otherContainer.style.display = 'none';
        foodOtherInput.required = false;
        foodOtherInput.value = '';
    }
}

document.getElementById('attendance_dinner').addEventListener('change', function () {
    updateFoodRequirement();
    updateFoodOther();
});


document.getElementById('food').addEventListener('change', updateFoodOther);

// Run once on page load in case you prefill via browser
updateFoodRequirement();
updateFoodOther();