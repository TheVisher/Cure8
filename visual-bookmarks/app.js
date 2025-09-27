console.log("Cure8 - Content Curation Platform ready for initialization.");

// Debug function to check curated content data
function debugCuratedContent() {
  console.log('=== DEBUGGING CURE8 CURATED CONTENT ===');
  console.log('Curated content array:', bookmarks);
  console.log('Curated content count:', bookmarks.length);
  console.log('Grid element found:', !!document.querySelector('.bookmarks-grid'));
  console.log('Grid layout instance:', !!grid);
}

let bookmarks = JSON.parse(localStorage.getItem('cure8_curated_content') || '[]'); // Initialize from localStorage
let grid; // Isotope grid instance
let isRendering = false; // Prevent multiple simultaneous renders
let lastDeletedCard = null; // Store last deleted card for undo

// Image loading detection function
function imagesLoaded(container, callback) {
  const images = container.querySelectorAll('img');
  let loadedCount = 0;
  
  if (images.length === 0) {
    callback();
    return;
  }
  
  images.forEach(img => {
    if (!img.complete) {
      img.addEventListener('load', () => {
        loadedCount++;
        if (loadedCount === images.length) callback();
      });
      img.addEventListener('error', () => {
        loadedCount++;
        if (loadedCount === images.length) callback();
      });
    } else {
      loadedCount++;
    }
  });
  
  if (loadedCount === images.length) callback();
}

// Debug curated content loading
console.log('Cure8 curated content raw from localStorage:', localStorage.getItem('cure8_curated_content'));
console.log('Cure8 curated content parsed:', JSON.parse(localStorage.getItem('cure8_curated_content') || '[]'));
console.log('Curated content variable type:', typeof bookmarks);
console.log('Curated content is array?', Array.isArray(bookmarks));


async function renderAllCards() {
  if (isRendering) return; // Prevent multiple simultaneous renders
  isRendering = true;
  
  const gridElement = document.querySelector('.bookmarks-grid');
  gridElement.innerHTML = ''; // Clear the grid completely
  
  // Create all items first - don't await, let them load in parallel
  const cardPromises = bookmarks.map(async (data) => {
    const item = await createCardElement(data);
    return item;
  });
  
  // Wait for all cards to be created
  const items = await Promise.all(cardPromises);
  
  // Add all items to DOM at once
  items.forEach(item => gridElement.appendChild(item));
  
  // Refresh Isotope grid only once - DISABLED
  // if (grid) {
  //   grid.reloadItems();
  //   grid.layout();
  // }
  
  isRendering = false;
}

