let ws, currentUser;
let currentRoomId = null;

// Load rooms when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the page
  document.getElementById("message").disabled = true;
});

// Function to connect to WebSocket
function connect() {
  const name = document.getElementById("name").value;
  
  if (!name || name.trim() === '') {
    alert("Please enter your name first!");
    return;
  }
  
  // Use the correct WebSocket URL (using the server.port from application.properties)
<<<<<<< HEAD
  ws = new WebSocket(`ws://192.168.1.2:8100/hello`);
=======
  ws = new WebSocket(`ws://192.168.1.2:8100/hello`);
>>>>>>> 349eb05d8d6c7a20e92e8fcb1e820f998151b3e3

  // Connection opened
  ws.onopen = function() {
    console.log("WebSocket connection established");
    document.getElementById("connectButton").disabled = true;
    document.getElementById("connectButton").value = "Connected";
    document.getElementById("name").disabled = true;
    currentUser = name;
    document.getElementById("message").disabled = false;
    
    // Load rooms after successful connection
    loadRooms();
  };

  // Connection error
  ws.onerror = function(error) {
    console.error("WebSocket error:", error);
    alert("Could not connect to the server. Please try again later.");
  };

  // Connection closed
  ws.onclose = function() {
    console.log("WebSocket connection closed");
    document.getElementById("connectButton").disabled = false;
    document.getElementById("connectButton").value = "Connect";
    document.getElementById("name").disabled = false;
    document.getElementById("message").disabled = true;
    alert("Connection closed. Please reconnect.");
  };

  // Message received
  ws.onmessage = function(e) {
    console.log("Message received:", e.data);
    printMessage(e.data);
  };
}

// Function to load all rooms
function loadRooms() {
  const roomsContainer = document.getElementById("rooms");
  roomsContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>';
  
  fetch('/rooms/data')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      roomsContainer.innerHTML = '';
      
      if (data.length === 0) {
        roomsContainer.innerHTML = '<p class="text-center">No rooms available</p>';
        return;
      }
      
      data.forEach(room => {
        const roomElement = document.createElement("div");
        roomElement.className = "room-item";
        roomElement.innerHTML = `
          <strong>${room.roomName}</strong>
          <span class="badge badge-${room.type === 'PUBLIC' ? 'success' : 'secondary'} float-right">${room.type}</span>
          <p class="mb-0 small">Created: ${new Date(room.createdAt).toLocaleString()}</p>
        `;
        
        // Join room when clicked
        roomElement.onclick = function() {
          joinRoom(room.roomId, room.roomName);
        };
        
        roomsContainer.appendChild(roomElement);
      });
    })
    .catch(error => {
      console.error("Error fetching rooms:", error);
      roomsContainer.innerHTML = `<p class="text-danger">Error loading rooms: ${error.message}</p>`;
    });
}

// Function to join a room
function joinRoom(roomId, roomName) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert("Please connect to the server first!");
    return;
  }
  
  currentRoomId = roomId;
  document.getElementById("currentRoomName").textContent = roomName;
  document.getElementById("messages").innerHTML = '';
  
  // Send a message to the server to join the room
  const joinMessage = {
    type: 'JOIN',
    roomId: roomId,
    name: currentUser
  };
  
  ws.send(JSON.stringify(joinMessage));
  console.log(`Joined room: ${roomName} (ID: ${roomId})`);
}

// Function to print a message
function printMessage(data) {
  let messages = document.getElementById("messages");
  let messageData = JSON.parse(data);
  let newMessage = document.createElement("div");
  
  // Check if it's own message or from someone else
  if (messageData.name === currentUser) {
    newMessage.className = "outgoing-message";
    newMessage.innerHTML = `${messageData.message}`;
  } else {
    newMessage.className = "incoming-message";
    newMessage.innerHTML = `<strong>${messageData.name}:</strong> ${messageData.message}`;
  }
  
  messages.appendChild(newMessage);
  
  // Auto-scroll to the newest message
  messages.scrollTop = messages.scrollHeight;
}

// Function to send a message
function sendToGroupChat() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert("Please connect to the server first!");
    return;
  }
  
  if (!currentRoomId) {
    alert("Please select a room first!");
    return;
  }
  
  let messageText = document.getElementById("message").value.trim();
  if (!messageText) return;
  
  document.getElementById("message").value = "";
  
  let messageObject = {
    type: 'MESSAGE',
    roomId: currentRoomId,
    name: currentUser,
    message: messageText
  };
  
  // Add the message locally
  let newMessage = document.createElement("div");
  newMessage.className = "outgoing-message";
  newMessage.innerHTML = messageText;
  document.getElementById("messages").appendChild(newMessage);
  
  // Auto-scroll to the newest message
  const messagesContainer = document.getElementById("messages");
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Send the message
  ws.send(JSON.stringify(messageObject));
}

// Listen for Enter key on message input
document.getElementById("message").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendToGroupChat();
  }
});