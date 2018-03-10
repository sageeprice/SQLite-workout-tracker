/* Functions triggered by buttons */

function addFormSet() {
  var entries = document.getElementById("exerciseEntries");

  // Clone last set, copy value from select field since clone does not preserve
  // the chosen value.
  var newSet = entries.lastElementChild.cloneNode(true);
  newSet.getElementsByTagName("select")[0].value =
    entries.lastElementChild.getElementsByTagName("select")[0].value
  entries.appendChild(newSet);

  renameSets();
  enableDeletion();
}

// Assigns all values in a set to empty.
function clearSet() {
  Array.from(event.target.parentNode.children).forEach(i => i.value = '');
}

// Deletes a set.
function deleteSet() {
  var clickedSet = event.target.parentNode;
  clickedSet.parentNode.removeChild(clickedSet);

  renameSets();
  if (document.getElementById("exerciseEntries").children.length === 1) {
    disableDelete();
  }
}


function disableDelete() {
  document.getElementsByName("delete_0")[0].disabled = true;
}

function enableDeletion() {
  Array.from(document.getElementsByClassName("delete-btn")).forEach(
      btn => btn.disabled = false);
}

/* Helper functions */

// Update form elements to have unique names.
function renameSets() {
  Array.from(document.getElementById("exerciseEntries").children)
    .forEach(function(entry, index) {
      Array.from(entry.getElementsByTagName("select"))
        .forEach(select => updateNameSuffix(select, index));
      Array.from(entry.getElementsByTagName("input"))
        .forEach(input => updateNameSuffix(input, index));
      Array.from(entry.getElementsByTagName("button"))
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
