// Load modal forms dynamically from forms.html
document.addEventListener("DOMContentLoaded", () => {
  fetch("forms.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("modalContainer").innerHTML = html;
      restoreAccountTab();
    })
    .catch(error => console.error("Failed to load modal forms:", error));
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

// Close modal when clicking outside content
window.onclick = function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
};

// Save login state from toolkit access form
function handleToolkitSubmission(event) {
  event.preventDefault();

  const email = document.querySelector('#toolkitEmail')?.value;
  const password = document.querySelector('#toolkitPassword')?.value;

  if (email && password) {
    localStorage.setItem('resilientUserEmail', email);
    localStorage.setItem('resilientUserPassword', password);
    localStorage.setItem('resilientUserLoggedIn', 'true');
    alert("You have now created a personal account at Resilient Ocean. You will be able to access the toolkits via your personal account tab at the top right of the home page.");
    showAccountTab();
    closeModal('toolkitModal');
  }
}

// Dynamically insert "My Account" tab in nav
function showAccountTab() {
  const nav = document.querySelector("nav");
  if (!document.getElementById("accountLink")) {
    const accountLink = document.createElement("a");
    accountLink.href = "account.html";
    accountLink.textContent = "My Account";
    accountLink.id = "accountLink";
    nav.appendChild(accountLink);
  }
}

// Restore account tab if already logged in
function restoreAccountTab() {
  if (localStorage.getItem("resilientUserLoggedIn") === "true") {
    showAccountTab();
  }
}

// Attach toolkit form handler
document.addEventListener("submit", function (e) {
  if (e.target && e.target.id === "toolkitForm") {
    handleToolkitSubmission(e);
  }
});
