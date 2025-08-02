document.addEventListener('DOMContentLoaded', () => {
  // Redirect if not logged in
  if (!localStorage.getItem('airhealthUser')) {
    window.location.href = 'index.html';
    return;
  }

  // Load user profile stored in localStorage
  const profile = JSON.parse(localStorage.getItem('airhealthProfile') || '{}');
  const riskOutput = document.getElementById('risk-output');

  // Helper: passthrough smoking value (backend maps it)
  function smokingToFeature(smk) {
    return smk;
  }

  // Helper: convert asthma yes/no to boolean
  function asthmaToBool(asthmaVal) {
    return asthmaVal.toLowerCase() === 'yes';
  }

  // Calculate Risk button click handler
  document.getElementById('calculate-risk-btn').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent page reload on button click

    const location = profile.location;
    const asthmaVal = document.getElementById('asthma').value.trim();
    const smokingVal = document.getElementById('smoking').value.trim();

    // Additional profile data or defaults
    const ageVal = profile.age || 30;
    const chronicResp = profile.chronicRespiratory || 'none';
    const heartDisease = profile.heartDisease || 'none';

    // Wearable inputs (optional)
    const hrInput = document.getElementById('wearable-hr-input').value;
    const spo2Input = document.getElementById('wearable-spo2-input').value;
    const coughInput = document.getElementById('wearable-cough-input').value;

    // Validate required inputs
    if (!location || !asthmaVal || !smokingVal) {
      riskOutput.style.display = 'block';
      riskOutput.innerHTML = `<p style="color:red;"><strong>Error:</strong> Please provide your location, smoking, and asthma status.</p>`;
      return;
    }

    // Build payload to send to backend
    const payload = {
      location: location,
      age: Number(ageVal),
      chronic_respiratory: chronicResp.toLowerCase(),
      heart_disease: heartDisease.toLowerCase(),
      asthma: asthmaToBool(asthmaVal),
      smoking: smokingToFeature(smokingVal)
    };

    if (hrInput && spo2Input && coughInput) {
      payload.heart_rate = Number(hrInput);
      payload.spo2 = Number(spo2Input);
      payload.cough_count = Number(coughInput);
    }

    riskOutput.style.display = 'block';
    riskOutput.innerHTML = `<p><em>Calculating risk...</em></p>`;

    // Call backend /health-risk endpoint
    fetch('http://localhost:5000/health-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        console.log('Risk API response:', data);

        // Update AQI, PM2.5, PM10 display
        document.getElementById('aqi-value').textContent = data.aqi ?? 'N/A';
        document.getElementById('pm25-value').textContent = data.pm25 ?? 'N/A';
        document.getElementById('pm10-value').textContent = data.pm10 ?? 'N/A';

        document.getElementById('aqi-advice').textContent =
          data.aqi <= 50 ? 'Good air quality.' : 'Poor air quality – wear a mask.';

        // Show all health risk results and advice as bullet list
        riskOutput.style.display = 'block';
        riskOutput.innerHTML = `
          <h3>Health Risk Assessment Results</h3>
          <p><strong>Risk Level:</strong> <span style="color: ${data.risk === 'Low Risk' ? 'green' : 'red'};">${data.risk ?? 'N/A'}</span></p>
          <p><strong>Risk Probability:</strong> ${data.risk_probability ? data.risk_probability + '%' : 'N/A'}</p>
          <p><strong>Heart Rate:</strong> ${data.heart_rate ?? 'N/A'} bpm</p>
          <p><strong>SpO₂:</strong> ${data.spo2 ?? 'N/A'}%</p>
          <p><strong>Cough Count:</strong> ${data.cough_count ?? 'N/A'}</p>
          <h4>Personalized Advice:</h4>
          <ul>
            ${
              Array.isArray(data.advice)
                ? data.advice.map(advice => `<li>${advice}</li>`).join('')
                : `<li>${data.advice}</li>`
            }
          </ul>
        `;
        riskOutput.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(err => {
        console.error('Error fetching health risk data:', err);
        riskOutput.style.display = 'block';
        riskOutput.innerHTML = `<p style="color:red;"><strong>Error:</strong> Failed to fetch health risk data. Please try again.</p>`;
      });
  });

  // Sync Wearable Data button click handler
  document.getElementById('sync-wearable').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent page reload

    const location = profile.location;
    const asthmaVal = document.getElementById('asthma').value.trim();
    const smokingVal = document.getElementById('smoking').value.trim();
    const ageVal = profile.age || 30;
    const chronicResp = profile.chronicRespiratory || 'none';
    const heartDisease = profile.heartDisease || 'none';

    if (!location || !asthmaVal || !smokingVal) {
      riskOutput.style.display = 'block';
      riskOutput.innerHTML = `<p style="color:red;"><strong>Error:</strong> Please provide your location, smoking, and asthma status.</p>`;
      return;
    }

    riskOutput.style.display = 'block';
    riskOutput.innerHTML = '<p><em>Syncing wearable data...</em></p>';

    // Request simulated wearable data from backend
    fetch('http://localhost:5000/health-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: location,
        age: Number(ageVal),
        chronic_respiratory: chronicResp.toLowerCase(),
        heart_disease: heartDisease.toLowerCase(),
        asthma: asthmaToBool(asthmaVal),
        smoking: smokingToFeature(smokingVal)
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        console.log('Wearable sync response:', data);

        document.getElementById('wearable-hr-input').value = data.heart_rate ?? '';
        document.getElementById('wearable-spo2-input').value = data.spo2 ?? '';
        document.getElementById('wearable-cough-input').value = data.cough_count ?? '';

        // Use simulated data to recalculate risk
        const payload = {
          location: location,
          age: Number(ageVal),
          chronic_respiratory: chronicResp.toLowerCase(),
          heart_disease: heartDisease.toLowerCase(),
          asthma: asthmaToBool(asthmaVal),
          smoking: smokingToFeature(smokingVal),
          heart_rate: data.heart_rate,
          spo2: data.spo2,
          cough_count: data.cough_count
        };

        return fetch('http://localhost:5000/health-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      })
      .then(res2 => {
        if (!res2.ok) throw new Error('Network response was not ok');
        return res2.json();
      })
      .then(riskData => {
        console.log('Final risk data:', riskData);

        document.getElementById('aqi-value').textContent = riskData.aqi ?? 'N/A';
        document.getElementById('pm25-value').textContent = riskData.pm25 ?? 'N/A';
        document.getElementById('pm10-value').textContent = riskData.pm10 ?? 'N/A';
        document.getElementById('aqi-advice').textContent =
          riskData.aqi <= 50 ? 'Good air quality.' : 'Poor air quality – wear a mask.';

        riskOutput.style.display = 'block';
        riskOutput.innerHTML = `
          <h3>Health Risk Assessment Results</h3>
          <p><strong>Risk Level:</strong> <span style="color: ${riskData.risk === 'Low Risk' ? 'green' : 'red'};">${riskData.risk ?? 'N/A'}</span></p>
          <p><strong>Risk Probability:</strong> ${riskData.risk_probability ? riskData.risk_probability + '%' : 'N/A'}</p>
          <p><strong>Heart Rate:</strong> ${riskData.heart_rate ?? 'N/A'} bpm</p>
          <p><strong>SpO₂:</strong> ${riskData.spo2 ?? 'N/A'}%</p>
          <p><strong>Cough Count:</strong> ${riskData.cough_count ?? 'N/A'}</p>
          <h4>Personalized Advice:</h4>
          <ul>
            ${
              Array.isArray(riskData.advice)
                ? riskData.advice.map(advice => `<li>${advice}</li>`).join('')
                : `<li>${riskData.advice}</li>`
            }
          </ul>
        `;
        riskOutput.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(error => {
        console.error('Error fetching wearable or risk data:', error);
        riskOutput.style.display = 'block';
        riskOutput.innerHTML = `<p style="color:red;"><strong>Error:</strong> Failed to fetch health risk data. Please try again.</p>`;
      });
  });

  // Logout handler
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('airhealthUser');
    window.location.href = 'index.html';
  });
});
