// ===== CONFIG (EmailJS optional; replace with your real IDs to enable emails) =====
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
const ADMIN_TEMPLATE_ID  = 'ADMIN_TEMPLATE_ID';
const WELCOME_TEMPLATE_ID= 'WELCOME_TEMPLATE_ID';
const RESET_TEMPLATE_ID  = 'RESET_TEMPLATE_ID'; // <-- add a simple template that emails the user

// Keys
const USER_KEY = "resilientUser";              // current session user
const USERS_KEY = "resilientUserRegistry";     // array of all users [{email,...}]
const CART_KEY = "resilientCart";              // [{type,name,price?}]
const CART_TOTAL_KEY = "resilientCartTotal";
const RESET_REQS_KEY = "resilientPasswordResetRequests"; // [{email, ts}]

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
  const keyOf = (i) => (typeof i==='string' ? i : (i && (i.name || JSON.stringify(i))));
  const set = new Set((a||[]).map(keyOf));
  (b||[]).forEach(i => { const k = keyOf(i); if (!set.has(k)) a.push(i); });
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

// ---- Email helpers ----
function emailAdmin(payload){
  if (!window.emailjs || EMAILJS_SERVICE_ID==='YOUR_EMAILJS_SERVICE_ID') return Promise.resolve();
  return emailjs.send(EMAILJS_SERVICE_ID, ADMIN_TEMPLATE_ID, payload);
}
function emailWelcome(payload){
  if (!window.emailjs || EMAILJS_SERVICE_ID==='YOUR_EMAILJS_SERVICE_ID') return Promise.resolve();
  return emailjs.send(EMAILJS_SERVICE_ID, WELCOME_TEMPLATE_ID, payload);
}
function emailPasswordReset(payload){
  if (!window.emailjs || EMAILJS_SERVICE_ID==='YOUR_EMAILJS_SERVICE_ID') return Promise.resolve();
  return emailjs.send(EMAILJS_SERVICE_ID, RESET_TEMPLATE_ID, payload);
}

// ---- Universal form submit (account create + cart + emails)
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
    setSession(user, true); // remember after signup

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

    alert("You're all set! We've created your account and added the item to your cart.");
    window.location.href = "account.html";
  }
});

// ---- Login & Logout ----
function loginFromLoginPage(email, password, rememberMe) {
  const registry = getUsers();
  const user = registry.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    setSession(user, !!rememberMe);
    window.location.href = "account.html";
  } else {
    alert("Invalid credentials.");
  }
}
function logout(){
  clearSession();
  window.location.href = "index.html";
}

// ---- Signup from the dedicated Signup modal ----
function signupFromSignupModal(data){
  const { first_name, last_name, institution_type, institution_name, email, password } = data;
  if (!first_name || !last_name || !institution_type || !institution_name || !email || !password) {
    alert("Please complete all required fields.");
    return;
  }

  const baseUser = {
    first_name, last_name, email, password,
    institution_type, institution_name,
    toolkits: [], insights: [], services: [], cart: getCart()
  };

  const user = upsertUser(baseUser);
  setSession(user, true);

  // Welcome + Admin emails (no selected item when pure signup)
  const payload = {
    name: `${first_name} ${last_name}`,
    email,
    institution: institution_name,
    institution_type,
    selected_item: 'Account Signup'
  };
  emailAdmin(payload).catch(()=>{});
  emailWelcome({ to_email: email, to_name: first_name, selected_item: 'Account Signup' }).catch(()=>{});

  alert("Welcome! Your account has been created.");
  window.location.href = "account.html";
}

// ---- Forgot Password (static-site friendly request) ----
function requestPasswordReset(email){
  return new Promise((resolve) => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const requests = JSON.parse(localStorage.getItem(RESET_REQS_KEY) || "[]");

    // Save request locally for your records
    requests.push({ email, ts: Date.now() });
    localStorage.setItem(RESET_REQS_KEY, JSON.stringify(requests));

    if (!user) {
      alert("If this email is registered, you will receive instructions shortly.");
      // Still notify admin so you can assist manually
      emailAdmin({ name: 'Unknown', email, institution: '-', institution_type: '-', selected_item: 'Password Reset Request (no match)' }).finally(resolve);
      return;
    }

    // Email admin
    emailAdmin({
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
      email,
      institution: user.institution_name || '-',
      institution_type: user.institution_type || '-',
      selected_item: 'Password Reset Request'
    }).catch(()=>{});

    // Email user (template can say: "We received your request. Our team will help you reset your password.")
    emailPasswordReset({
      to_email: email,
      to_name: user.first_name || 'there'
    }).catch(()=>{});

    alert("If this email is registered, you will receive reset instructions shortly.");
    resolve();
  });
}
