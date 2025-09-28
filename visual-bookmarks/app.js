console.log("Cure8 - Content Curation Platform ready for initialization.");

// Debug function to check curated content data
function debugCuratedContent() {
  console.log('=== DEBUGGING CURE8 CURATED CONTENT ===');
  console.log('Curated content array:', bookmarks);
  console.log('Curated content count:', bookmarks.length);
  console.log('Grid element found:', !!document.querySelector('#muuri-grid'));
  console.log('Muuri grid instance:', !!muuriGrid);
}

let bookmarks = JSON.parse(localStorage.getItem('cure8_curated_content') || '[]');
let muuriGrid; // Muuri grid instance
let isRendering = false;
let lastDeletedCard = null;

// Initialize Muuri grid
function initMuuriGrid() {
  const gridElement = document.querySelector('#muuri-grid');
  if (!gridElement) return;

  // Calculate responsive item width
  const containerWidth = gridElement.offsetWidth;
  const itemWidth = Math.min(280, Math.floor((containerWidth - 60) / Math.floor(containerWidth / 300)));

  muuriGrid = new Muuri(gridElement, {
    layout: {
      fillGaps: true,
      horizontal: false
    },
    dragEnabled: false,
    layoutOnResize: true,
    layoutOnInit: true,
    layoutDuration: 300,
    layoutEasing: 'ease'
  });

  // Muuri initialized successfully

  console.log('Muuri grid initialized');
}

// Save bookmark order to localStorage
function saveBookmarkOrder() {
  localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));
}

// Update bookmark indices after reordering
function updateBookmarkIndices() {
  const items = document.querySelectorAll('.item');
  items.forEach((item, index) => {
    item.dataset.bookmarkIndex = index;
  });
}

// Create a card element for Muuri
function createCardElement(data, index) {
  const item = document.createElement('div');
  item.className = 'item bookmark-card';
  item.dataset.bookmarkIndex = index;
  item.setAttribute('data-tags', data.tags || '');
  
  // Use cached thumbnail or favicon
  const thumbnailUrl = data.thumbnailUrl || `https://www.google.com/s2/favicons?sz=128&domain_url=${data.url}`;
  
  item.innerHTML = `
    <div class="card-content">
      <button class="delete-btn" title="Delete content">&times;</button>
      <img class="card-thumbnail" src="${thumbnailUrl}" alt="${data.title}" loading="lazy">
      <hr class="card-divider">
      <div class="card-footer">
        <strong class="card-title">${data.title}</strong>
        <p class="card-url">${data.url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}</p>
        ${data.notes ? `<div class="card-notes">${data.notes}</div>` : ''}
        ${data.tags ? `<div class="card-tags">${data.tags.split(',').map(t => `<span>${t.trim()}</span>`).join(' ')}</div>` : ''}
      </div>
    </div>
  `;
  
  // Add delete button handler
  const deleteBtn = item.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    deleteCard(index);
  });
  
  // Add click handler for card
  const cardContent = item.querySelector('.card-content');
  cardContent.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) return;
    
    document.querySelector('.details-modal-title').textContent = data.title;
    document.querySelector('.details-modal-url').textContent = data.url;
    document.querySelector('.details-modal-notes').textContent = data.notes;
    document.querySelector('.details-modal-tags').textContent = data.tags;
    document.querySelector('.modal-overlay').classList.add('active');
    document.getElementById('details-modal').classList.add('active');
  });
  
  // Image loaded - no special handling needed for CSS columns
  const img = item.querySelector('.card-thumbnail');
  img.addEventListener('load', function() {
    // CSS columns handle layout automatically
  });
  
  return item;
}

