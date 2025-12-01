// products.js (Versão melhorada, sem limite, com produtos reduzidos e UI nova)

const API_PRODUCTS = 'https://dummyjson.com/products?limit=6';  // Carrega só 6 no início
const LS_PRODUCTS_KEY = 'df2_products_v1';

const productForm = document.getElementById('productForm');
const productListEl = document.getElementById('productList');
const refreshProductsBtn = document.getElementById('refreshProductsBtn');

let products = [];

function reduzirDescricao(texto){
  return texto.length > 70 ? texto.slice(0, 70) + "..." : texto;
}

function traduzirCategoria(cat){
  const mapa = {
    "smartphones": "Celulares",
    "laptops": "Notebooks",
    "fragrances": "Perfumes",
    "skincare": "Cuidados com Pele",
    "groceries": "Mercado",
    "home-decoration": "Decoração"
  };
  return mapa[cat] || cat;
}

async function fetchProductsFromAPI(){
  try {
    const res = await fetch(API_PRODUCTS);
    const data = await res.json();

    return data.products.map(p => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      category: traduzirCategoria(p.category),
      description: reduzirDescricao(p.description),
      price: p.price,
      thumbnail: p.thumbnail
    }));

  } catch (err){
    console.error(err);
    return [];
  }
}

function persistProducts(){
  localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(products));
}

function loadFromLocal(){
  const saved = localStorage.getItem(LS_PRODUCTS_KEY);
  return saved ? JSON.parse(saved) : [];
}

function renderProducts(){
  productListEl.innerHTML = "";

  if(products.length === 0){
    productListEl.innerHTML = `<p class="small">Nenhum produto cadastrado.</p>`;
    return;
  }

  products.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.thumbnail}">
      <h3>${p.title}</h3>
      <p class="small">${p.brand} • ${p.category}</p>
      <p class="price">R$ ${p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
      <p class="small">${p.description}</p>

      <div class="card-buttons">
        <button class="btn" data-add="${idx}">➕ Adicionar</button>
        <button class="btn secondary" data-remove="${idx}">🗑 Remover</button>
      </div>
    `;

    productListEl.appendChild(card);
  });
}

function addProduct(e){
  e.preventDefault();

  const newProduct = {
    id: Date.now(),
    title: productForm.title.value.trim(),
    brand: productForm.brand.value.trim(),
    category: productForm.category.value.trim(),
    description: reduzirDescricao(productForm.description.value.trim()),
    price: Number(productForm.price.value),
    thumbnail: productForm.thumbnail.value || "https://via.placeholder.com/150"
  };

  products.push(newProduct);
  persistProducts();
  renderProducts();
  productForm.reset();
}

productListEl.addEventListener("click", e => {

  // Adicionar produto baseado em outro
  if(e.target.dataset.add){
    const index = e.target.dataset.add;

    productForm.title.value = products[index].title;
    productForm.brand.value = products[index].brand;
    productForm.category.value = products[index].category;
    productForm.description.value = products[index].description;
    productForm.price.value = products[index].price;
    productForm.thumbnail.value = products[index].thumbnail;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Remover produto
  if(e.target.dataset.remove){
    const index = e.target.dataset.remove;
    products.splice(index, 1);
    persistProducts();
    renderProducts();
  }
});

refreshProductsBtn.addEventListener("click", async () => {
  products = await fetchProductsFromAPI();
  persistProducts();
  renderProducts();
});

productForm.addEventListener("submit", addProduct);

async function init(){
  const saved = loadFromLocal();

  if(saved.length > 0){
    products = saved;
  } else {
    products = await fetchProductsFromAPI();
    persistProducts();
  }

  renderProducts();
}

init();
