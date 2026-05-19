// Admin Dashboard — Firebase-powered
import {
  db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot,
  auth, onAuthStateChanged,
  CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET
} from './firebase-config.js';

// ─── STATE ──────────────────────────────────────────
let productsCache = [];
let ordersCache = [];

// ─── CLOUDINARY UPLOAD ──────────────────────────────
async function uploadImageToCloud(file) {
  if (!file) return '';
  if (file.size > 5 * 1024 * 1024) { showToast('Image too large. Max 5MB.', true); return ''; }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'spec-interior/products');
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url;
  } catch (e) {
    showToast('Image upload failed: ' + e.message, true);
    return '';
  }
}

// ─── FIREBASE DATA ──────────────────────────────────
async function seedProductsIfEmpty() {
  const snap = await getDocs(collection(db, 'products'));
  if (snap.empty) {
    const defaults = [
      {name:'Rustic Cane Pendant Lamp',category:'lamp',price:1299,originalPrice:2199,badge:'sale',rating:5,reviews:124,color1:'#8B5E3C',color2:'#C4714A',stock:12,image:''},
      {name:'Geometric Boho Wall Panel',category:'wall',price:899,originalPrice:1499,badge:'new',rating:5,reviews:87,color1:'#E8DDD0',color2:'#C4927A',stock:8,image:''},
      {name:'Woven Rattan Pendant Light',category:'pendant',price:1599,originalPrice:2499,badge:'sale',rating:4,reviews:63,color1:'#3D2B1F',color2:'#6B4C38',stock:5,image:''},
      {name:'Macramé Mandala Tapestry',category:'wall',price:749,originalPrice:1299,badge:'new',rating:5,reviews:211,color1:'#B8972A',color2:'#8B5E3C',stock:20,image:''},
      {name:'Copper Mesh Cane Lamp',category:'lamp',price:1099,originalPrice:1799,badge:'sale',rating:5,reviews:95,color1:'#C4714A',color2:'#B8972A',stock:7,image:''},
      {name:'Jute Woven Wall Mirror Frame',category:'wall',price:1199,originalPrice:1999,badge:'new',rating:4,reviews:42,color1:'#6B4C38',color2:'#C4927A',stock:3,image:''},
      {name:'Bamboo Ceiling Pendant',category:'pendant',price:1399,originalPrice:2199,badge:'sale',rating:5,reviews:78,color1:'#8B5E3C',color2:'#3D2B1F',stock:6,image:''},
      {name:'Terracotta Glow Cane Lamp',category:'lamp',price:949,originalPrice:1599,badge:'new',rating:5,reviews:156,color1:'#C4714A',color2:'#3D2B1F',stock:15,image:''},
    ];
    for (const p of defaults) {
      await addDoc(collection(db, 'products'), { ...p, createdAt: new Date().toISOString() });
    }
    showToast('Default products added to database');
  }
}

function listenProducts() {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  onSnapshot(q, (snap) => {
    productsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (document.getElementById('tab-products').classList.contains('active')) renderProductsAdmin();
    if (document.getElementById('tab-dashboard').classList.contains('active')) loadDashboard();
  });
}

function listenOrders() {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  onSnapshot(q, (snap) => {
    ordersCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('pendingBadge').textContent = ordersCache.filter(o => o.status === 'Pending').length;
    if (document.getElementById('tab-orders').classList.contains('active')) renderOrders();
    if (document.getElementById('tab-dashboard').classList.contains('active')) loadDashboard();
    if (document.getElementById('tab-payments').classList.contains('active')) renderPayments();
    if (document.getElementById('tab-customers').classList.contains('active')) renderCustomers();
  });
}

// ─── HSN AUTO-FILL BY CATEGORY ───────────────────────
const HSN_MAP = {
  lamp: '4602',      // Articles of plaiting materials (cane/bamboo lamps)
  wall: '4602',      // Wall hangings from cane/bamboo/macrame
  standing: '9405',  // Standing lamps with electrical fittings
  gifting: '4602',   // Gift sets of cane/bamboo articles
  basket: '4602',    // Woven baskets from natural fiber
  pendant: '9405'    // Pendant lights with electrical fittings
};