// Render all cards with Muuri
function renderAllCards() {
  if (isRendering) return;
  isRendering = true;
  
  const gridElement = document.querySelector('#muuri-grid');
  if (!gridElement) {
    console.error('Grid element not found');
    isRendering = false;
    return;
  }
  
  gridElement.innerHTML = '';
  
  console.log('Rendering', bookmarks.length, 'bookmarks');
  
  // Create all card elements
  for (let i = 0; i < bookmarks.length; i++) {
    const item = createCardElement(bookmarks[i], i);
    gridElement.appendChild(item);
  }
  
  // CSS columns handle layout automatically - no Muuri needed
  isRendering = false;
  console.log('Render complete');
}

// Add a new card (appears in top-left position)
function addCard({ title, url, notes, tags }) {
  const newBookmark = { title, url, notes, tags, thumbnailUrl: null };
  
  // Add to beginning of array (top-left position)
  bookmarks.unshift(newBookmark);
  
  // Save to localStorage
  localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));
  
  console.log('Added new bookmark:', newBookmark);
  console.log('Total bookmarks:', bookmarks.length);
  
  // Re-render all cards to maintain proper order with CSS columns
  renderAllCards();
  
  // Fetch thumbnail in background
  setTimeout(() => {
    fetchThumbnailInBackground(newBookmark, 0);
  }, 500);
}

// Delete a card
function deleteCard(index) {
  if (index < 0 || index >= bookmarks.length) return;
  
  // Store for undo
  lastDeletedCard = {
    bookmark: bookmarks[index],
    index: index
  };
  
  // Remove from array
  bookmarks.splice(index, 1);
  
  // Save to localStorage
  localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));
  
  // Re-render all cards
  renderAllCards();
  
  // Show undo button
  showUndoButton();
}

// Undo last deletion
function undoLastDeletion() {
  if (!lastDeletedCard) return;
  
  // Re-add to array at original position
  bookmarks.splice(lastDeletedCard.index, 0, lastDeletedCard.bookmark);
  
  // Save to localStorage
  localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));
  
  // Re-render all cards
  renderAllCards();
  
  // Clear undo data
  lastDeletedCard = null;
  
  // Hide undo button
  hideUndoButton();
}

// Fetch thumbnail in background
async function fetchThumbnailInBackground(bookmark, index) {
  try {
    const imageUrl = await fetchMicrolinkThumbnail(bookmark.url);
    if (imageUrl) {
      bookmark.thumbnailUrl = imageUrl;
      saveBookmarkOrder();
      
      // Update the image in the DOM
      const items = document.querySelectorAll('.muuri-item');
      if (items[index]) {
        const img = items[index].querySelector('.card-thumbnail');
        if (img) {
          img.src = imageUrl;
        }
      }
    }
  } catch (error) {
    console.log('Thumbnail fetch failed:', error);
  }
}

// Fetch thumbnail from Microlink API
async function fetchMicrolinkThumbnail(url) {
  const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
  const data = await response.json();
  return data.data?.image?.url;
}

