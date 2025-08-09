// ===== CONFIG (EmailJS optional; keep if you already set this up) =====
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';     // replace
const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';     // replace
const ADMIN_TEMPLATE_ID  = 'ADMIN_TEMPLATE_ID';           // replace
const WELCOME_TEMPLATE_ID= 'WELCOME_TEMPLATE_ID';         // replace

// Keys
const USER_KEY = "resilientUser";              // current session user
const USERS_KEY = "resilientUserRegistry";     // array of all users [{email,...}]
const CART_KEY = "resilientCart";              // [{type,name,price?}]
const CART_TOTAL_KEY = "resilientCartTotal";

// Init EmailJS if present
(function initEmailJS(){
  if (window.emailjs && emailjs.init && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    try { emailjs.init(EMAILJS_PUBLIC_KEY); } catch(e){}
  }
})();

// ---- Helpers: Users & Session ----
function getUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
function saveUsers(arr){ localStorage.setItem(USERS_KEY, JSON.stringify(arr)); }
function getSession(){ return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
function setSession(user, remember=false){
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (remember) localStorage.setItem('rememberMe', 'true');
}
function clearSession(){
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('rememberMe');
}

function upsertUser(u){
  const users = getUsers();
  const i = users.findIndex(x => x.email.toLowerCase() === u.email.toLowerCase());
  if (i >= 0) {
    users[i] = {
      ...users[i],
      ...u,
      cart: mergeUnique(users[i].cart || [], u.cart || []),
      toolkits: mergeUnique(users[i].toolkits || [], u.toolkits || []),
      insights: mergeUnique(users[i].insights || [], u.insights || []),
      services: mergeUnique(users[i].services || [], u.services || []),
    };
  } else {
    users.push({ ...u, cart: u.cart || [], toolkits: u.toolkits||[], insights:u.insights||[], services:u.services||[] });
  }
  saveUsers(users);
  return users.find(x => x.email.toLowerCase() === u.email.toLowerCase());
}

function mergeUnique(a,b){
  const set = new Set((a||[]).map(i=> typeof i==='string' ? i : (i.name||JSON.stringify(i))));
  (b||[]).forEach(i => {
    const key = (typeof i==='string' ? i : (i.name||JSON.stringify(i)));
    if (!set.has(key)) a.push(i);
  });
  return a;
}

// ---- Cart helpers ----
function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
function saveCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); }
function addToCart(item){
  const cart = getCart();
  if(!cart.some(c => c.name === item.name && c.type === item.type)) {
    cart.push(item);
    saveCart(cart);
  }
  updateCartBadge();
}
function updateCartBadge(){
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = getCart().length;
  if (count > 0) {
    badge.textContent = String(count);
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ---- Account tab handling ----
document.addEventListener("DOMContentLoaded", () => {
  restoreAccountTab();
  updateCartBadge();
});

function restoreAccountTab(){
  const mount = document.getElementById('accountMount');
  if (!mount) return;
  // modal.js will also manage this safely; do a light touch here
  // We'll defer to modal.js's restoreAccountTabSafely after forms load
}

// ---- Email notifications via EmailJS ----
function emailAdmin(payload){
  if (!window.emailjs) return Promise.resolve();
  return emailjs.send(EMAILJS_SERVICE_ID, ADMIN_TEMPLATE_ID, payload);
}
function emailWelcome(payload){
  if (!window.emailjs) return Promise.resolve();
  return emailjs.send(EMAILJS_SERVICE_ID, WELCOME_TEMPLATE_ID, payload);
}

// ---- Universal form submit is hooked in modal.js for price; do account/cart/emails here too
document.addEventListener('submit', (e) => {
  if (e.target && e.target.id === 'universalForm') {
    e.preventDefault();
    const f = e.target;

    const selected_item_type = f.querySelector('input[name="selected_item_type"]').value || 'general';
    const selected_item_name = f.querySelector('input[name="selected_item_name"]').value || 'General Inquiry';
    const selected_item_price = parseFloat(f.querySelector('input[name="selected_item_price"]').value || "0");

    const first_name = f.first_name.value.trim();
    const last_name  = f.last_name.value.trim();
    const institution_type = f.institution_type.value;
    const institution_name = f.institution_name.value.trim();
    const email = f.email.value.trim().toLowerCase();
    const password = f.password.value;

    if (!first_name || !last_name || !institution_type || !institution_name || !email || !password) {
      alert("Please complete all required fields.");
      return;
    }

    // Add item to cart
    addToCart({ type: selected_item_type, name: selected_item_name, price: selected_item_price });

    // Build user and upsert
    const baseUser = {
      first_name, last_name, email, password,
      institution_type, institution_name,
      toolkits: [], insights: [], services: [], cart: getCart()
    };
    if (selected_item_type === 'toolkit') baseUser.toolkits = [selected_item_name];
    if (selected_item_type === 'insight') baseUser.insights = [selected_item_name];
    if (selected_item_type === 'service') baseUser.services = [selected_item_name];

    const user = upsertUser(baseUser);
    setSession(user, true); // remember by default after signup
    // Update auth nav (modal.js has a function to rebuild it)
    if (typeof restoreAccountTabSafely === 'function') restoreAccountTabSafely();

    // Emails
    const payload = {
      name: `${first_name} ${last_name}`,
      email,
      institution: institution_name,
      institution_type,
      selected_item: selected_item_name
    };
    emailAdmin(payload).catch(()=>{});
    emailWelcome({ to_email: email, to_name: first_name, selected_item: selected_item_name }).catch(()=>{});

    closeModal('universalModal');
    alert("You're all set! We've created your account and added the item to your cart. You can access your account anytime.");
  }
});

// ---- Login & Logout ----
function loginFromLoginPage(email, password, rememberMe) {
  const registry = getUsers();
  const user = registry.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    setSession(user, !!rememberMe);
    if (typeof restoreAccountTabSafely === 'function') restoreAccountTabSafely();
    window.location.href = "account.html";
  } else {
    alert("Invalid credentials.");
  }
}
function logout(){
  clearSession();
  if (typeof restoreAccountTabSafely === 'function') restoreAccountTabSafely();
  window.location.href = "index.html";
}
