// 🌅 Load on page ready
window.addEventListener("DOMContentLoaded", () => {
  // Set Date
  const today = new Date();
  const formatted = today.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  document.getElementById("currentDate").textContent = formatted;

  // Event listeners
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("signupBtn").addEventListener("click", signup);
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("addItemBtn").addEventListener("click", addItem);
  document.getElementById("toggleTheme").addEventListener("click", toggleTheme);
  document.getElementById("categoryFilter").addEventListener("change", filterList);
  document.getElementById("totalBudget").addEventListener("input", updateBudget);

  loadTheme();
  loadItems();
  updateBudgetDisplay();
});

// 🌙 Theme
function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}

// 🔐 Auth
function signup() {
  const username = document.getElementById("authUsername").value;
  const password = document.getElementById("authPassword").value;

  if (!username || !password) {
    return showAuthMessage("Fill both fields to sign up.");
  }

  localStorage.setItem("user", JSON.stringify({ username, password }));
  showAuthMessage("Signup successful! Now login.", "green");
}

function login() {
  const username = document.getElementById("authUsername").value;
  const password = document.getElementById("authPassword").value;

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.username !== username || user.password !== password) {
    return showAuthMessage("Invalid credentials.");
  }

  // Success
  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("appSection").classList.remove("hidden");
  document.getElementById("userDisplay").textContent = username;
}

function logout() {
  document.getElementById("authSection").classList.remove("hidden");
  document.getElementById("appSection").classList.add("hidden");
  document.getElementById("authUsername").value = "";
  document.getElementById("authPassword").value = "";
}

function showAuthMessage(msg, color = "red") {
  const el = document.getElementById("authMessage");
  el.textContent = msg;
  el.style.color = color;
}

// 💰 Budget
function updateBudget() {
  const amount = parseFloat(document.getElementById("totalBudget").value) || 0;
  localStorage.setItem("budget", amount);
  updateBudgetDisplay();
}

function updateBudgetDisplay() {
  const budget = parseFloat(localStorage.getItem("budget")) || 0;
  const items = JSON.parse(localStorage.getItem("items")) || [];
  const spent = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  document.getElementById("budgetAmount").textContent = budget.toFixed(2);
  document.getElementById("remainingAmount").textContent = (budget - spent).toFixed(2);
}

// ➕ Add Item
function addItem() {
  const name = document.getElementById("itemName").value.trim();
  const price = parseFloat(document.getElementById("itemPrice").value);
  const category = document.getElementById("itemCategory").value;
  const notes = document.getElementById("itemNotes").value.trim();

  if (!name || isNaN(price)) return;

  const item = { name, price, category, notes };

  const items = JSON.parse(localStorage.getItem("items")) || [];
  items.push(item);
  localStorage.setItem("items", JSON.stringify(items));

  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
  document.getElementById("itemNotes").value = "";

  loadItems();
  updateBudgetDisplay();
  document.getElementById("dingSound").play();
}

// 🧾 Load Items
function loadItems() {
  const list = document.getElementById("toBuyList");
  list.innerHTML = "";

  const items = JSON.parse(localStorage.getItem("items")) || [];
  const filter = document.getElementById("categoryFilter").value;

  items.forEach((item, index) => {
    if (filter !== "All" && item.category !== filter) return;

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${item.name}</strong> - ₹${item.price.toFixed(2)}
        <br/><small>${item.category} • ${item.notes || "No notes"}</small>
      </div>
      <button onclick="deleteItem(${index})">🗑️</button>
    `;

    list.appendChild(li);
  });
}

function deleteItem(index) {
  const items = JSON.parse(localStorage.getItem("items")) || [];
  items.splice(index, 1);
  localStorage.setItem("items", JSON.stringify(items));
  loadItems();
  updateBudgetDisplay();
}

// 🎯 Filter
function filterList() {
  loadItems();
}

// 📤 Export List
document.getElementById("exportBtn").addEventListener("click", () => {
  const items = JSON.parse(localStorage.getItem("items")) || [];
  if (!items.length) return alert("List is empty!");

  const text = items.map(
    (i) => `${i.name} - ₹${i.price} (${i.category}) [${i.notes}]`
  ).join("\n");

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "to-buy-list.txt";
  a.click();
  URL.revokeObjectURL(url);
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("✅ Service Worker registered"))
      .catch((err) => console.error("❌ SW registration failed:", err));
  });
}
