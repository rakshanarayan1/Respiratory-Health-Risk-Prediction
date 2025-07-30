// chatbot.js
// Drives the Chat & Alerts page

document.addEventListener('DOMContentLoaded', () => {
  // auth guard
  if (!sessionStorage.getItem('userEmail')) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('send-btn')
          .addEventListener('click', sendChat);

  loadAlerts();
});

async function sendChat() {
  const inputEl = document.getElementById('chat-input');
  const chatbox = document.getElementById('chatbox');
  const userText = inputEl.value.trim();
  if (!userText) return;

  appendMessage('You', userText);
  inputEl.value = '';

  try {
    const res = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userText })
    });
    const { reply, error } = await res.json();
    if (res.ok) {
      appendMessage('Bot', reply);
      logAlert(reply);
    } else {
      appendMessage('Error', error || 'Something went wrong');
    }
  } catch (err) {
    appendMessage('Error', err.message);
  }
}

function appendMessage(sender, text) {
  const chatbox = document.getElementById('chatbox');
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Simple alert log in localStorage
function logAlert(text) {
  const logs = JSON.parse(localStorage.getItem('alertLog') || '[]');
  logs.unshift({ time: new Date().toLocaleString(), text });
  localStorage.setItem('alertLog', JSON.stringify(logs));
  loadAlerts();
}

function loadAlerts() {
  const list = document.getElementById('alert-log');
  const logs = JSON.parse(localStorage.getItem('alertLog') || '[]');
  list.innerHTML = logs
    .map(l => `<li><em>${l.time}</em> – ${l.text}</li>`)
    .join('');
}
