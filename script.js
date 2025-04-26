const apiUrl = "http://176.34.158.54:4000/products";

// ===== common validation functions =====
function validateInputs(nameInput, descriptionInput, priceInput) {
  let hasError = false;

  if (!nameInput.value.trim()) {
    nameInput.classList.add("error");
    nameInput.placeholder = "*Product name is required.";
    nameInput.value = "";
    hasError = true;
  }

  if (!descriptionInput.value.trim()) {
    descriptionInput.classList.add("error");
    descriptionInput.placeholder = "*Description is required.";
    descriptionInput.value = "";
    hasError = true;
  }

  if (
    !priceInput.value.trim() ||
    isNaN(priceInput.value) ||
    parseFloat(priceInput.value) <= 0
  ) {
    priceInput.classList.add("error");
    priceInput.placeholder = "*Price is required.";
    priceInput.value = "";
    hasError = true;
  }

  return hasError;
}

// ===== index.html =====
const productTableBody = document.getElementById("productTableBody");
const filterCheckbox = document.getElementById("filterAvailable");

if (productTableBody && filterCheckbox) {
  document.addEventListener("DOMContentLoaded", loadProducts);
  filterCheckbox.addEventListener("change", loadProducts);
}

async function loadProducts() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`server error: ${res.status}`);
    const products = await res.json();

    const filtered = filterCheckbox.checked
      ? products.filter((p) => p.available)
      : products;

    productTableBody.innerHTML = "";

    if (filtered.length === 0) {
      productTableBody.innerHTML = `<tr><td colspan="6">No products available.</td></tr>`;
      return;
    }

    filtered.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.id}</td>
        <td class="l-side">${product.name}</td>
        <td class="l-side">${truncate(product.description, 60)}</td>
        <td>${product.price}</td>
        <td>${product.available ? "Yes" : "No"}</td>
        <td>
          <button onclick="editProduct(${product.id})" class="edit-btn">Edit</button>
          <button onclick="deleteProduct(${product.id})" class="delete-btn">Delete</button>
          <button onclick="viewDetail(${product.id})" class="detail-btn">View</button>
        </td>
      `;
      productTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("failed to load products:", error);
    productTableBody.innerHTML = `<tr><td colspan="6">error loading products. please try again later.</td></tr>`;
  }
}

function truncate(text, length) {
  return text.length > length ? text.substring(0, length) + "..." : text;
}

async function deleteProduct(id) {
  if (!confirm("are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`delete failed: ${res.status}`);
    loadProducts();
  } catch (error) {
    console.error("failed to delete product:", error);
    alert("error deleting product. please try again later.");
  }
}

function viewDetail(id) {
  window.location.href = `detail.html?id=${id}`;
}

function editProduct(id) {
  window.location.href = `edit.html?id=${id}`;
}

// ===== add.html =====
const addForm = document.getElementById("addForm");

if (addForm) {
  const nameInput = document.getElementById("name");
  const descriptionInput = document.getElementById("description");
  const priceInput = document.getElementById("price");
  const availableInput = document.getElementById("available");

  [nameInput, descriptionInput, priceInput].forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("error");
      if (input === nameInput) input.placeholder = "Product name";
      if (input === descriptionInput) input.placeholder = "Description";
      if (input === priceInput) input.placeholder = "0.00";
    });
  });

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (validateInputs(nameInput, descriptionInput, priceInput)) return;

    const product = {
      name: nameInput.value,
      description: descriptionInput.value,
      price: parseFloat(priceInput.value),
      available: availableInput.checked,
    };

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });

      if (!res.ok) throw new Error(`server error: ${res.status}`);

      window.location.href = "index.html";
    } catch (error) {
      console.error("failed to add product:", error);
      alert("Error adding product. Please try again later.");
    }
  });
}

// ===== edit.html =====
const editForm = document.getElementById("editForm");

if (editForm) {
  const nameInput = document.getElementById("name");
  const descriptionInput = document.getElementById("description");
  const priceInput = document.getElementById("price");
  const availableInput = document.getElementById("available");

  fetch(`${apiUrl}/${new URLSearchParams(window.location.search).get("id")}`)
    .then((res) => res.json())
    .then((data) => {
      nameInput.value = data.name;
      descriptionInput.value = data.description;
      priceInput.value = data.price;
      availableInput.checked = data.available;
    });

  [nameInput, descriptionInput, priceInput].forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("error");
      if (input === nameInput) input.placeholder = "Product name";
      if (input === descriptionInput) input.placeholder = "Description";
      if (input === priceInput) input.placeholder = "0.00";
    });
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (validateInputs(nameInput, descriptionInput, priceInput)) return;

    const product = {
      name: nameInput.value,
      description: descriptionInput.value,
      price: parseFloat(priceInput.value),
      available: availableInput.checked,
    };

    try {
      const res = await fetch(
        `${apiUrl}/${new URLSearchParams(window.location.search).get("id")}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product }),
        }
      );

      if (!res.ok) throw new Error(`server error: ${res.status}`);

      window.location.href = "index.html";
    } catch (error) {
      console.error("failed to update product:", error);
      alert("Error updating product. Please try again later.");
    }
  });
}

// ===== detail.html =====
const detailContainer = document.getElementById("detailContainer");

if (detailContainer) {
  const id = new URLSearchParams(window.location.search).get("id");

  fetch(`${apiUrl}/${id}`)
    .then((res) => res.json())
    .then((product) => {
      detailContainer.innerHTML = `
        <p><strong>ID:</strong> ${product.id}</p>
        <p><strong>Name:</strong> ${product.name}</p>
        <p><strong>Price:</strong> €${product.price}</p>
        <p><strong>Description:</strong> ${product.description}</p>
        <p><strong>Available:</strong> ${product.available ? "Yes" : "No"}</p>
        <p><strong>Created At:</strong> ${new Date(product.created_at).toLocaleString()}</p>
        <p><strong>Updated At:</strong> ${new Date(product.updated_at).toLocaleString()}</p>
      `;
    });
}
