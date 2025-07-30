// Load profile data
const profile = JSON.parse(localStorage.getItem('airhealthProfile') || '{}');

document.getElementById('pName').value = profile.name || '';
document.getElementById('pEmail').value = profile.email || '';
document.getElementById('pAge').value = profile.age || '';
document.getElementById('pAsthma').value = profile.asthma || 'no';

// Save updated profile
document.getElementById('profile-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const updatedProfile = {
    ...profile,
    name: document.getElementById('pName').value,
    age: document.getElementById('pAge').value,
    asthma: document.getElementById('pAsthma').value
  };

  localStorage.setItem('airhealthProfile', JSON.stringify(updatedProfile));
  alert("Profile updated successfully!");
});