function renderAllCardsFast() {
  console.log('renderAllCardsFast called, bookmarks count:', bookmarks.length);
  if (isRendering) return;
  isRendering = true;
  
  const gridElement = document.querySelector('.bookmarks-grid');
  console.log('Grid element found:', !!gridElement);
  
  // Clear only the items, keep the grid sizer
  const items = gridElement.querySelectorAll('.item');
  items.forEach(item => item.remove());
  
  // Create all items first
  const itemElements = [];
  bookmarks.forEach((data, index) => {
    // Use cached thumbnail if available, otherwise use favicon (avoid API calls)
    const thumbnailUrl = data.thumbnailUrl || `https://www.google.com/s2/favicons?sz=128&domain_url=${data.url}`;
    
    // Create item element (this is what Isotope manages)
    const item = document.createElement('div');
    item.className = 'item';
    item.dataset.bookmarkIndex = index;
    
    // Wrap in .card element with proper structure
    item.innerHTML = `
      <div class="card">
        <button class="delete-btn" title="Delete content">&times;</button>
        <img class="card-thumbnail" src="${thumbnailUrl}" alt="${data.title}">
        <div class="card-content">
          <h3 class="card-title">${data.title}</h3>
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
    
    // Add click handler for card (but not delete button)
    const card = item.querySelector('.card');
    card.addEventListener('click', function(e) {
      if (e.target.classList.contains('delete-btn')) return;
      
      document.querySelector('.details-modal-title').textContent = data.title;
      document.querySelector('.details-modal-url').textContent = data.url;
      document.querySelector('.details-modal-notes').textContent = data.notes;
      document.querySelector('.details-modal-tags').textContent = data.tags;
      document.querySelector('.modal-overlay').classList.add('active');
      document.getElementById('details-modal').classList.add('active');
    });
    
    itemElements.push(item);
  });
  
  // Add all items to DOM at once
  itemElements.forEach(item => gridElement.appendChild(item));
  
  // Layout the grid after all items are added
  if (grid) {
    console.log('Grid container width:', gridElement.offsetWidth);
    console.log('Items added to grid:', gridElement.children.length);
    
    // Use Isotope's insert method to properly add items - DISABLED
    // grid.reloadItems();
    // grid.layout();
    console.log('Grid layout completed');
    
    // Debug: Check item dimensions
    const debugItems = gridElement.querySelectorAll('.item');
    debugItems.forEach((item, i) => {
      console.log(`Item ${i}: width=${item.offsetWidth}, height=${item.offsetHeight}`);
    });
    
    // Wait for all images to load and layout again - DISABLED
    // imagesLoaded(gridElement, () => {
    //   console.log('All images loaded, refreshing grid layout');
    //   grid.reloadItems();
    //   grid.layout();
    //   console.log('Final grid layout completed');
    // });
  } else {
    console.warn('Grid not available during renderAllCardsFast');
  }
  
  isRendering = false;
  
  // Optionally fetch better thumbnails in background (without blocking UI)
  setTimeout(() => {
    fetchBetterThumbnailsInBackground();
  }, 1000);
}

async function fetchBetterThumbnailsInBackground() {
  // Only fetch thumbnails for bookmarks that don't have cached thumbnails
  const bookmarksNeedingThumbnails = bookmarks.filter(data => !data.thumbnailUrl);
  
  bookmarksNeedingThumbnails.forEach(async (data, index) => {
    try {
      const imageUrl = await fetchMicrolinkThumbnail(data.url);
      if (imageUrl) {
        // Update the bookmark data with the new thumbnail URL
        const bookmarkIndex = bookmarks.findIndex(b => b.url === data.url && b.title === data.title);
        if (bookmarkIndex !== -1) {
          bookmarks[bookmarkIndex].thumbnailUrl = imageUrl;
          localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));
          
          // Find the corresponding card and update its image
          const items = document.querySelectorAll('.item');
          if (items[bookmarkIndex]) {
            const img = items[bookmarkIndex].querySelector('img');
            if (img) {
              img.src = imageUrl;
            }
          }
        }
      }
    } catch (error) {
      // Silently fail for background updates
    }
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, starting initialization...');
  
  // Wait a bit for everything to be ready
  setTimeout(() => {
    console.log('Initializing Isotope grid...');
    console.log('Isotope available:', typeof Isotope !== 'undefined');
    
    if (typeof Isotope !== 'undefined') {
      try {
        // Initialize the grid - DISABLED
        // grid = new Isotope('.bookmarks-grid', {
        //   itemSelector: '.item',
        //   layoutMode: 'masonry',
        //   masonry: {
        //     gutter: 20
        //   },
        //   percentPosition: true,
        //   transitionDuration: '0.3s'
        // });
        
        console.log('Grid initialized successfully, grid object:', !!grid);
        console.log('Grid element:', document.querySelector('.bookmarks-grid'));
        console.log('Grid sizer element:', document.querySelector('.grid-sizer'));
        
        // Handle window resize - DISABLED
        // window.addEventListener('resize', () => {
        //   if (grid) {
        //     grid.layout();
        //   }
        // });
        
        // Render bookmarks
        if (bookmarks.length > 0) {
          console.log('About to render bookmarks, grid state:', !!grid);
          renderAllCardsFast();
        } else {
          console.log('No bookmarks to render');
        }
        
      } catch (error) {
        console.error('Error initializing grid:', error);
        // Fallback: render without Isotope
        if (bookmarks.length > 0) {
          renderAllCardsFast();
        }
      }
    } else {
      console.error('Isotope not available - falling back to basic layout');
      // Fallback: render without Isotope using basic layout
      if (bookmarks.length > 0) {
        renderAllCardsFast();
      }
    }
  }, 500); // Wait longer for everything to be ready
});


// Open add-modal when "+" is clicked
document.querySelector('.add-bookmark-btn').addEventListener('click', function() {
  document.querySelector('.modal-overlay').classList.add('active');
  document.getElementById('add-modal').classList.add('active');
});

// Add close behavior for add-modal
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', function() {
    document.getElementById('add-modal').classList.remove('active');
    document.getElementById('details-modal').classList.remove('active');
    document.querySelector('.modal-overlay').classList.remove('active');
  });
});

// Also allow closing when clicking the blurred overlay
document.querySelector('.modal-overlay').addEventListener('click', function() {
  document.getElementById('add-modal').classList.remove('active');
  document.getElementById('details-modal').classList.remove('active');
  document.querySelector('.modal-overlay').classList.remove('active');
});

function extractDomain(url) {
  return url.replace(/^https?:\/\/([^\/?#]+).*$/, "$1");
}

function getYouTubeThumbnail(url) {
  // Extract video ID from YouTube URL
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (videoIdMatch) {
    const videoId = videoIdMatch[1];
    // Return high-quality YouTube thumbnail
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return null;
}

async function fetchMicrolinkThumbnail(url) {
  // Check if it's a YouTube URL first
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const youtubeThumbnail = getYouTubeThumbnail(url);
    if (youtubeThumbnail) {
      console.log('Using YouTube thumbnail:', youtubeThumbnail);
      return youtubeThumbnail;
    }
  }
  
  // Enhanced API call with more options for better thumbnails
  const api = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot&meta&video`;
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const res = await fetch(api, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    console.log('Microlink response:', data);
    
    // Try multiple image sources in order of preference
    return data.data?.image?.url || 
           data.data?.screenshot?.url || 
           data.data?.video?.thumbnail_url ||
           data.data?.logo?.url || "";
  } catch (e) {
    console.log('Microlink fetch failed:', e.message);
    return ""; // default/fallback if API fails
  }
}

function generateTitle(url, callback) {
  // Optional: Try to fetch actual title from the site (cross-origin issues),
  // else fallback to domain.
  fetch("https://corsproxy.io/?" + encodeURIComponent(url))
    .then(resp => resp.text())
    .then(html => {
      const match = html.match(/<title>([^<]+)<\/title>/i);
      if(match) callback(match[1]);
      else callback(extractDomain(url));
    }).catch(() => callback(extractDomain(url)));
}

// Separate visual card rendering logic
async function createCardElement({title, url, notes, tags}, index = null) {
  const item = document.createElement('div');
  item.className = 'item';
  
  // Use provided index or find current index
  const bookmarkIndex = index !== null ? index : bookmarks.indexOf({title, url, notes, tags});
  item.dataset.bookmarkIndex = bookmarkIndex;
  
  const card = document.createElement('div');
  card.className = 'card';
  
  // Show loader initially
  card.innerHTML = `
    <button class="delete-btn" title="Delete health resource">&times;</button>
    <div class="card-thumb-loader">
      <div class="loader"></div>
    </div>
    <hr class="card-divider"/>
    <div class="card-footer">
      <strong class="card-title">${title}</strong>
      <p class="card-url">${url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}</p>
    </div>
    ${notes ? `<div class="card-notes">${notes}</div>` : ''}
    ${tags ? `<div class="card-tags">${tags.split(',').map(t => `<span>${t.trim()}</span>`).join(' ')}</div>` : ''}
  `;
  
  // Add delete button handler
  const deleteBtn = card.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    deleteCard(bookmarkIndex);
  });
  
  // Fetch thumbnail and replace loader
  let imageUrl = await fetchMicrolinkThumbnail(url);
  if (!imageUrl) {
    imageUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=${url}`;
  }
  
  // Replace the loader with the actual image
  const loader = card.querySelector('.card-thumb-loader');
  loader.outerHTML = `<img src="${imageUrl}" alt="Thumbnail"/>`;
  
  card.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) return;
    
    // Fill modal with this card's info
    document.querySelector('.details-modal-title').textContent = title;
    document.querySelector('.details-modal-url').textContent = url;
    document.querySelector('.details-modal-notes').textContent = notes;
    document.querySelector('.details-modal-tags').textContent = tags;
    document.querySelector('.modal-overlay').classList.add('active');
    document.getElementById('details-modal').classList.add('active');
  });
  
  item.appendChild(card);
  return item;
}

function addCard({title, url, notes, tags}) {
  console.log('Adding card:', {title, url, notes, tags});
  console.log('Grid exists:', !!grid);
  
  // Save to localStorage with placeholder for thumbnail
  const newCard = {title, url, notes, tags, thumbnailUrl: null};
  bookmarks.unshift(newCard);
  localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));

  // 1. Create and insert card with loading spinner
  const cardEl = document.createElement('div');
  cardEl.className = 'item';
  cardEl.dataset.bookmarkIndex = 0; // New cards are always at index 0
  cardEl.innerHTML = `
    <div class="card">
      <button class="delete-btn" title="Delete health resource">&times;</button>
      <div class="card-thumb-loader"><div class="loader"></div></div>
      <hr class="card-divider"/>
      <div class="card-footer">
        <strong class="card-title">${title}</strong>
        <p class="card-url">${url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}</p>
      </div>
      ${notes ? `<div class="card-notes">${notes}</div>` : ''}
      ${tags ? `<div class="card-tags">${tags.split(',').map(t => `<span>${t.trim()}</span>`).join(' ')}</div>` : ''}
    </div>
  `;
  
  // Add delete button handler
  const deleteBtn = cardEl.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent card click event
    deleteCard(0); // New cards are always at index 0
  });
  
  // Add click handler for card (but not delete button)
  cardEl.addEventListener('click', function(e) {
    // Don't open modal if clicking delete button
    if (e.target.classList.contains('delete-btn')) return;
    
    document.querySelector('.details-modal-title').textContent = title;
    document.querySelector('.details-modal-url').textContent = url;
    document.querySelector('.details-modal-notes').textContent = notes;
    document.querySelector('.details-modal-tags').textContent = tags;
    document.querySelector('.modal-overlay').classList.add('active');
    document.getElementById('details-modal').classList.add('active');
  });
  
  console.log('Grid exists:', !!grid);
  if (grid) {
    console.log('Adding card to grid...');
    // Add to DOM first, then refresh Isotope - DISABLED
    const gridElement = document.querySelector('.bookmarks-grid');
    gridElement.insertBefore(cardEl, gridElement.firstChild);
    // grid.reloadItems();
    // grid.layout();
    console.log('Card added to grid and layout refreshed');
  } else {
    // Fallback: add directly to DOM if grid not ready
    console.log('Grid not ready, adding to DOM directly...');
    const gridElement = document.querySelector('.bookmarks-grid');
    gridElement.insertBefore(cardEl, gridElement.firstChild);
    console.log('Card added to DOM directly');
  }

  // 2. Fetch thumbnail with Microlink
  const thumbnailPromise = fetchMicrolinkThumbnail(url);
  
  // Fallback timeout - if no response in 15 seconds, use favicon
  const fallbackTimeout = setTimeout(() => {
    const thumbLoader = cardEl.querySelector('.card-thumb-loader');
    if (thumbLoader && thumbLoader.innerHTML.includes('loader')) {
      console.log('Thumbnail timeout, using favicon fallback');
      const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=${url}`;
      thumbLoader.innerHTML = `<img src="${faviconUrl}" alt="Thumbnail" />`;
    }
  }, 15000);
  
  thumbnailPromise
    .then(imageUrl => {
      clearTimeout(fallbackTimeout);
      if (!imageUrl) {
        imageUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=${url}`;
      }
      
      // Update the card display
      const thumbLoader = cardEl.querySelector('.card-thumb-loader');
      if (thumbLoader) {
        thumbLoader.innerHTML = `<img src="${imageUrl}" alt="Thumbnail" />`;
      }
      
      // Save the thumbnail URL to localStorage for future loads
      const bookmarkIndex = bookmarks.findIndex(b => b.url === url && b.title === title);
      if (bookmarkIndex !== -1) {
        bookmarks[bookmarkIndex].thumbnailUrl = imageUrl;
        localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));
      }
    })
    .catch(error => {
      clearTimeout(fallbackTimeout);
      console.log('Thumbnail fetch failed, using favicon:', error);
      const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=${url}`;
      
      const thumbLoader = cardEl.querySelector('.card-thumb-loader');
      if (thumbLoader) {
        thumbLoader.innerHTML = `<img src="${faviconUrl}" alt="Thumbnail" />`;
      }
      
      // Save favicon URL to localStorage as fallback
      const bookmarkIndex = bookmarks.findIndex(b => b.url === url && b.title === title);
      if (bookmarkIndex !== -1) {
        bookmarks[bookmarkIndex].thumbnailUrl = faviconUrl;
        localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));
      }
    });

  // 3. Immediately close modal after save
  document.getElementById('add-modal').classList.remove('active');
  document.querySelector('.modal-overlay').classList.remove('active');
}