function autoFillHsn() {
  const cat = document.getElementById('pCategory').value;
  const hsnField = document.getElementById('pHsn');
  if (HSN_MAP[cat]) {
    hsnField.value = HSN_MAP[cat];
  }
}
document.getElementById('pCategory').addEventListener('change', autoFillHsn);

// ─── TABS ────────────────────────────────────────────
// Tab switching
document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const tab = item.dataset.tab;
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('pageTitle').textContent = item.textContent.trim().replace(/\d+$/, '');
    document.getElementById('topActionBtn').style.display = tab === 'products' ? 'block' : 'none';
    loadTab(tab);
  });
});
document.getElementById('topActionBtn').style.display = 'none';

// ─── TOAST ───────────────────────────────────────────
window.showToast = function(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '');
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3000);
};

// ─── HELPERS ─────────────────────────────────────────
function statusBadge(s) {
  const map = { Pending:'badge-pending', Processing:'badge-processing', Shipped:'badge-shipped', Delivered:'badge-delivered', Cancelled:'badge-cancelled' };
  return `<span class="badge ${map[s]||''}">${s}</span>`;
}
function payLabel(p) { return { cod:'💵 COD', upi:'📱 UPI', card:'💳 Card', online:'💳 Online' }[p] || p; }

// ─── DASHBOARD ───────────────────────────────────────
window.loadDashboard = function() {
  const orders = ordersCache;
  const products = productsCache;
  const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.total||0), 0);
  const pending = orders.filter(o => o.status === 'Pending').length;

  document.getElementById('statsGrid').innerHTML = [
    { label:'Total Revenue', value:'₹'+revenue.toLocaleString(), change:'From all orders', up:true, color:'#C4714A' },
    { label:'Total Orders', value:orders.length, change:orders.filter(o => { const d = new Date(o.createdAt||o.date); return d > new Date(Date.now()-86400000*7); }).length + ' this week', up:true, color:'#5B8DEF' },
    { label:'Pending Orders', value:pending, change:pending>0?'⚠ Needs attention':'✓ All clear', up:pending===0, color:'#D4AF5A' },
    { label:'Total Products', value:products.length, change:products.filter(p=>(p.stock||0)<=3).length+' low stock', up:true, color:'#3CB371' },
  ].map(s=>`
    <div class="stat-card">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-change ${s.up?'up':'down'}">${s.change}</div>
    </div>
  `).join('');

  // Revenue chart (simple bars from recent orders)
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayRevenue = [0,0,0,0,0,0,0];
  orders.forEach(o => {
    const d = new Date(o.createdAt||o.date);
    const dayIdx = (d.getDay() + 6) % 7;
    if (o.status !== 'Cancelled') dayRevenue[dayIdx] += (o.total||0);
  });
  const max = Math.max(...dayRevenue, 1);
  document.getElementById('revenueChart').innerHTML = dayRevenue.map((v,i) => `
    <div class="bar-col"><div class="bar" style="height:${Math.max(Math.round(v/max*100),4)}px;"></div><div class="bar-label">${days[i]}</div></div>
  `).join('');

  // Category breakdown
  const cats = { lamp:0, wall:0, pendant:0 };
  orders.forEach(o => (o.items||[]).forEach(item => {
    const p = products.find(pr => pr.id === item.id);
    if (p) cats[p.category] = (cats[p.category]||0) + (item.qty||1);
  }));
  const total = Object.values(cats).reduce((a,b)=>a+b,0)||1;
  const colors = { lamp:'#C4714A', wall:'#D4AF5A', pendant:'#5B8DEF' };
  const labels = { lamp:'Cane Lamps', wall:'Wall Decor', pendant:'Pendants' };
  document.getElementById('catBreakdown').innerHTML = Object.entries(cats).map(([k,v])=>`
    <div class="donut-item"><div class="donut-dot" style="background:${colors[k]}"></div><span class="donut-label">${labels[k]}</span><span class="donut-pct">${Math.round(v/total*100)}%</span></div>
  `).join('') || '<p style="color:var(--muted)">No data yet</p>';

  // Recent orders
  const recent = [...orders].slice(0, 5);
  document.getElementById('recentOrdersBody').innerHTML = recent.length ? recent.map(o=>`
    <tr>
      <td style="font-weight:500;color:var(--accent2);">#${o.orderId||o.id.slice(0,8)}</td>
      <td>${o.customer||'—'}</td>
      <td style="color:var(--green);font-weight:500;">₹${(o.total||0).toLocaleString()}</td>
      <td>${payLabel(o.payment)}</td>
      <td>${statusBadge(o.status)}</td>
      <td style="color:var(--muted);">${new Date(o.createdAt||o.date).toLocaleDateString('en-IN')}</td>
    </tr>
  `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:30px;">No orders yet</td></tr>';
};

