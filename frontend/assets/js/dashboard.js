document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  if (!localStorage.getItem('airhealthUser')) {
    window.location.href = 'index.html';
    return;
  }

  const profile = JSON.parse(localStorage.getItem('airhealthProfile') || '{}');
  document.getElementById('pName').textContent = profile.name || "N/A";
  document.getElementById('pAge').textContent = profile.age || "N/A";
  document.getElementById('pAsthma').textContent = profile.asthma || "No";
  document.getElementById('pLocation').textContent = profile.location || "N/A";

  const asthmaStr = profile.asthma.toLowerCase() === 'yes';
  const healthForm = document.getElementById('health-form');
  const riskOutput = document.getElementById('risk-output');

  // Sync Wearable Data
  document.getElementById('sync-wearable').addEventListener('click', () => {
    riskOutput.style.display = 'block';
    riskOutput.textContent = 'Syncing wearable data...';
    fetch('http://localhost:5000/health-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: profile.location, asthma: asthmaStr })
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById('wearable-hr-input').value = data.heart_rate;
      document.getElementById('wearable-spo2-input').value = data.spo2;
      document.getElementById('wearable-cough-input').value = data.cough_count;
      riskOutput.style.display = 'none';
    })
    .catch(err => {
      console.error(err);
      riskOutput.textContent = 'Error syncing wearable data.';
    });
  });

  // Calculate Risk
  healthForm.addEventListener('submit', e => {
    e.preventDefault();
    const payload = { location: profile.location, asthma: asthmaStr };
    const hrInput = document.getElementById('wearable-hr-input').value;
    const spo2Input = document.getElementById('wearable-spo2-input').value;
    const coughInput = document.getElementById('wearable-cough-input').value;

    // Include wearable if provided
    if (hrInput && spo2Input && coughInput) {
      payload.heart_rate = Number(hrInput);
      payload.spo2 = Number(spo2Input);
      payload.cough_count = Number(coughInput);
    }

    // Send to backend
    riskOutput.style.display = 'block';
    riskOutput.textContent = 'Calculating risk...';
    fetch('http://localhost:5000/health-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById('aqi-value').textContent = data.aqi ?? 'N/A';
      document.getElementById('aqi-advice').textContent =
        data.aqi <= 50 ? 'Good air quality.' : 'Poor air quality – wear a mask.';
      riskOutput.innerHTML = `
        <p><strong>Risk Level:</strong> ${data.risk}</p>
        <p><strong>Advice:</strong> ${data.advice}</p>
        <p><strong>Heart Rate:</strong> ${data.heart_rate} bpm</p>
        <p><strong>SpO₂:</strong> ${data.spo2}%</p>
        <p><strong>Cough Count:</strong> ${data.cough_count}</p>
      `;
    })
    .catch(err => {
      console.error(err);
      riskOutput.textContent = 'Error fetching health risk data.';
    });
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('airhealthUser');
    window.location.href = 'index.html';
  });
});