function deleteCard(id) {
  // Find the bookmark by index
  const bookmarkIndex = parseInt(id);
  if (bookmarkIndex < 0 || bookmarkIndex >= bookmarks.length) return;
  
  // Store the deleted card for undo
  lastDeletedCard = {
    bookmark: bookmarks[bookmarkIndex],
    index: bookmarkIndex
  };
  
  // Find the actual DOM element by bookmark index data attribute
  const gridElement = document.querySelector('.bookmarks-grid');
  const itemToDelete = gridElement.querySelector(`[data-bookmark-index="${bookmarkIndex}"]`);
  
  if (itemToDelete) {
    // IMMEDIATELY remove from DOM (visual removal)
    itemToDelete.remove();
    
    // Update all remaining indices to account for the removed item
    updateBookmarkIndices();
    
    // If grid exists, refresh it to sync internal state - DISABLED
    // if (grid) {
    //   grid.reloadItems();
    //   grid.layout();
    // }
  }
  
  // Show undo button immediately
  showUndoButton();
  
  // Update data in background (non-blocking)
  setTimeout(() => {
    // Remove from bookmarks array
    bookmarks.splice(bookmarkIndex, 1);
    
    // Update localStorage
    localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));
  }, 0);
}

function undoDelete() {
  if (!lastDeletedCard) return;
  
  // IMMEDIATELY restore the bookmark to its original position
  bookmarks.splice(lastDeletedCard.index, 0, lastDeletedCard.bookmark);
  
  // Update localStorage
  localStorage.setItem('cure8_curated_content', JSON.stringify(bookmarks));
  
  // Create the restored card immediately
  const restoredCard = createRestoredCard(lastDeletedCard.bookmark, lastDeletedCard.index);
  
  // Add it back to the DOM at the correct position
  const gridElement = document.querySelector('.bookmarks-grid');
  
  // If it's the first item (index 0), add at the beginning
  if (lastDeletedCard.index === 0) {
    gridElement.insertBefore(restoredCard, gridElement.firstChild);
  } else {
    // Find the item that should come after this one
    const nextItem = gridElement.querySelector(`[data-bookmark-index="${lastDeletedCard.index}"]`);
    if (nextItem) {
      gridElement.insertBefore(restoredCard, nextItem);
    } else {
      // If no next item, append to end
      gridElement.appendChild(restoredCard);
    }
  }
  
  // Update all data-bookmark-index attributes to reflect new positions
  updateBookmarkIndices();
  
  // If grid exists, refresh it to sync internal state - DISABLED
  // if (grid) {
  //   grid.reloadItems();
  //   grid.layout();
  // }
  
  // Hide undo button
  hideUndoButton();
  
  // Clear the stored deleted card
  lastDeletedCard = null;
}

