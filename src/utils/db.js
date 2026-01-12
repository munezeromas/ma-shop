const KEY = {
  USERS: 'ma_shop_users',
  LOCAL_PRODUCTS: 'ma_shop_local_products',
  PRODUCT_OVERRIDES: 'ma_shop_product_overrides',
  DELETED_REMOTE_PRODUCTS: 'ma_shop_deleted_remote_products',
  CATEGORIES: 'ma_shop_categories',
  ACTIVITIES: 'ma_shop_activities',
};

function nowISO() {
  return new Date().toISOString();
}
function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* Avatar helper */
function getAvatarUrl(username, size = 128) {
  if (!username) return `https://dummyjson.com/icon/default/${size}`;
  return `https://dummyjson.com/icon/${encodeURIComponent(username)}/${size}`;
}

/* Activities */
function logActivity({ actor, type, message, details = null }) {
  const activities = load(KEY.ACTIVITIES) || [];
  const entry = { id: `a-${Date.now()}`, actor, type, message, details, timestamp: nowISO() };
  activities.unshift(entry);
  save(KEY.ACTIVITIES, activities);
  return entry;
}
function getActivities() {
  return load(KEY.ACTIVITIES) || [];
}

/* Users */
function listUsers() { return load(KEY.USERS) || []; }
function getUserByUsername(username) { const users = listUsers(); return users.find(u => u.username === username) || null; }
function getUserById(id) { const users = listUsers(); return users.find(u => u.id === id) || null; }
function addUser({ username, password, firstName = '', lastName = '', role = 'user' }) {
  const users = listUsers();
  if (users.find(u => u.username === username)) throw new Error('Username already exists');
  const user = { id: `u-${Date.now()}`, username, password, firstName, lastName, role, createdAt: nowISO(), avatar: getAvatarUrl(username) };
  users.push(user);
  save(KEY.USERS, users);
  logActivity({ actor: username, type: 'user:created', message: `User ${username} created`, details: { role } });
  return user;
}
function updateUser(id, patch) {
  const users = listUsers();
  const i = users.findIndex(u => u.id === id);
  if (i === -1) throw new Error('User not found');
  users[i] = { ...users[i], ...patch, updatedAt: nowISO() };
  if (patch.username) users[i].avatar = getAvatarUrl(patch.username);
  save(KEY.USERS, users);
  logActivity({ actor: patch.username || users[i].username, type: 'user:updated', message: `User ${users[i].username} updated`, details: patch });
  return users[i];
}
function removeUser(id) {
  const users = listUsers();
  const found = users.find(u => u.id === id);
  const newUsers = users.filter(u => u.id !== id);
  save(KEY.USERS, newUsers);
  if (found) logActivity({ actor: 'system', type: 'user:deleted', message: `User ${found.username} deleted`, details: { id } });
  return found;
}
function authenticate(username, password) {
  const user = getUserByUsername(username);
  if (!user) return null;
  if (user.password !== password) return null;
  logActivity({ actor: username, type: 'login', message: `User ${username} logged in` });
  const { password: _p, ...safe } = user;
  safe.avatar = safe.avatar || getAvatarUrl(safe.username);
  return safe;
}

/* Categories */
function listCategories() { return load(KEY.CATEGORIES) || []; }
function addCategory({ name }) {
  const cats = listCategories();
  const cat = { id: `c-${Date.now()}`, name, createdAt: nowISO() };
  cats.push(cat);
  save(KEY.CATEGORIES, cats);
  logActivity({ actor: 'system', type: 'category:created', message: `Category ${name} created` });
  return cat;
}
function updateCategory(id, patch) {
  const cats = listCategories();
  const i = cats.findIndex(c => c.id === id);
  if (i === -1) throw new Error('Category not found');
  cats[i] = { ...cats[i], ...patch, updatedAt: nowISO() };
  save(KEY.CATEGORIES, cats);
  logActivity({ actor: 'system', type: 'category:updated', message: `Category ${cats[i].name} updated`, details: patch });
  return cats[i];
}
function removeCategory(id) {
  const cats = listCategories();
  const found = cats.find(c => c.id === id);
  const newCats = cats.filter(c => c.id !== id);
  save(KEY.CATEGORIES, newCats);
  if (found) logActivity({ actor: 'system', type: 'category:deleted', message: `Category ${found.name} deleted`, details: { id } });
  return found;
}

/* Local product storage primitives */
function listLocalProducts() { return load(KEY.LOCAL_PRODUCTS) || []; }
function saveLocalProducts(arr) { save(KEY.LOCAL_PRODUCTS, arr); }

