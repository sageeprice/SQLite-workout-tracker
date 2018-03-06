/* Keeping this function as a reminder of how to set trigger on enter.
// Trigger the addSetButton on enter in any input field.
function triggerOnEnter(event) {

  // Cancel the default action, if needed
  event.preventDefault();
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    document.getElementById("addSetButton").click();
  }
}
*/

function addFormSet() {
  var entries = document.getElementById("exerciseEntries");
  console.log(entries);
  var newSet = entries.lastElementChild.cloneNode(true);
  console.log(newSet);
  entries.appendChild(newSet);
  console.log(newSet);
  // Update form elements to have unique names.
  Array.from(entries.children).forEach(function(entry, index) {
    Array.from(entry.getElementsByTagName("input")).forEach(function(input) {
      var inputParts = input.name.split("_");
      inputParts[inputParts.length - 1] = index;
      input.name = inputParts.join("_");
      input.id = input.name;
    });
  });
      
}