function updateBookmarkIndices() {
  // Update all data-bookmark-index attributes to match current array positions
  const gridElement = document.querySelector('.bookmarks-grid');
  const items = gridElement.querySelectorAll('.item');
  
  items.forEach((item, index) => {
    item.dataset.bookmarkIndex = index;
    
    // Also update the delete button's event listener to use the new index
    const deleteBtn = item.querySelector('.delete-btn');
    if (deleteBtn) {
      // Remove old event listeners and add new one with correct index
      deleteBtn.replaceWith(deleteBtn.cloneNode(true));
      const newDeleteBtn = item.querySelector('.delete-btn');
      newDeleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteCard(index);
      });
    }
  });
}

function createRestoredCard(data, index) {
  // Use cached thumbnail if available, otherwise use favicon
  const thumbnailUrl = data.thumbnailUrl || `https://www.google.com/s2/favicons?sz=128&domain_url=${data.url}`;
  const item = document.createElement('div');
  item.className = 'item';
  item.dataset.bookmarkIndex = index;
  
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <button class="delete-btn" title="Delete health resource">&times;</button>
    <img src="${thumbnailUrl}" alt="Thumbnail"/>
    <hr class="card-divider"/>
    <div class="card-footer">
      <strong class="card-title">${data.title}</strong>
      <p class="card-url">${data.url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}</p>
    </div>
    ${data.notes ? `<div class="card-notes">${data.notes}</div>` : ''}
    ${data.tags ? `<div class="card-tags">${data.tags.split(',').map(t => `<span>${t.trim()}</span>`).join(' ')}</div>` : ''}
  `;
  
  // Add delete button handler
  const deleteBtn = card.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    deleteCard(index);
  });
  
  // Add click handler for card
  card.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) return;
    
    document.querySelector('.details-modal-title').textContent = data.title;
    document.querySelector('.details-modal-url').textContent = data.url;
    document.querySelector('.details-modal-notes').textContent = data.notes;
    document.querySelector('.details-modal-tags').textContent = data.tags;
    document.querySelector('.modal-overlay').classList.add('active');
    document.getElementById('details-modal').classList.add('active');
  });
  
  item.appendChild(card);
  return item;
}

function showUndoButton() {
  // Create or show undo button
  let undoBtn = document.querySelector('.undo-btn');
  if (!undoBtn) {
    undoBtn = document.createElement('button');
    undoBtn.className = 'undo-btn';
    undoBtn.textContent = 'Undo Delete';
    undoBtn.addEventListener('click', undoDelete);
    document.body.appendChild(undoBtn);
  }
  undoBtn.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (lastDeletedCard) {
      hideUndoButton();
      lastDeletedCard = null;
    }
  }, 5000);
}

function hideUndoButton() {
  const undoBtn = document.querySelector('.undo-btn');
  if (undoBtn) {
    undoBtn.style.display = 'none';
  }
}

// Form submission handler
document.getElementById('add-bookmark-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const form = e.target;
  const url = form.querySelector('input[name="url"]').value;
  let title = form.querySelector('input[name="title"]').value.trim();
  const notes = form.querySelector('textarea[name="notes"]').value.trim();
  const tags = form.querySelector('input[name="tags"]').value.trim();

  // Title fallback (if blank)
  if (!title) {
    try {
      title = new URL(url).hostname.replace('www.','');
    } catch { title = url; }
  }

  addCard({ title, url, notes, tags });
  form.reset();
});

// Debug call to check curated content data
setTimeout(() => {
  debugCuratedContent();
}, 1000);