/*
// TODO: send Post request with contents of sets when a submit button is hit.
var sets = {
  setList: [],

  addSet: function(liftName, weight, reps) {
    this.setList.push({
      liftName: liftName,
      weight: weight,
      reps: reps
    })
  },

  removeSet: function(position) {
    this.setList.splice(position, 1);
  }
};

var handlers = {
  addSet: function() {
    var liftName = document.getElementById('liftName');
    var weight = document.getElementById('weightInput');
    var reps = document.getElementById('repsInput');

    sets.addSet(liftName.value, weight.value, reps.value);
    
    // Reset these fields to empty, leave lift as is.
    weight.value = '';
    reps.value = '';
    
    view.displaySets();
  },
  removeSet: function(position) {
    sets.removeSet(position);
    
    view.displaySets();
  }
};

var view = {
  displaySets: function() {
    var setsUl = document.querySelector('ul');
    setsUl.innerHTML = '';

    sets.setList.forEach(function(set, position) {
      var setLi = document.createElement('li');
      var setLiText = set.liftName + ": " + set.weight + ' lbs for ' + set.reps + ' reps.';

      setLi.id = position;
      setLi.textContent = setLiText;
      setLi.appendChild(this.createDeleteButton());
      setsUl.appendChild(setLi);
    }, this);
  },
  createDeleteButton: function() {
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Remove';
    deleteButton.className = 'deleteButton';
    return deleteButton;
  },
  setUpEventListeners: function() {
    var setUl = document.querySelector('ul');
    setUl.addEventListener('click', function(event) {
      var setNumber = event.target.parentNode.id;

      var eventClicked = event.target;
      if (eventClicked.className === 'deleteButton') {
        handlers.removeSet(parseInt(eventClicked.parentNode.id));
      }
    });
  }
};

view.setUpEventListeners();


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

// Initiate form submission when enter is clicked.
// TODO: refactor to do this for each focusable element of the form.
var input = document.getElementById("liftName").addEventListener("keyup", triggerOnEnter);
var input2 = document.getElementById("weightInput").addEventListener("keyup", triggerOnEnter);
var input3 = document.getElementById("repsInput").addEventListener("keyup", triggerOnEnter);
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