// ─── ORDERS ──────────────────────────────────────────
window.renderOrders = function() {
  const filter = document.getElementById('orderStatusFilter').value;
  const search = document.getElementById('orderSearch').value.toLowerCase();
  const filtered = ordersCache.filter(o =>
    (filter === 'all' || o.status === filter) &&
    ((o.customer||'').toLowerCase().includes(search) || (o.orderId||o.id).toLowerCase().includes(search) || (o.phone||'').includes(search))
  );

  document.getElementById('ordersBody').innerHTML = filtered.length ? filtered.map(o=>`
    <tr>
      <td style="font-weight:600;color:var(--accent2);">#${o.orderId||o.id.slice(0,8)}</td>
      <td>${o.customer||'—'}</td>
      <td style="color:var(--muted);">${o.phone||'—'}</td>
      <td>${(o.items||[]).length} item(s)</td>
      <td style="color:var(--green);font-weight:600;">₹${(o.total||0).toLocaleString()}</td>
      <td>${payLabel(o.payment)}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          ${['Pending','Processing','Shipped','Delivered','Cancelled'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td style="color:var(--muted);">${new Date(o.createdAt||o.date).toLocaleDateString('en-IN')}</td>
      <td><button class="action-btn action-view" onclick="viewOrder('${o.id}')">View</button> <button class="action-btn action-edit" onclick="window.open('invoice.html?id=${o.id}','_blank')">Invoice</button></td>
    </tr>
  `).join('') : '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:30px;">No orders found</td></tr>';
};

window.updateOrderStatus = async function(id, status) {
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: new Date().toISOString() });
  showToast('Order updated to ' + status);
};

window.viewOrder = function(id) {
  const o = ordersCache.find(o => o.id === id);
  if (!o) return;
  document.getElementById('orderDetailContent').innerHTML = `
    <div class="order-detail-grid">
      <div class="detail-item"><label>Order ID</label><div class="val">#${o.orderId||o.id.slice(0,8)}</div></div>
      <div class="detail-item"><label>Date</label><div class="val">${new Date(o.createdAt||o.date).toLocaleString('en-IN')}</div></div>
      <div class="detail-item"><label>Customer</label><div class="val">${o.customer||'—'}</div></div>
      <div class="detail-item"><label>Phone</label><div class="val">${o.phone||'—'}</div></div>
      <div class="detail-item"><label>Email</label><div class="val">${o.email||'—'}</div></div>
      <div class="detail-item"><label>Payment</label><div class="val">${payLabel(o.payment)}</div></div>
      <div class="detail-item" style="grid-column:span 2"><label>Address</label><div class="val">${o.address||'—'}</div></div>
      ${o.notes?`<div class="detail-item" style="grid-column:span 2"><label>Notes</label><div class="val">${o.notes}</div></div>`:''}
    </div>
    <div class="order-items-list">
      <div style="font-size:13px;font-weight:600;color:var(--muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.08em;">Items Ordered</div>
      ${(o.items||[]).map(i=>`<div class="order-item-row"><span>${i.name} × ${i.qty}</span><span style="color:var(--accent2);font-weight:500;">₹${(i.price*i.qty).toLocaleString()}</span></div>`).join('')}
      <div class="order-item-row" style="font-weight:700;font-size:15px;color:var(--text);border-top:1px solid var(--border);padding-top:10px;margin-top:4px;"><span>Total</span><span style="color:var(--green)">₹${(o.total||0).toLocaleString()}</span></div>
    </div>
  `;
  document.getElementById('orderModal').classList.add('open');
};

