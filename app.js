// app.js - Lost & Found App

document.addEventListener('DOMContentLoaded', () => {
  // --- DATA & STATE ---
  const CATEGORIES = [
    'Electronics', 'Wallet/ID/Documents', 'Clothing', 'Bags', 'Keys', 'Accessories', 'Books/Stationery', 'Others'
  ];

  // In-memory database simulation
  let itemsDB = [
    {
      id: '1', type: 'lost', title: 'Lost Black Bose Headphones', description: 'Lost my Bose QuietComfort 45 headphones in a black case. Most likely left them in the main library on the second floor near the study carrels.', category: 'Electronics', location: 'Main Library, 2nd Floor', date_iso: '2025-09-01', contact_name: 'Jane Doe', contact_email: 'jane@example.com', image_path: 'https://placehold.co/600x400/0d1320/a3aab8?text=Bose+Headphones', resolved: false, created_at: new Date('2025-09-01T10:00:00Z').toISOString()
    },
    {
      id: '2', type: 'found', title: 'Found a set of keys', description: 'Found a set of keys with a red keychain attached. It has three keys: one for a car, and two for a house. Found near the campus coffee shop.', category: 'Keys', location: 'Campus Coffee Shop', date_iso: '2025-09-02', contact_name: 'John Smith', contact_email: 'john@example.com', image_path: null, resolved: false, created_at: new Date('2025-09-02T14:30:00Z').toISOString()
    },
    {
      id: '3', type: 'found', title: 'Found a Blue Hydro Flask', description: 'A blue 32oz Hydro Flask water bottle was left at the campus gym. It has a few stickers on it, one of a mountain range. It is now at the front desk.', category: 'Accessories', location: 'Campus Gym', date_iso: '2025-08-30', contact_name: 'Gym Staff', contact_email: 'gym@example.com', image_path: 'https://placehold.co/600x400/0d1320/a3aab8?text=Hydro+Flask', resolved: true, created_at: new Date('2025-08-30T18:00:00Z').toISOString()
    },
    {
      id: '4', type: 'lost', title: 'Missing Green Jansport Backpack', description: 'My green Jansport backpack went missing from the student union building. It contains a MacBook Pro and several textbooks. It has my name tag on it.', category: 'Bags', location: 'Student Union', date_iso: '2025-09-03', contact_name: 'Emily White', contact_email: 'emily@example.com', image_path: null, resolved: false, created_at: new Date('2025-09-03T12:00:00Z').toISOString()
    }
  ];

  const mainContent = document.getElementById('main-content');
  let currentFilters = { q: '', type: 'all', category: 'all', status: 'open' };
  const simpleUUID = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
  const getTodayString = () => new Date().toISOString().split('T')[0];

  // --- PAGE RENDERING ---
  const renderListPage = () => {
    const pageHTML = `
      <div id="page-list" class="page active">
        <section class="card">
          <form id="filter-form" class="filters">
            <input type="text" name="q" value="${currentFilters.q}" placeholder="Search by keyword..." />
            <select name="type">
              <option value="all" ${currentFilters.type === 'all' ? 'selected' : ''}>All Types</option>
              <option value="lost" ${currentFilters.type === 'lost' ? 'selected' : ''}>Lost</option>
              <option value="found" ${currentFilters.type === 'found' ? 'selected' : ''}>Found</option>
            </select>
            <select name="category">
              <option value="all" ${currentFilters.category === 'all' ? 'selected' : ''}>All Categories</option>
              ${CATEGORIES.map(cat => `<option value="${cat}" ${currentFilters.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
            <select name="status">
              <option value="open" ${currentFilters.status === 'open' ? 'selected' : ''}>Open</option>
              <option value="resolved" ${currentFilters.status === 'resolved' ? 'selected' : ''}>Resolved</option>
              <option value="all" ${currentFilters.status === 'all' ? 'selected' : ''}>All Statuses</option>
            </select>
            <button class="btn" type="submit">Filter</button>
          </form>
        </section>
        <section class="grid" id="items-grid">
          ${renderItemsGrid()}
        </section>
      </div>
    `;
    mainContent.innerHTML = pageHTML;
    addListPageListeners();
  };

  const renderItemsGrid = () => {
    const filteredItems = itemsDB
      .filter(item => {
        const q = currentFilters.q.toLowerCase().trim();
        if (q && !(item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.location.toLowerCase().includes(q))) {
          return false;
        }
        if (currentFilters.type !== 'all' && item.type !== currentFilters.type) {
          return false;
        }
        if (currentFilters.category !== 'all' && item.category !== currentFilters.category) {
          return false;
        }
        if (currentFilters.status === 'open' && item.resolved) {
          return false;
        }
        if (currentFilters.status === 'resolved' && !item.resolved) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (!filteredItems.length) {
      return '<div class="empty"><p>No items found. Try different filters or be the first to post.</p></div>';
    }

    return filteredItems.map(item => `
      <article class="card item-card">
        <a class="item-link" data-id="${item.id}">
          ${item.image_path ? `<img class="thumb" src="${item.image_path}" alt="Item image">` : '<div class="thumb placeholder">No Image</div>'}
          <div class="item-body">
            <div class="item-meta">
              <span class="badge ${item.type === 'lost' ? 'badge-danger' : 'badge-success'}">${item.type}</span>
              ${item.resolved ? '<span class="badge badge-neutral">Resolved</span>' : ''}
              <span class="badge badge-muted">${item.category}</span>
            </div>
            <h3 class="item-title">${item.title}</h3>
            <p class="item-desc">${item.description.length > 100 ? item.description.slice(0, 100) + '...' : item.description}</p>
            <div class="item-footer">
              <span class="muted"><strong>${item.location}</strong></span>
              <span class="muted"><strong>${item.date_iso}</strong></span>
            </div>
          </div>
        </a>
      </article>
    `).join('');
  };

  const renderNewPage = (type) => {
    const pageHTML = `
      <div id="page-new" class="page active">
        <section class="card">
          <h2>${type === 'lost' ? 'Report Lost Item' : 'Report Found Item'}</h2>
          <form class="form" id="new-item-form">
            <input type="hidden" name="type" value="${type}">
            <div class="form-row">
              <label>Title <span class="req">*</span></label>
              <input name="title" type="text" required placeholder="e.g., Lost black wallet near library" />
            </div>
            <div class="form-row">
              <label>Description <span class="req">*</span></label>
              <textarea name="description" rows="4" required placeholder="Describe brand, color, identifiers..."></textarea>
            </div>
            <div class="form-row">
              <label>Category <span class="req">*</span></label>
              <select name="category" required>
                ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>
            <div class="form-row">
              <label>Location <span class="req">*</span></label>
              <input name="location" type="text" required placeholder="Where was it lost/found?" />
            </div>
            <div class="form-row">
              <label>Date <span class="req">*</span></label>
              <input name="date_iso" type="date" required value="${getTodayString()}"/>
            </div>
            <div class="form-row">
              <label>Contact Name <span class="req">*</span></label>
              <input name="contact_name" type="text" required placeholder="Your name" />
            </div>
            <div class="form-row">
              <label>Contact Email <span class="req">*</span></label>
              <input name="contact_email" type="email" required placeholder="your@email.com" />
            </div>
            <div class="form-row">
              <label>Image (optional)</label>
              <input name="image" type="file" accept="image/*" />
            </div>
            <div class="form-actions">
              <button class="btn" type="submit">Submit</button>
              <a class="btn btn-outline" id="cancel-new-item" href="#">Cancel</a>
            </div>
          </form>
        </section>
      </div>
    `;
    mainContent.innerHTML = pageHTML;
    addNewPageListeners();
  };

  const renderShowPage = (id) => {
    const item = itemsDB.find(i => i.id === id);
    if (!item) {
      renderListPage();
      return;
    }

    const pageHTML = `
      <div id="page-show" class="page active">
        <article class="card item-detail">
          <div class="item-detail-grid">
            <div class="media">
              ${item.image_path ? `<img class="hero" src="${item.image_path}" alt="Item image"/>` : '<div class="hero placeholder">No Image</div>'}
            </div>
            <div class="details">
              <div class="item-meta">
                <span class="badge ${item.type === 'lost' ? 'badge-danger' : 'badge-success'}">${item.type}</span>
                ${item.resolved ? '<span class="badge badge-neutral">Resolved</span>' : ''}
                <span class="badge badge-muted">${item.category}</span>
              </div>
              <h2>${item.title}</h2>
              <p class="desc">${item.description.replace(/\n/g, '<br>')}</p>
              <div class="grid-two">
                <div><div class="muted">Location</div><div><strong>${item.location}</strong></div></div>
                <div><div class="muted">Date</div><div><strong>${item.date_iso}</strong></div></div>
              </div>
              <div class="grid-two">
                <div><div class="muted">Contact</div><div><strong>${item.contact_name}</strong></div></div>
                <div><div class="muted">Email</div><div><a href="mailto:${item.contact_email}?subject=Regarding: ${encodeURIComponent(item.title)}">${item.contact_email}</a></div></div>
              </div>
              <div class="form-actions">
                <button class="btn btn-success" id="resolve-btn" data-id="${item.id}" ${item.resolved ? 'disabled' : ''}>
                  ${item.resolved ? 'Already Resolved' : 'Mark as Resolved'}
                </button>
                <a class="btn btn-outline" id="back-to-list" href="#">Back to List</a>
              </div>
            </div>
          </div>
        </article>
      </div>
    `;
    mainContent.innerHTML = pageHTML;
    addShowPageListeners();
  };

  // --- EVENT LISTENERS ---
  function addListPageListeners() {
    document.getElementById('filter-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      currentFilters.q = formData.get('q');
      currentFilters.type = formData.get('type');
      currentFilters.category = formData.get('category');
      currentFilters.status = formData.get('status');
      document.getElementById('items-grid').innerHTML = renderItemsGrid();
    });

    document.getElementById('items-grid').addEventListener('click', (e) => {
      const link = e.target.closest('.item-link');
      if (link) {
        e.preventDefault();
        const id = link.dataset.id;
        renderShowPage(id);
      }
    });
  }

  function addNewPageListeners() {
    document.getElementById('cancel-new-item').addEventListener('click', (e) => {
      e.preventDefault();
      renderListPage();
    });

    document.getElementById('new-item-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const imageFile = formData.get('image');

      const newItem = {
        id: simpleUUID(),
        type: formData.get('type'),
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        category: formData.get('category'),
        location: formData.get('location').trim(),
        date_iso: formData.get('date_iso'),
        contact_name: formData.get('contact_name').trim(),
        contact_email: formData.get('contact_email').trim(),
        image_path: null,
        resolved: false,
        created_at: new Date().toISOString()
      };
      
      if (imageFile && imageFile.size > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
          newItem.image_path = event.target.result;
          itemsDB.push(newItem);
          renderShowPage(newItem.id);
        };
        reader.readAsDataURL(imageFile);
      } else {
         itemsDB.push(newItem);
         renderShowPage(newItem.id);
      }
    });
  }

  function addShowPageListeners() {
    document.getElementById('back-to-list').addEventListener('click', (e) => {
      e.preventDefault();
      renderListPage();
    });

    const resolveBtn = document.getElementById('resolve-btn');
    if (resolveBtn) {
      resolveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.disabled) return;
        const id = e.target.dataset.id;
        const item = itemsDB.find(i => i.id === id);
        if (item) {
          item.resolved = true;
          renderShowPage(id); // Re-render the page to show updated state
        }
      });
    }
  }

  // --- GLOBAL NAVIGATION ---
  document.getElementById('brand-link').addEventListener('click', e => { e.preventDefault(); renderListPage(); });
  document.getElementById('report-lost-btn').addEventListener('click', e => { e.preventDefault(); renderNewPage('lost'); });
  document.getElementById('report-found-btn').addEventListener('click', e => { e.preventDefault(); renderNewPage('found'); });

  // --- INITIALIZATION ---
  renderListPage();
});
