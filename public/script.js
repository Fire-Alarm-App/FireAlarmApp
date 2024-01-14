const subscribeButton = document.getElementById('subscribe');
const requestButton = document.getElementById('simulateRequestButton');

async function subscribe() {
  if ('serviceWorker' in navigator) {
    let sw = await navigator.serviceWorker.ready;
    let push = await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BDNhhvCejJLGp8C1DSl0rzwdmONmv7EsfJTk0TG0flkvmvacsY9IkufqR63Ykfs8o-goFKEYxra7vUwxBURj8rs' // Replace with your actual public key
    });

    const data = {
      sub: push,
      user: 'bcsotty' // Replace with actual user info, if needed
    };

    fetch('/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok)
        alert('Successfully subscribed to fire alarm alerts!');
    });
  }
}

subscribeButton.addEventListener('click', subscribe);

// Allows offline support for PWA
if ('serviceWorker' in navigator) {
  addEventListener('load', async () => {
    await navigator.serviceWorker.register('./sw.js');
    console.log('Service Worker Registered');
  });
} else {
  document.getElementById('subscribe').toggleAttribute('hidden');
}

///////

document.addEventListener('DOMContentLoaded', function() {
    var simulateRequestBtn = document.getElementById("simulateRequestButton");
    var authModalElement = document.getElementById('authModal');

    if (simulateRequestBtn && authModalElement) {
        var authModal = new bootstrap.Modal(authModalElement);

        simulateRequestBtn.addEventListener('click', function() {
            console.log("Simulate Fire button clicked"); // Debugging line
            authModal.show();
        });
    } else {
        console.error('Element(s) not found');
    }
});


////

/*
document.addEventListener('DOMContentLoaded', function() {
    var simulateRequestBtn = document.getElementById("simulateRequestButton");

    if (simulateRequestBtn) {
        simulateRequestBtn.addEventListener('click', function() {
            console.log("Simulate Fire button clicked"); // Debugging line
            var userConfirmed = confirm("🔥FIRE DETECTED! CONFIRM IF THERE IS A FIRE?🔥");
            
            if (userConfirmed) {
                console.log("User confirmed the alert.");
                // Place your code here to handle the confirmation
                // For example, sending data to the server
            } else {
                console.log("User canceled the alert.");
            }
        });
    } else {
        console.error('Simulate Fire button not found');
    }
});
*/

/*
document.addEventListener('DOMContentLoaded', function() {
    var simulateRequestBtn = document.getElementById("simulateRequestButton");
    var modal = document.getElementById("customModal");
    var span = document.getElementsByClassName("close")[0];
    var acceptButton = document.getElementById("acceptButton");
    var denyButton = document.getElementById("denyButton");

    simulateRequestBtn.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    acceptButton.onclick = function() {
        console.log("Accepted");
        modal.style.display = "none";
        // Add logic for accept action
    }

    denyButton.onclick = function() {
        console.log("Denied");
        modal.style.display = "none";
        // Add logic for deny action
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
*/

document.addEventListener('DOMContentLoaded', function() {
    var simulateRequestBtn = document.getElementById("simulateRequestButton");
    var modal = document.getElementById("customModal");
    var span = document.getElementsByClassName("close")[0];
    var acceptButton = document.getElementById("acceptButton");
    var denyButton = document.getElementById("denyButton");
    var tableBody = document.getElementById("tableBody");

    simulateRequestBtn.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    acceptButton.onclick = function() {
        console.log("Accepted");
        modal.style.display = "none";
        updateStatus("Confirmed");
    }

    denyButton.onclick = function() {
        console.log("Denied");
        modal.style.display = "none";
        updateStatus("Denied");
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function updateStatus(status) {
        // Example logic to add the status to the table
        var newRow = tableBody.insertRow(0);
        var cell1 = newRow.insertCell(0);
        var cell2 = newRow.insertCell(1);
        var cell3 = newRow.insertCell(2);
        var cell4 = newRow.insertCell(3);

        cell1.innerHTML = new Date().toLocaleString(); // Current date and time
        cell2.innerHTML = "User123"; // Example owner
        cell3.innerHTML = "Location1"; // Example location
        cell4.innerHTML = status; // Status

        // TODO: Add logic to send this status to your server or process it as needed
    }

    // TODO: Implement pagination functionality
    function fetchRequestHistory(page) {
        // Fetch logic here
    }

    // TODO: Call fetchRequestHistory initially and set up pagination
    fetchRequestHistory(1);
});
