document.addEventListener('DOMContentLoaded', () => {
  // Redirect to login if not logged in
  if (!localStorage.getItem('airhealthUser')) {
    window.location.href = 'index.html';
    return;
  }

  // Load the user profile from localStorage
  const profile = JSON.parse(localStorage.getItem('airhealthProfile') || '{}');
  const riskOutput = document.getElementById('risk-output');

  // Helper to pass smoking value as-is (backend expects string)
  function smokingToFeature(smk) {
    return smk;
  }

  // Calculate Risk button click handler
  document.getElementById('calculate-risk-btn').addEventListener('click', (event) => {
    event.preventDefault();

    // Get profile values
    const location = profile.location;
    let ageVal = Number(profile.age);
    if (isNaN(ageVal) || ageVal <= 0) ageVal = 30; // default age if missing
    const chronicResp = profile.chronicRespiratory || 'none';
    const heartDisease = profile.heartDisease || 'none';
    const smokingVal = profile.smoking;

    // Wearable inputs (optional)
    const hrInput = document.getElementById('wearable-hr-input').value;
    const spo2Input = document.getElementById('wearable-spo2-input').value;
    const coughInput = document.getElementById('wearable-cough-input').value;

    // Validate required profile info exist
    if (!location || !chronicResp || !heartDisease || !smokingVal) {
      riskOutput.style.display = 'block';
      riskOutput.innerHTML = `<p style="color:red;"><strong>Error:</strong> Please complete your profile with all required health details.</p>`;
      return;
    }

    // Build payload
    const payload = {
      location: location,
      age: ageVal,
      chronic_respiratory: chronicResp.toLowerCase(),
      heart_disease: heartDisease.toLowerCase(),
      smoking: smokingToFeature(smokingVal)
    };

    // Add wearable data if all present
    if (hrInput && spo2Input && coughInput) {
      payload.heart_rate = Number(hrInput);
      payload.spo2 = Number(spo2Input);
      payload.cough_count = Number(coughInput);
    }

    riskOutput.style.display = 'block';
    riskOutput.innerHTML = `<p><em>Calculating risk...</em></p>`;

    console.log('Sending payload to backend:', payload);

    // Call backend health-risk endpoint
    fetch('http://localhost:5000/health-risk', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        console.log('Received risk data:', data);

        // Update AQI and pollutant values in UI
        document.getElementById('aqi-value').textContent = data.aqi ?? 'N/A';
        document.getElementById('pm25-value').textContent = data.pm25 ?? 'N/A';
        document.getElementById('pm10-value').textContent = data.pm10 ?? 'N/A';
        document.getElementById('aqi-advice').textContent =
          data.aqi <= 50 ? 'Good air quality.' : 'Poor air quality – wear a mask.';

        // Show detailed risk info with styled text and advice list
        riskOutput.innerHTML = `
          <h2 style="color:${data.risk === 'Low Risk' ? 'green' : 'red'}; margin-bottom: 0.8em;">
            ${data.risk ?? 'N/A'}
          </h2>
          <p><strong>Risk Probability:</strong> ${data.risk_probability ? data.risk_probability + '%' : 'N/A'}</p>
          <p><strong>Summary:</strong> ${data.report && data.report.Summary ? data.report.Summary : ''}</p>
          <h4>Personalized Advice:</h4>
          <ul>
            ${
              Array.isArray(data.advice)
                ? data.advice.map(item => `<li>${item.replace(/^\u2022\s*/, '')}</li>`).join('')
                : `<li>${data.advice}</li>`
            }
          </ul>
        `;
        riskOutput.scrollIntoView({behavior: 'smooth'});
      })
      .catch(err => {
        console.error('Error fetching health risk data:', err);
        riskOutput.style.display = 'block';
        riskOutput.innerHTML = `<p style="color:red;"><strong>Error:</strong> Failed to fetch health risk data. Please try again.</p>`;
      });
  });

  // Sync Wearable Data button click handler
  document.getElementById('sync-wearable').addEventListener('click', (event) => {
    event.preventDefault();

    const location = profile.location;
    let ageVal = Number(profile.age);
    if (isNaN(ageVal) || ageVal <= 0) ageVal = 30;
    const chronicResp = profile.chronicRespiratory || 'none';
    const heartDisease = profile.heartDisease || 'none';
    const smokingVal = profile.smoking;

    if (!location || !chronicResp || !heartDisease || !smokingVal) {
      riskOutput.style.display = 'block';
      riskOutput.innerHTML = `<p style="color:red;"><strong>Error:</strong> Please complete your profile with all required health details.</p>`;
      return;
    }

    riskOutput.style.display = 'block';
    riskOutput.innerHTML = '<p><em>Syncing wearable data...</em></p>';

    // Fetch simulated wearable data and then recalc risk with it
    fetch('http://localhost:5000/health-risk', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        location: location,
        age: ageVal,
        chronic_respiratory: chronicResp.toLowerCase(),
        heart_disease: heartDisease.toLowerCase(),
        smoking: smokingVal
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        console.log('Wearable sync response:', data);

        // Fill wearable inputs with simulated data
        document.getElementById('wearable-hr-input').value = data.heart_rate ?? '';
        document.getElementById('wearable-spo2-input').value = data.spo2 ?? '';
        document.getElementById('wearable-cough-input').value = data.cough_count ?? '';

        // Now recalc risk including wearable data
        const payload = {
          location: location,
          age: ageVal,
          chronic_respiratory: chronicResp.toLowerCase(),
          heart_disease: heartDisease.toLowerCase(),
          smoking: smokingVal,
          heart_rate: data.heart_rate,
          spo2: data.spo2,
          cough_count: data.cough_count
        };

        return fetch('http://localhost:5000/health-risk', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
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

        riskOutput.innerHTML = `
          <h2 style="color:${riskData.risk === 'Low Risk' ? 'green' : 'red'}; margin-bottom: 0.8em;">
            ${riskData.risk ?? 'N/A'}
          </h2>
          <p><strong>Risk Probability:</strong> ${riskData.risk_probability ? riskData.risk_probability + '%' : 'N/A'}</p>
          <p><strong>Summary:</strong> ${riskData.report && riskData.report.Summary ? riskData.report.Summary : ''}</p>
          <h4>Personalized Advice:</h4>
          <ul>
            ${
              Array.isArray(riskData.advice)
                ? riskData.advice.map(item => `<li>${item.replace(/^\u2022\s*/, '')}</li>`).join('')
                : `<li>${riskData.advice}</li>`
            }
          </ul>
        `;
        riskOutput.scrollIntoView({behavior: 'smooth'});
      })
      .catch(error => {
        console.error('Error fetching wearable/risk data:', error);
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
