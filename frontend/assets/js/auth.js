// Toggle between Sign In and Sign Up forms
function showSignin() {
  document.getElementById('signin-form').style.display = 'grid';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('signin-toggle').classList.add('active');
  document.getElementById('signup-toggle').classList.remove('active');
}

function showSignup() {
  document.getElementById('signin-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'grid';
  document.getElementById('signup-toggle').classList.add('active');
  document.getElementById('signin-toggle').classList.remove('active');
}

// Sign In form submit handler
document.getElementById('signin-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;

  const user = JSON.parse(localStorage.getItem('airhealthProfile') || '{}');

  if (user.email === email && user.password === password) {
    localStorage.setItem('airhealthUser', email);
    window.location.href = 'chatbot.html';  // Redirecting to Home page on sign in
  } else {
    alert("Invalid email or password. Try again.");
  }
});

// Sign Up form submit handler
document.getElementById('signup-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm-password').value;
  const name = document.getElementById('signup-name').value.trim();
  const gender = document.getElementById('signup-gender').value;
  const location = document.getElementById('location').value.trim();
  const chronicResp = document.getElementById('respiratory').value;
  const heartDisease = document.getElementById('heart').value;
  const smoking = document.getElementById('smoking').value;

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  if (!email || !password || !name || !gender || !location || !chronicResp || !heartDisease || !smoking) {
    alert('Please fill in all fields.');
    return;
  }

  const profile = {
    email,
    password,
    name,
    gender,
    location,
    chronicRespiratory: chronicResp,
    heartDisease,
    smoking
  };

  localStorage.setItem('airhealthProfile', JSON.stringify(profile));
  localStorage.setItem('airhealthUser', email);

  alert('Signup successful! You can update your details any time on your personal page.');
  window.location.href = 'chatbot.html';  // Redirecting new users to Home page
});
