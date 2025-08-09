// Load modal forms (universal modal) on page ready
document.addEventListener("DOMContentLoaded", () => {
  fetch("forms.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("modalContainer").innerHTML = html;
      restoreAccountTab(); // from auth.js (shows "My Account" when logged in)
    })
    .catch(err => console.error("Failed to load forms:", err));
});

// Simple helpers to open/close modals
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Close when clicking backdrop
window.addEventListener('click', (e) => {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(m => {
    if (e.target === m) closeModal(m.id);
  });
});