// ─── PRODUCTS ────────────────────────────────────────
window.renderProductsAdmin = function() {
  const search = document.getElementById('productSearch').value.toLowerCase();
  const filtered = productsCache.filter(p => p.name.toLowerCase().includes(search));
  document.getElementById('productsBody').innerHTML = filtered.length ? filtered.map(p => {
    const stockStatus = (p.stock||0)===0 ? '<span class="badge badge-out">Out of Stock</span>' : (p.stock||0)<=3 ? '<span class="badge badge-low">Low Stock</span>' : '<span class="badge badge-active">In Stock</span>';
    const thumbContent = p.image
      ? `<img src="${p.image}" alt="${p.name}"/>`
      : `<div style="width:100%;height:100%;background:linear-gradient(145deg,${p.color1||'#8B5E3C'},${p.color2||'#C4714A'});border-radius:8px;"></div>`;
    const catLabel = {lamp:'Cane Lamp',wall:'Wall Decor',standing:'Standing Lamp',gifting:'Gifting',basket:'Basket',pendant:'Pendant Light'}[p.category] || p.category;
    return `<tr>
      <td><div class="product-cell"><div class="product-thumb">${thumbContent}</div><div class="product-cell-info"><div class="name">${p.name}</div><div class="cat">ID: ${p.id.slice(0,8)}</div></div></div></td>
      <td><span class="badge badge-processing">${catLabel}</span></td>
      <td style="color:var(--green);font-weight:600;">₹${(p.price||0).toLocaleString()}</td>
      <td style="color:var(--muted);text-decoration:line-through;">₹${(p.originalPrice||0).toLocaleString()}</td>
      <td style="font-weight:500;">${p.stock||0}</td>
      <td>${stockStatus}</td>
      <td><div style="display:flex;gap:6px;"><button class="action-btn action-edit" onclick="openEditProduct('${p.id}')">Edit</button><button class="action-btn action-del" onclick="deleteProductById('${p.id}')">Delete</button></div></td>
    </tr>`;
  }).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px;">No products found</td></tr>';
};

let pendingImageFile = null;

window.openAddProduct = function() {
  document.getElementById('productModalTitle').textContent = 'Add New Product';
  document.getElementById('editProductId').value = '';
  document.getElementById('pName').value = '';
  document.getElementById('pCategory').value = 'lamp';
  document.getElementById('pBadge').value = 'new';
  document.getElementById('pPrice').value = '';
  document.getElementById('pOriginal').value = '';
  document.getElementById('pHsn').value = '';
  document.getElementById('pGst').value = '5';
  document.getElementById('pStock').value = '';
  document.getElementById('pRating').value = '5';
  document.getElementById('pColor1').value = '#8B5E3C';
  document.getElementById('pColor2').value = '#C4714A';
  pendingImageFile = null;
  resetImageUpload();
  autoFillHsn();
  document.getElementById('productModal').classList.add('open');
};

