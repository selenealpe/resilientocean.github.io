// =======================
// modal.js
// =======================

// Correct prices (EUR) — must match data-item-name strings exactly
const PRICE_MAP = {
  // Insights
  "Integrating Nature into Risk Registers – 189.95 EUR": 189.95,
  "CSRD + ESRS E4 – 295.95 EUR": 295.95,
  "Financing Nature – 169.95 EUR": 169.95,

  // Toolkits
  "Materiality Scoping Templates – 399.00 EUR": 399.00,                     // (2 months)
  "Biodiversity Risk Dashboards – 249.00 EUR": 249.00,                      // (3 months)
  "MRV-ready Templates – 599.00 EUR (3-months)": 599.00
};

const CART_TOTAL_KEY = "resilientCartTotal";

// Load forms (modals) on ready
document.addEventListener("DOMContentLoaded", () => {
  fetch("forms.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("modalContainer").innerHTML = html;
      restoreAccountTabSafely();
      attachUniversalFormHandler();
      attachLoginFormHandler();
    })
    .catch(err => console.error("Failed to load forms:", err));
});

// Open/close modals
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.style.display = "block";
  document.body.style.overflow = "hidden";

  if (id === "universalModal") {
    setTimeout(setPriceFromSelectedItem, 0);
  }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.style.display = "none";
  document.body.style.overflow = "auto";
}
// Close on backdrop
window.addEventListener('click', (e) => {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(m => { if (e.target === m) closeModal(m.id); });
});

// Dedupe account link
function restoreAccountTabSafely() {
  const mount = document.getElementById('accountMount');
  if (!mount) return;
  // Clear existing auth links first (avoid duplicates)
  mount.innerHTML = "";

  try {
    const session = JSON.parse(localStorage.getItem('resilientUser') || 'null');
    if (session && session.email) {
      // Logged in: show My Account + Logout
      const acct = document.createElement('a');
      acct.id = 'accountLink';
      acct.href = 'account.html';
      acct.className = 'hover:text-green-700 text-sm font-semibold';
      acct.textContent = 'My Account';

      const sep = document.createElement('span');
      sep.textContent = '•';
      sep.className = 'text-gray-400';

      const out = document.createElement('a');
      out.href = '#';
      out.className = 'hover:text-green-700 text-sm font-semibold';
      out.textContent = 'Log out';
      out.onclick = (e) => { e.preventDefault(); logoutUser(); };

      mount.appendChild(acct);
      mount.appendChild(document.createTextNode(' '));
      mount.appendChild(sep);
      mount.appendChild(document.createTextNode(' '));
      mount.appendChild(out);
    } else {
      // Logged out: show Login
      const login = document.createElement('a');
      login.href = '#';
      login.className = 'hover:text-green-700 text-sm font-semibold';
      login.textContent = 'Log in';
      login.onclick = (e) => { e.preventDefault(); openModal('loginModal'); };
      mount.appendChild(login);
    }
  } catch(e){}
}

// Set price into hidden field by selected_item_name
function setPriceFromSelectedItem() {
  const f = document.getElementById('universalForm');
  if (!f) return;
  const name = f.querySelector('input[name="selected_item_name"]')?.value || '';
  const priceInput = f.querySelector('input[name="selected_item_price"]');
  if (!priceInput) return;

  const price = PRICE_MAP[name] ?? parseFloat((name.match(/([0-9]+(?:\.[0-9]{1,2})?)/) || [0,0])[1]);
  priceInput.value = isNaN(price) ? "0" : String(price);
}

// Maintain total
function updateCartTotalWithNewItem(priceStr) {
  const price = Number(priceStr || 0);
  if (isNaN(price)) return;
  let total = Number(localStorage.getItem(CART_TOTAL_KEY) || "0");
  if (isNaN(total)) total = 0;
  total += price;
  localStorage.setItem(CART_TOTAL_KEY, String(total));
}

// Handle universal form (price total prep; auth.js handles account/cart/emails)
function attachUniversalFormHandler() {
  const f = document.getElementById('universalForm');
  if (!f) return;
  f.addEventListener('submit', () => {
    try {
      setPriceFromSelectedItem();
      const price = f.querySelector('input[name="selected_item_price"]')?.value || "0";
      updateCartTotalWithNewItem(price);
    } catch(e) { console.warn('Total update skipped:', e); }
  });
}

// Login form handler (calls into auth.js)
function attachLoginFormHandler() {
  const f = document.getElementById('loginForm');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = f.login_email.value.trim().toLowerCase();
    const pass  = f.login_password.value;
    const remember = !!f.remember_me.checked;
    if (!email || !pass) return;
    if (typeof loginFromLoginPage === 'function') {
      loginFromLoginPage(email, pass, remember);
      closeModal('loginModal');
      restoreAccountTabSafely();
    }
  });
}

// Open Privacy/Terms in big modal — extract <main> content so it displays cleanly
function openDoc(path, title='Document') {
  fetch(path)
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const main = doc.querySelector('main');
      const content = main ? main.innerHTML : html; // fallback: whole doc
      document.getElementById('docTitle').textContent = title;
      document.getElementById('docBody').innerHTML = content;
      openModal('docModal');
    })
    .catch(() => {
      document.getElementById('docTitle').textContent = title;
      document.getElementById('docBody').innerHTML = "<p>Sorry, this document could not be loaded right now.</p>";
      openModal('docModal');
    });
}

// Simple logout that clears session & updates nav
function logoutUser() {
  localStorage.removeItem('resilientUser');
  localStorage.removeItem('rememberMe');
  restoreAccountTabSafely();
  // Optional: redirect to home
  window.location.href = 'index.html';
}
