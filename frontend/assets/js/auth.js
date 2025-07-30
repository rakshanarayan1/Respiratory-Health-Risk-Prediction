// Toggle between Sign In and Sign Up
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

// Sign In
document.getElementById('signin-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelector('input[type="password"]').value;

  const userData = JSON.parse(localStorage.getItem('airhealthProfile') || '{}');

  if (userData.email === email && userData.password === password) {
    localStorage.setItem('airhealthUser', email);
    window.location.href = 'dashboard.html';
  } else {
    alert("Invalid email or password. Try again.");
  }
});

// Sign Up
document.getElementById('signup-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelectorAll('input[type="password"]')[0].value;
  const confirm = this.querySelectorAll('input[type="password"]')[1].value;
  const name = this.querySelector('input[type="text"]').value;
  const age = this.querySelector('input[type="number"]').value;
  const asthma = document.getElementById('asthma-select').value;

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  const userProfile = {
    email,
    password,
    name,
    age,
    asthma
  };

  localStorage.setItem('airhealthProfile', JSON.stringify(userProfile));
  localStorage.setItem('airhealthUser', email);

  window.location.href = 'dashboard.html';
});
