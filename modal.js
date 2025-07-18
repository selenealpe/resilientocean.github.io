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

// Close modal by ID
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Close modal if user clicks outside modal content
window.onclick = function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
};

// Handle Toolkit Form Submission
function handleToolkitSubmission(event) {
  event.preventDefault();

  const email = document.querySelector('#toolkitEmail')?.value;
  const password = document.querySelector('#toolkitPassword')?.value;
  const firstName = document.querySelector('#toolkitFirstName')?.value;
  const institutionName = document.querySelector('#toolkitInstitutionName')?.value;
  const institutionType = document.querySelector('#toolkitInstitutionType')?.value;
  const toolkitSelected = document.querySelector('select[name="toolkit"]')?.value;

  if (email && password && firstName && institutionName && institutionType && toolkitSelected) {
    // Save user session
    const userData = {
      email,
      password,
      firstName,
      institutionName,
      institutionType,
      toolkitAccess: [toolkitSelected],
      loggedIn: true
    };

    localStorage.setItem('resilientUser', JSON.stringify(userData));

    alert("You have now created a personal account at Resilient Ocean. You will be able to access the toolkits via your personal account tab at the top right of the home page.");
    showAccountTab();
    closeModal('toolkitModal');
    window.location.href = "thanks.html";
  } else {
    alert("Please fill out all required fields.");
  }
}

// Dynamically insert “My Account” tab
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

// Restore tab if user is already logged in
function restoreAccountTab() {
  const session = localStorage.getItem("resilientUser");
  if (session) {
    const user = JSON.parse(session);
    if (user.loggedIn) {
      showAccountTab();
    }
  }
}

// Attach form submission for Toolkit access
document.addEventListener("submit", function (e) {
  if (e.target && e.target.id === "toolkitForm") {
    handleToolkitSubmission(e);
  }
});
