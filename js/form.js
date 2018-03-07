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

  // Clone last set, copy value from select field since clone does not preserve
  // the chosen value.
  var newSet = entries.lastElementChild.cloneNode(true);
  newSet.getElementsByTagName("select")[0].value =
    entries.lastElementChild.getElementsByTagName("select")[0].value
  entries.appendChild(newSet);

  // Update form elements to have unique names.
  Array.from(entries.children).forEach(function(entry, index) {
    Array.from(entry.getElementsByTagName("select"))
      .forEach(select => updateNameSuffix(select, index));
    Array.from(entry.getElementsByTagName("input"))
      .forEach(input => updateNameSuffix(input, index));
  });
      
}

// Replaces the numeric suffix of an element name with the provided index.
// Breaks if element name is not of the form "foo_n".
function updateNameSuffix(element, index) {
  var elementParts = element.name.split("_");
  elementParts[elementParts.length - 1] = index;
  element.name = elementParts.join("_");
  element.id = element.name;
}
