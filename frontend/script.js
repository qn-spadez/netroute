function findRoute() {
    let source = document.getElementById("source").value;
    let destination = document.getElementById("destination").value;

    document.getElementById("result").innerText =
        "Finding route from " + source + " to " + destination;
}