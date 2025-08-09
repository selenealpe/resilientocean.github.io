// =======================
// modal.js
// =======================

// Correct prices (EUR) — these must match data-item-name strings exactly
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
    // Ensure price gets set after index sets item fields
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
  if (document.getElementById('accountLink')) return;
  try {
    const session = JSON.parse(localStorage.getItem('resilientUser') || 'null');
    if (session && session.email) {
      const a = document.createElement('a');
      a.id = 'accountLink';
      a.href = 'account.html';
      a.className = 'hover:text-green-700 text-sm font-semibold';
      a.textContent = 'My Account';
      mount.appendChild(a);
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

// Handle universal form submit (price total prep; auth.js handles account/cart/emails)
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

// Open Privacy/Terms in big modal
function openDoc(path, title='Document') {
  fetch(path)
    .then(r => r.text())
    .then(html => {
      document.getElementById('docTitle').textContent = title;
      document.getElementById('docBody').innerHTML = html;
      openModal('docModal');
    })
    .catch(() => {
      document.getElementById('docTitle').textContent = title;
      document.getElementById('docBody').innerHTML = "<p>Sorry, this document could not be loaded right now.</p>";
      openModal('docModal');
    });
}