window.openEditProduct = function(id) {
  const p = productsCache.find(pr => pr.id === id);
  if (!p) return;
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('editProductId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pBadge').value = p.badge;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pOriginal').value = p.originalPrice;
  document.getElementById('pHsn').value = p.hsn || '';
  document.getElementById('pGst').value = p.gstRate || 5;
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pRating').value = p.rating;
  document.getElementById('pColor1').value = p.color1 || '#8B5E3C';
  document.getElementById('pColor2').value = p.color2 || '#C4714A';
  pendingImageFile = null;
  if (p.image) {
    document.getElementById('imgPreview').src = p.image;
    document.getElementById('imgPreviewWrap').style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('imgUploadArea').classList.add('has-image');
  } else { resetImageUpload(); }
  document.getElementById('productModal').classList.add('open');
};

window.closeProductModal = function() { document.getElementById('productModal').classList.remove('open'); };

window.handleImageUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5*1024*1024) { showToast('Image too large. Max 5MB.', true); return; }
  pendingImageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('imgPreview').src = e.target.result;
    document.getElementById('imgPreviewWrap').style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('imgUploadArea').classList.add('has-image');
  };
  reader.readAsDataURL(file);
};

window.removeImage = function(e) {
  e.stopPropagation(); e.preventDefault();
  pendingImageFile = null;
  resetImageUpload();
};

function resetImageUpload() {
  document.getElementById('pImageFile').value = '';
  document.getElementById('imgPreview').src = '';
  document.getElementById('imgPreviewWrap').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'block';
  document.getElementById('imgUploadArea').classList.remove('has-image');
}

window.saveProduct = async function() {
  const name = document.getElementById('pName').value.trim();
  const price = parseInt(document.getElementById('pPrice').value);
  const original = parseInt(document.getElementById('pOriginal').value);
  const stock = parseInt(document.getElementById('pStock').value);
  const hsn = document.getElementById('pHsn').value.trim();
  const gstRate = parseInt(document.getElementById('pGst').value) || 5;
  if (!name || !price || !original || isNaN(stock)) { showToast('Please fill all required fields', true); return; }
  if (!hsn) { showToast('HSN Code is mandatory for GST filing', true); return; }

  showToast('Saving...');
  let imageUrl = '';
  const editId = document.getElementById('editProductId').value;

  // Upload image to Cloudinary if new file selected
  if (pendingImageFile) {
    imageUrl = await uploadImageToCloud(pendingImageFile);
  } else if (editId) {
    const existing = productsCache.find(p => p.id === editId);
    imageUrl = existing?.image || '';
  }

  const productData = {
    name,
    category: document.getElementById('pCategory').value,
    price, originalPrice: original,
    badge: document.getElementById('pBadge').value,
    rating: parseInt(document.getElementById('pRating').value) || 5,
    reviews: editId ? (productsCache.find(p=>p.id===editId)?.reviews || 0) : 0,
    color1: document.getElementById('pColor1').value,
    color2: document.getElementById('pColor2').value,
    stock,
    hsn,
    gstRate,
    image: imageUrl
  };

  try {
    if (editId) {
      await updateDoc(doc(db, 'products', editId), { ...productData, updatedAt: new Date().toISOString() });
      showToast('Product updated!');
    } else {
      await addDoc(collection(db, 'products'), { ...productData, createdAt: new Date().toISOString() });
      showToast('Product added!');
    }
    closeProductModal();
  } catch (e) {
    showToast('Error: ' + e.message, true);
  }
};

window.deleteProductById = async function(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, 'products', id));
    showToast('Product deleted');
  } catch (e) { showToast('Error: ' + e.message, true); }
};

