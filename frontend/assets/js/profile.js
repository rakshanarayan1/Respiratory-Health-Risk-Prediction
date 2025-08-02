// Load profile from localStorage
const profile = JSON.parse(localStorage.getItem('airhealthProfile') || '{}');

// Populate the profile page form fields with stored data or defaults
document.getElementById('pName').value = profile.name || '';
document.getElementById('pEmail').value = profile.email || '';
document.getElementById('pGender').value = profile.gender || '';
document.getElementById('pLocation').value = profile.location || '';
document.getElementById('pChronicResp').value = profile.chronicRespiratory || '';
document.getElementById('pHeartDisease').value = profile.heartDisease || '';
document.getElementById('pSmoking').value = profile.smoking || '';

// Save updated profile on form submission
document.getElementById('profile-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // You may want to add validation here before saving

  const updatedProfile = {
    ...profile,  // Keep existing fields like email and password unchanged
    name: document.getElementById('pName').value.trim(),
    gender: document.getElementById('pGender').value,
    location: document.getElementById('pLocation').value.trim(),
    chronicRespiratory: document.getElementById('pChronicResp').value,
    heartDisease: document.getElementById('pHeartDisease').value,
    smoking: document.getElementById('pSmoking').value
  };

  localStorage.setItem('airhealthProfile', JSON.stringify(updatedProfile));
  alert("Profile updated successfully!");
});
