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

document.getElementById('signin-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;
  const user = JSON.parse(localStorage.getItem('airhealthProfile')||'{}');
  if (user.email === email && user.password === password) {
    localStorage.setItem('airhealthUser', email);
    window.location.href = 'dashboard.html';
  } else {
    alert("Invalid email or password. Try again.");
  }
});

document.getElementById('signup-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm-password').value;
  const name = document.getElementById('signup-name').value;
  const age = document.getElementById('signup-age').value;
  const asthma = document.getElementById('asthma-select').value;
  const location = document.getElementById('location').value;
  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }
  const profile = { email, password, name, age, asthma, location };
  localStorage.setItem('airhealthProfile', JSON.stringify(profile));
  localStorage.setItem('airhealthUser', email);
  window.location.href = 'dashboard.html';
});
