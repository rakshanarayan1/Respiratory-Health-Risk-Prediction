const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');

function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Display user message
  chatbox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
  userInput.value = '';

  // Send to backend
  fetch('http://127.0.0.1:5000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: message })
  })
  .then(res => res.json())
  .then(data => {
    const reply = data.reply || data.error || "Something went wrong";
    chatbox.innerHTML += `<p><strong>Bot:</strong> ${reply}</p>`;
    chatbox.scrollTop = chatbox.scrollHeight;
  });
}
function checkHealthRisk() {
  const location = document.getElementById('locationInput').value.trim();
  const asthma = document.getElementById('asthmaCheck').checked;

  if (!location) {
    document.getElementById('healthResult').innerText = "Please enter a location.";
    return;
  }

  fetch("http://127.0.0.1:5000/health-risk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location: location, asthma: asthma })
  })
  .then(res => res.json())
  .then(data => {
    const result = `
      <strong>Risk Level:</strong> ${data.risk}<br>
      <strong>Advice:</strong> ${data.advice}<br>
      <strong>AQI:</strong> ${data.aqi}<br>
      <strong>Heart Rate:</strong> ${data.wearable.heart_rate} bpm<br>
      <strong>SpO2:</strong> ${data.wearable.spo2}%<br>
      <strong>Cough Count:</strong> ${data.wearable.cough_count}
    `;
    document.getElementById('healthResult').innerHTML = result;
  })
  .catch(err => {
    document.getElementById('healthResult').innerText = "Error fetching data.";
    console.error(err);
  });
}