// ─── PAYMENTS ────────────────────────────────────────
window.renderPayments = function() {
  const filter = document.getElementById('payFilter').value;
  const filtered = ordersCache.filter(o => filter === 'all' || o.payment === filter);
  const byMethod = { cod:0, upi:0, card:0, online:0 };
  ordersCache.forEach(o => { byMethod[o.payment] = (byMethod[o.payment]||0) + (o.total||0); });

  document.getElementById('paymentStats').innerHTML = [
    {label:'COD Revenue',value:'₹'+(byMethod.cod||0).toLocaleString(),change:'Cash on Delivery'},
    {label:'Online Revenue',value:'₹'+((byMethod.upi||0)+(byMethod.card||0)+(byMethod.online||0)).toLocaleString(),change:'UPI / Card / Online'},
    {label:'Total Collected',value:'₹'+ordersCache.filter(o=>o.status==='Delivered').reduce((s,o)=>s+(o.total||0),0).toLocaleString(),change:'Delivered orders'},
  ].map(s=>`<div class="stat-card"><div class="stat-label">${s.label}</div><div class="stat-value" style="font-size:22px;">${s.value}</div><div class="stat-change up">${s.change}</div></div>`).join('');

  document.getElementById('paymentsBody').innerHTML = filtered.length ? filtered.map(o=>`
    <tr>
      <td style="font-weight:600;color:var(--accent2);">#${o.orderId||o.id.slice(0,8)}</td>
      <td>${o.customer||'—'}</td>
      <td style="color:var(--green);font-weight:600;">₹${(o.total||0).toLocaleString()}</td>
      <td>${payLabel(o.payment)}</td>
      <td>${statusBadge(o.status)}</td>
      <td style="color:var(--muted);">${new Date(o.createdAt||o.date).toLocaleDateString('en-IN')}</td>
    </tr>
  `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:30px;">No payments found</td></tr>';
};

// ─── CUSTOMERS ───────────────────────────────────────
window.renderCustomers = function() {
  const search = document.getElementById('custSearch').value.toLowerCase();
  const custMap = {};
  ordersCache.forEach(o => {
    const key = o.phone || o.email || o.customer;
    if (!key) return;
    if (!custMap[key]) custMap[key] = { name:o.customer||'—', email:o.email||'—', phone:o.phone||'—', city:(o.address||'').split(',').slice(-3,-2)[0]?.trim()||'—', orders:0, total:0, lastDate:o.createdAt||o.date };
    custMap[key].orders++;
    custMap[key].total += (o.total||0);
    if (new Date(o.createdAt||o.date) > new Date(custMap[key].lastDate)) custMap[key].lastDate = o.createdAt||o.date;
  });
  const customers = Object.values(custMap).filter(c =>
    c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.phone.includes(search)
  ).sort((a,b) => b.total - a.total);

  document.getElementById('customersBody').innerHTML = customers.length ? customers.map(c=>`
    <tr>
      <td style="font-weight:500;">${c.name}</td>
      <td style="color:var(--muted);">${c.email}</td>
      <td>${c.phone}</td>
      <td><span class="badge badge-processing">${c.orders} order${c.orders>1?'s':''}</span></td>
      <td style="color:var(--green);font-weight:600;">₹${c.total.toLocaleString()}</td>
      <td style="color:var(--muted);">${c.city}</td>
      <td style="color:var(--muted);">${new Date(c.lastDate).toLocaleDateString('en-IN')}</td>
    </tr>
  `).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px;">No customers found</td></tr>';
};

// ─── TAB LOADING ─────────────────────────────────────
function loadTab(tab) {
  if (tab === 'dashboard') loadDashboard();
  if (tab === 'orders') renderOrders();
  if (tab === 'products') renderProductsAdmin();
  if (tab === 'payments') renderPayments();
  if (tab === 'customers') renderCustomers();
}
window.loadAll = function() { loadDashboard(); };

// Close modals on backdrop click
document.getElementById('productModal').addEventListener('click', e => { if(e.target===document.getElementById('productModal')) closeProductModal(); });
document.getElementById('orderModal').addEventListener('click', e => { if(e.target===document.getElementById('orderModal')) document.getElementById('orderModal').classList.remove('open'); });

// ─── INIT ────────────────────────────────────────────
let initialized = false;
onAuthStateChanged(auth, (user) => {
  if (user && !initialized) {
    initialized = true;
    init();
  }
});

async function init() {
  await seedProductsIfEmpty();
  listenProducts();
  listenOrders();
  loadDashboard();
}
