const API_URL = "http://127.0.0.1:8000/api";

// --- ALERT FUNCTION ---
function showAlert(message, type = "info") {
  const alertContainer = document.getElementById("alert-container");
  if (!alertContainer) return;
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  alertContainer.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

// --- LOGIN PAGE ---
if (window.location.pathname.includes("login.html")) {
  const loginForm = document.getElementById("loginForm");
  loginForm?.addEventListener("submit", function(e){
    e.preventDefault();
    const email = $("#email").val().trim();
    const password = $("#password").val().trim();
    if(!email || !password){ showAlert("Please fill all fields","warning"); return; }

    $.ajax({
      url: `${API_URL}/login`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email, password }),
      success: function(res){
        localStorage.setItem("auth_token", res.token);
        window.location.href = "dashboard.html";
      },
      error: function(xhr){
        showAlert(xhr.responseJSON?.message || "Login failed","danger");
      }
    });
  });
}

// --- REGISTER PAGE ---
if (window.location.pathname.includes("register.html")) {
  const registerForm = document.getElementById("registerForm");
  registerForm?.addEventListener("submit", function(e){
    e.preventDefault();
    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const password = $("#password").val().trim();
    const password_confirmation = $("#password_confirmation").val().trim();
    if(!name || !email || !password || !password_confirmation){
      showAlert("Please fill all fields","warning"); return;
    }

    $.ajax({
      url: `${API_URL}/register`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ name, email, password, password_confirmation }),
      success: function(res){
        showAlert("Registration successful! Redirecting...","success");
        setTimeout(()=>{ window.location.href="login.html"; }, 1500);
      },
      error: function(xhr){
        showAlert(xhr.responseJSON?.message || "Registration failed","danger");
      }
    });
  });
}

// --- DASHBOARD PAGE ---
if (window.location.pathname.includes("dashboard.html")) {
  const token = localStorage.getItem("auth_token");
  if(!token) window.location.href = "login.html";

  function fetchCategories(){
    $.ajax({
      url:`${API_URL}/categories`,
      headers:{ Authorization: `Bearer ${token}` },
      success: function(data){
        const list = $("#categories-list").empty();
        const select = $("#product-category").empty().append('<option value="">Select Category</option>');
        data.forEach(cat=>{
          list.append(`<li class="list-group-item">${cat.name} <span class="badge bg-info">ID: ${cat.id}</span></li>`);
          select.append(`<option value="${cat.id}">${cat.name}</option>`);
        });
        $("#categories-count").text(data.length);
      },
      error: function(){ showAlert("Failed to load categories","danger"); }
    });
  }

  function fetchProducts(){
    $.ajax({
      url:`${API_URL}/products`,
      headers:{ Authorization: `Bearer ${token}` },
      success: function(data){
        const list = $("#products-list").empty();
        data.forEach(prod=>{
          list.append(`<li class="list-group-item">${prod.name} - $${prod.price} <span class="badge bg-primary">Category ID: ${prod.category_id}</span></li>`);
        });
        $("#products-count").text(data.length);
      },
      error: function(){ showAlert("Failed to load products","danger"); }
    });
  }

  $("#add-category").on("click",function(){
    const name = $("#category-name").val().trim();
    if(!name){ showAlert("Category name required","warning"); return; }
    $.ajax({
      url:`${API_URL}/categories`,
      method:"POST",
      headers:{ Authorization:`Bearer ${token}` },
      contentType:"application/json",
      data: JSON.stringify({ name }),
      success: function(){ showAlert("Category added","success"); $("#category-name").val(""); fetchCategories(); },
      error: function(){ showAlert("Failed to add category","danger"); }
    });
  });

  $("#add-product").on("click",function(){
    const name = $("#product-name").val().trim();
    const price = $("#product-price").val().trim();
    const category_id = $("#product-category").val();
    if(!name || !price || !category_id){ showAlert("All product fields required","warning"); return; }
    $.ajax({
      url:`${API_URL}/products`,
      method:"POST",
      headers:{ Authorization:`Bearer ${token}` },
      contentType:"application/json",
      data: JSON.stringify({ name, price, category_id }),
      success: function(){ showAlert("Product added","success"); $("#product-name,#product-price,#product-category").val(""); fetchProducts(); },
      error: function(){ showAlert("Failed to add product","danger"); }
    });
  });

  $("#refresh-categories").on("click", fetchCategories);
  $("#refresh-products").on("click", fetchProducts);
  $("#logoutBtn").on("click", function(){
    localStorage.removeItem("auth_token"); window.location.href="login.html";
  });

  $(document).ready(function(){
    fetchCategories(); fetchProducts(); showAlert("Dashboard loaded","success");
  });
}
