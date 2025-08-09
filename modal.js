// =======================
// modal.js
// =======================

// Static price map (EUR) — exact names must match the data-item-name values used in buttons
const PRICE_MAP = {
  // Insights
  "Integrating Nature into Risk Registers – 89.95 EUR": 189.95, // per your latest request (updated price)
  "CSRD + ESRS E4 – 295.95 EUR": 295.95,
  "Financing Nature – 69.95 EUR": 169.95,

  // Toolkits
  "Materiality Scoping Templates – 399.00 EUR": 399.00,                    // (2 months)
  "Biodiversity Risk Dashboards – 299.00 EUR": 249.00,                     // 3 months (updated price)
  "MRV-ready Templates – 599.00 EUR (3-months)": 599.00
};

// Keys used elsewhere for consistency
const CART_KEY = "resilientCart";
const CART_TOTAL_KEY = "resilientCartTotal";

// Load modal forms (universal modal) on page ready
document.addEventListener("DOMContentLoaded", () => {
  fetch("forms.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("modalContainer").innerHTML = html;
      restoreAccountTabSafely(); // show "My Account" if logged in (without duplication)
      ensureUniversalFormPriceField();
      attachUniversalFormHandler();
    })
    .catch(err => console.error("Failed to load forms:", err));
});

// Simple helpers to open/close modals
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.style.display = "block";
    document.body.style.overflow = "hidden";

    // Defer so index.html's openUniversalModal() can set the hidden item fields first
    if (id === 'universalModal') {
      setTimeout(setPriceFromSelectedItem, 0);
    }
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

// ---------------------------
// Helpers for Account Tab
// ---------------------------
function restoreAccountTabSafely() {
  // This mirrors restoreAccountTab in auth.js, but no-ops if already present.
  const mount = document.getElementById('accountMount');
  if (!mount) return;

  if (document.getElementById('accountLink')) return; // already added

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
  } catch (e) {}
}

// ---------------------------
// Pricing + Cart Total Logic
// ---------------------------

// Ensure the universal form has a hidden price field
function ensureUniversalFormPriceField() {
  const f = document.getElementById('universalForm');
  if (!f) return;
  let priceInput = f.querySelector('input[name="selected_item_price"]');
  if (!priceInput) {
    priceInput = document.createElement('input');
    priceInput.type = 'hidden';
    priceInput.name = 'selected_item_price';
    f.appendChild(priceInput);
  }
}

// After index.html sets selected item fields, compute price and set hidden input
function setPriceFromSelectedItem() {
  const f = document.getElementById('universalForm');
  if (!f) return;

  const nameInput = f.querySelector('input[name="selected_item_name"]');
  const priceInput = f.querySelector('input[name="selected_item_price"]');

  if (!nameInput || !priceInput) return;

  const itemName = (nameInput.value || '').trim();
  const price = lookupPrice(itemName);

  // Write price (string) to hidden field
  priceInput.value = price ? String(price) : "0";
}

// Lookup by exact item name; returns Number
function lookupPrice(itemName) {
  if (!itemName) return 0;
  // direct exact match
  if (PRICE_MAP[itemName] != null) return Number(PRICE_MAP[itemName]);

  // fallback: try to parse a trailing "123.45" from the name if present
  const match = itemName.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  if (match) return Number(match[1]);
  return 0;
}

// Update running cart total in localStorage after a submission
function updateCartTotalWithNewItem(priceStr) {
  const price = Number(priceStr || 0);
  if (isNaN(price)) return;

  let total = Number(localStorage.getItem(CART_TOTAL_KEY) || "0");
  if (isNaN(total)) total = 0;
  total += price;
  localStorage.setItem(CART_TOTAL_KEY, String(total));
}

// ---------------------------
// Universal Form Handling
// ---------------------------

function attachUniversalFormHandler() {
  const f = document.getElementById('universalForm');
  if (!f) return;

  // We don't preventDefault here; auth.js also listens and handles account creation,
  // cart storage, emails, etc. We only ensure price is present and update total.
  f.addEventListener('submit', () => {
    try {
      // ensure the price field is set before auth.js processes
      setPriceFromSelectedItem();

      // optimistically compute a running cart total for display elsewhere
      const priceInput = f.querySelector('input[name="selected_item_price"]');
      if (priceInput) updateCartTotalWithNewItem(priceInput.value);

      // Also push price into the pending cart item in storage if needed
      // Read current local cart; if the just-clicked item is last pushed by auth.js,
      // we won't see it yet (same tick). So we also store a "pending" hint.
      const name = f.querySelector('input[name="selected_item_name"]').value;
      const type = f.querySelector('input[name="selected_item_type"]').value;
      const price = Number(priceInput.value || 0);

      localStorage.setItem('__pending_item_price__', JSON.stringify({ name, type, price }));
      // auth.js addToCart runs next; after navigation to account, you can reconcile these if desired.
    } catch (e) {
      console.warn('Price/Total update skipped:', e);
    }
  });
}
