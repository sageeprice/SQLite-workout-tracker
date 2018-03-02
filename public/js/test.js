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
      console.log(setNumber);

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

var input = document.getElementById("liftName").addEventListener("keyup", triggerOnEnter);

var input2 = document.getElementById("weightInput").addEventListener("keyup", triggerOnEnter);

var input3 = document.getElementById("repsInput").addEventListener("keyup", triggerOnEnter);


// Execute a function when the user releases a key on the keyboard
//input.addEventListener("keyup", triggerOnEnter);
//input2.addEventListener("keyup", triggerOnEnter);
//input3.addEventListener("keyup", triggerOnEnter);

//function postForm() {
//  var vorm = document.createElement("form");
//  form.setAttribute("method", "post");
//  form.setAttribute("action", "/lift");
//
//  var addField = function(k, v) {
//    var hiddenField = document.createElement("input");
//    hiddenField.setAttribute("type", "hidden");
//    hiddenField.setAttribute("name", k);
//    hiddenField.setAttribute("value", value);
//
//    form.appendChild(hiddenField);
//  };
//
//  for (var 