function getProductOverrides() { return load(KEY.PRODUCT_OVERRIDES) || {}; }
function saveProductOverrides(obj) { save(KEY.PRODUCT_OVERRIDES, obj); }

function getDeletedRemoteProductIds() { return load(KEY.DELETED_REMOTE_PRODUCTS) || []; }
function saveDeletedRemoteProductIds(arr) { save(KEY.DELETED_REMOTE_PRODUCTS, arr); }

// Fetch remote products from DummyJSON (limit default 100)
async function fetchRemoteProducts(limit = 100) {
  try {
    const res = await fetch(`https://dummyjson.com/products?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch remote products');
    const json = await res.json();
    const items = (json.products || []).map(p => ({
      // prefix remote id to avoid collisions
      id: `r-${p.id}`,
      remoteId: p.id,
      name: p.title,
      title: p.title,
      description: p.description || '',
      price: p.price || 0,
      brand: p.brand || '',
      category: p.category || '',
      thumbnail: p.thumbnail || '',
      stock: p.stock || 0,
      rating: p.rating || 0,
      discountPercentage: p.discountPercentage || 0,
      createdAt: nowISO(),
      source: 'remote',
    }));
    return items;
  } catch (err) {
    console.warn('fetchRemoteProducts error', err);
    return [];
  }
}

// Return merged products: remote (with overrides & deletions applied) + local
async function listAllProducts() {
  const remote = await fetchRemoteProducts(100);
  const overrides = getProductOverrides();
  const deleted = getDeletedRemoteProductIds();
  // apply deletions and overrides
  const mergedRemote = remote
    .filter(p => !deleted.includes(p.id))
    .map(p => {
      const ov = overrides[p.id];
      if (ov) return { ...p, ...ov, updatedAt: nowISO() };
      return p;
    });
  const local = listLocalProducts();
  // ensure local products include source='local' and have all required fields
  const localNormalized = local.map(lp => ({ 
    ...lp, 
    source: 'local',
    title: lp.title || lp.name,
    description: lp.description || '',
    rating: lp.rating || 0,
    discountPercentage: lp.discountPercentage || 0,
  }));
  return [...mergedRemote, ...localNormalized];
}

/* Product CRUD (works with remote via overrides and local) */
function addProduct({ name, price = 0, categoryId = null, brand = '', stock = 0, thumbnail = '', description = '', rating = 0, discountPercentage = 0 }) {
  // create local product
  const local = listLocalProducts();
  const p = { 
    id: `p-${Date.now()}`, 
    name, 
    title: name,
    price: Number(price), 
    categoryId, 
    brand, 
    stock: Number(stock), 
    thumbnail, 
    description,
    rating: Number(rating),
    discountPercentage: Number(discountPercentage),
    createdAt: nowISO(), 
    source: 'local' 
  };
  local.push(p);
  saveLocalProducts(local);
  logActivity({ actor: 'system', type: 'product:created', message: `Local product ${name} created`, details: p });
  return p;
}

function updateProduct(id, patch) {
  if (!id) throw new Error('Missing id');
  if (String(id).startsWith('p-')) {
    // update local product
    const local = listLocalProducts();
    const i = local.findIndex(x => x.id === id);
    if (i === -1) throw new Error('Local product not found');
    // Ensure title stays in sync with name
    if (patch.name) patch.title = patch.name;
    local[i] = { ...local[i], ...patch, updatedAt: nowISO() };
    saveLocalProducts(local);
    logActivity({ actor: 'system', type: 'product:updated', message: `Local product ${local[i].name} updated`, details: patch });
    return local[i];
  } else if (String(id).startsWith('r-')) {
    // remote product override
    const overrides = getProductOverrides();
    const current = overrides[id] || {};
    // Ensure title stays in sync with name
    if (patch.name) patch.title = patch.name;
    const merged = { ...current, ...patch };
    overrides[id] = merged;
    saveProductOverrides(overrides);
    logActivity({ actor: 'system', type: 'product:override', message: `Remote product ${id} overridden`, details: merged });
    return merged;
  } else {
    throw new Error('Unknown product id format');
  }
}

function removeProduct(id) {
  if (!id) throw new Error('Missing id');
  if (String(id).startsWith('p-')) {
    // remove local
    const local = listLocalProducts();
    const found = local.find(p => p.id === id);
    const newLocal = local.filter(p => p.id !== id);
    saveLocalProducts(newLocal);
    if (found) logActivity({ actor: 'system', type: 'product:deleted', message: `Local product ${found.name} deleted`, details: { id } });
    return found;
  } else if (String(id).startsWith('r-')) {
    // mark remote as deleted locally
    const deleted = getDeletedRemoteProductIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      saveDeletedRemoteProductIds(deleted);
      logActivity({ actor: 'system', type: 'product:remote_deleted', message: `Remote product ${id} marked deleted locally`, details: { id } });
    }
    return { id };
  } else {
    throw new Error('Unknown product id format');
  }
}

/* Utility: getProductById (search merged list) */
async function getProductById(id) {
  const all = await listAllProducts();
  return all.find(p => p.id === id) || null;
}

/* Seeding: users, local products and categories (fetch categories from DummyJSON) */
async function seedIfEmpty() {
  if (!load(KEY.USERS)) {
    const users = [
      { id: 'u-admin', username: 'admin', password: '123456', firstName: 'Site', lastName: 'Admin', role: 'admin', createdAt: nowISO(), avatar: getAvatarUrl('admin') },
      { id: 'u-emilys', username: 'emilys', password: '123456', firstName: 'Emily', lastName: 'S', role: 'admin', createdAt: nowISO(), avatar: getAvatarUrl('emilys') },
      { id: 'u-michaelw', username: 'michaelw', password: 'michaelwpass', firstName: 'Michael', lastName: 'W', role: 'user', createdAt: nowISO(), avatar: getAvatarUrl('michaelw') },
    ];
    save(KEY.USERS, users);
    logActivity({ actor: 'system', type: 'seed', message: 'Seeded initial users' });
  }
  if (!load(KEY.LOCAL_PRODUCTS)) {
    const base = [
      { 
        id: `p-${Date.now()}`, 
        name: 'Demo Headphones', 
        title: 'Demo Headphones',
        description: 'High-quality demo headphones with excellent sound',
        price: 59.99, 
        categoryId: null, 
        brand: 'DemoBrand', 
        stock: 10, 
        thumbnail: 'https://via.placeholder.com/400x400?text=Demo+Headphones',
        rating: 4.5,
        discountPercentage: 10,
        createdAt: nowISO(), 
        source: 'local' 
      },
    ];
    save(KEY.LOCAL_PRODUCTS, base);
    logActivity({ actor: 'system', type: 'seed', message: 'Seeded initial local products' });
  }
  if (!load(KEY.ACTIVITIES)) {
    save(KEY.ACTIVITIES, []);
  }
  // categories: try to fetch from DummyJSON
  if (!load(KEY.CATEGORIES)) {
    try {
      const res = await fetch('https://dummyjson.com/products/categories');
      if (res.ok) {
        const cats = await res.json();
        // Handle both old format (array of strings) and new format (array of objects)
        const formatted = Array.isArray(cats) 
          ? cats.map((item, i) => {
              if (typeof item === 'string') {
                return { id: `c-api-${i}`, name: item, createdAt: nowISO() };
              } else if (item && item.slug) {
                return { id: `c-api-${item.slug}`, name: item.name || item.slug, createdAt: nowISO() };
              }
              return { id: `c-api-${i}`, name: String(item), createdAt: nowISO() };
            })
          : [{ id: 'c-1', name: 'Electronics', createdAt: nowISO() }, { id: 'c-2', name: 'Apparel', createdAt: nowISO() }];
        save(KEY.CATEGORIES, formatted);
        logActivity({ actor: 'system', type: 'seed', message: 'Seeded categories from DummyJSON' });
        return;
      }
    } catch (e) {
      console.warn('Failed to fetch categories from DummyJSON', e);
    }
    // fallback
    const fallback = [{ id: 'c-1', name: 'Electronics', createdAt: nowISO() }, { id: 'c-2', name: 'Apparel', createdAt: nowISO() }];
    save(KEY.CATEGORIES, fallback);
    logActivity({ actor: 'system', type: 'seed', message: 'Seeded fallback categories' });
  }
}

// run seed
seedIfEmpty().catch(err => console.warn('seed error', err));

export default {
  // avatars
  getAvatarUrl,
  // activities
  logActivity,
  getActivities,
  // users
  listUsers,
  getUserByUsername,
  getUserById,
  addUser,
  updateUser,
  removeUser,
  authenticate,
  // categories
  listCategories,
  addCategory,
  updateCategory,
  removeCategory,
  // products
  listLocalProducts,
  listAllProducts,
  addProduct,
  updateProduct,
  removeProduct,
  getProductById,
  // seed util
  seedIfEmpty,
};