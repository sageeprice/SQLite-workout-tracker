
// Initiate an AJAX call for some workouts.
function loadQueryResponse() {
  const liftName = document.getElementById("exercise").value;
  console.log("Requesting all lifts of type: " + liftName);

  const qs = buildQueryString(liftName);
  console.log("Requesting URL: " + qs);
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = handleResponse;
  xhttp.open("GET", qs, true);
  xhttp.send();
}

function buildQueryString(liftName) {
  return "filteredLifts?" + "type=" + liftName.replace(" ", "+");
}

function handleResponse() {
  document.getElementById("test").innerHTML =
    this.responseText;
  console.log(this.responseText);
  console.log(this);
}