// Show undo button
function showUndoButton() {
  // Remove existing undo button
  const existingUndo = document.querySelector('.undo-btn');
  if (existingUndo) existingUndo.remove();
  
  const undoBtn = document.createElement('button');
  undoBtn.className = 'undo-btn';
  undoBtn.textContent = 'Undo Delete';
  undoBtn.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: linear-gradient(135deg, #FF69B4, #E91E63);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    z-index: 1000;
    box-shadow: 0 4px 16px rgba(255, 105, 180, 0.4);
  `;
  
  undoBtn.addEventListener('click', undoLastDeletion);
  document.body.appendChild(undoBtn);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideUndoButton();
  }, 5000);
}

// Hide undo button
function hideUndoButton() {
  const undoBtn = document.querySelector('.undo-btn');
  if (undoBtn) {
    undoBtn.remove();
  }
}

// Filter bookmarks by category
function filterBookmarksByCategory(category) {
  console.log('Filtering by category:', category);
  
  const gridElement = document.querySelector('.bookmarks-grid');
  if (!gridElement) return;
  
  // Get all bookmark cards
  const cards = gridElement.querySelectorAll('.bookmark-card');
  
  cards.forEach(card => {
    const cardTags = card.getAttribute('data-tags') || '';
    const tagsArray = cardTags.split(',').map(tag => tag.trim().toLowerCase());
    
    let shouldShow = false;
    
    if (category === 'all') {
      shouldShow = true;
    } else if (category === 'work') {
      // Show if any work-related tags are present
      shouldShow = tagsArray.some(tag => 
        tag.includes('work') || tag.includes('business') || tag.includes('professional')
      );
    } else if (category === 'personal') {
      // Show if any personal-related tags are present
      shouldShow = tagsArray.some(tag => 
        tag.includes('personal') || tag.includes('life') || tag.includes('hobby')
      );
    }
    
    // Show or hide the card
    if (shouldShow) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  
  // Refresh grid layout if muuri is available
  if (window.muuriGrid) {
    window.muuriGrid.refreshItems();
    window.muuriGrid.layout();
  }
}

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelector('.modal-overlay').classList.remove('active');
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
      });
    });
  });
  
  // Modal overlay click
  document.querySelector('.modal-overlay').addEventListener('click', function() {
    this.classList.remove('active');
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  });
  
  // Add bookmark button
  document.querySelector('.add-bookmark-btn').addEventListener('click', function() {
    document.querySelector('.modal-overlay').classList.add('active');
    document.getElementById('add-modal').classList.add('active');
  });
  
  // Form submission
  document.getElementById('add-bookmark-form').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    const form = e.target;
    const url = form.querySelector('input[name="url"]').value;
    let title = form.querySelector('input[name="title"]').value.trim();
    const notes = form.querySelector('textarea[name="notes"]').value.trim();
    const tags = form.querySelector('input[name="tags"]').value.trim();

    console.log('Form data:', { url, title, notes, tags });

    // Title fallback
    if (!title) {
      try {
        title = new URL(url).hostname.replace('www.','');
      } catch { title = url; }
    }

    console.log('Adding card with title:', title);
    
    // Validate URL
    if (!url || url.trim() === '') {
      console.error('URL is required');
      return;
    }
    
    addCard({ title, url, notes, tags });
    
    // Small delay before closing modal to ensure card is added
    setTimeout(() => {
      form.reset();
      
      // Close modal
      document.querySelector('.modal-overlay').classList.remove('active');
      document.getElementById('add-modal').classList.remove('active');
      
      console.log('Modal closed, card should be visible');
    }, 200);
  });
  
  // Search functionality
  document.querySelector('.search').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.item');
    
    items.forEach(item => {
      const title = item.querySelector('.card-title').textContent.toLowerCase();
      const url = item.querySelector('.card-url').textContent.toLowerCase();
      const notes = item.querySelector('.card-notes')?.textContent.toLowerCase() || '';
      const tags = item.querySelector('.card-tags')?.textContent.toLowerCase() || '';
      
      const matches = title.includes(searchTerm) || 
                     url.includes(searchTerm) || 
                     notes.includes(searchTerm) || 
                     tags.includes(searchTerm);
      
      if (matches) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Refresh grid layout after filtering
    if (muuriGrid) {
      muuriGrid.refreshItems();
      muuriGrid.layout();
    }
  });
  
  // Navigation buttons
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get the category from data attribute
      const category = this.getAttribute('data-category');
      
      // Handle special case for "Add Category"
      if (category === 'add') {
        // You can add logic here to show a modal or form to add new categories
        console.log('Add Category clicked');
        return;
      }
      
      // Filter bookmarks by category
      filterBookmarksByCategory(category);
    });
  });
  
  // Initialize the grid
  console.log('DOM loaded, initializing grid...');
  console.log('Bookmarks from localStorage:', bookmarks);
  
  // Small delay to ensure DOM is fully ready
  setTimeout(() => {
    renderAllCards();
  }, 100);
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // CSS columns handle responsive layout automatically
    }, 150);
  });
});

// Debug call
setTimeout(() => {
  debugCuratedContent();
}, 1000);