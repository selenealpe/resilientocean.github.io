// Dynamically load modal content from forms.html
document.addEventListener("DOMContentLoaded", () => {
  fetch("forms.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("modalContainer").innerHTML = html;
    })
    .catch(error => {
      console.error("Failed to load modal forms:", error);
    });
});

// Open modal by ID
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Close modals when clicking outside the modal-content
window.onclick = function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
}
