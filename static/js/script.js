// API Configuration
const API_BASE = 'http://127.0.0.1:5000/api';

// DOM Elements
const assetForm = document.getElementById('assetForm');
const assetsContainer = document.getElementById('assetsContainer');
const loadingState = document.getElementById('loadingState');
const filterBtns = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeModalBtn = document.querySelector('.close-modal');
const cancelEditBtn = document.getElementById('cancelEdit');
const notificationContainer = document.getElementById('notificationContainer');

// State
let currentFilter = 'all';
let assets = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAssets();
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div class="notification-content">${message}</div>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Load assets from API
async function loadAssets() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/assets`);
        if (!response.ok) throw new Error('Failed to fetch assets');
        
        assets = await response.json();
        updateFilterCounts();
        displayAssets();
    } catch (error) {
        showNotification('Failed to load assets. Please try again.', 'error');
        assetsContainer.innerHTML = `
            <div class="no-assets">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load assets. Please refresh the page.</p>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

// Show/hide loading state
function showLoading(show) {
    if (show) {
        loadingState.style.display = 'block';
        assetsContainer.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
        assetsContainer.style.display = 'grid';
    }
}

// Update filter counts
function updateFilterCounts() {
    document.getElementById('allCount').textContent = assets.length;
    document.getElementById('availableCount').textContent = 
        assets.filter(a => a.status === 'Available').length;
    document.getElementById('assignedCount').textContent = 
        assets.filter(a => a.status === 'Assigned').length;
}

// Display assets based on filter
function displayAssets() {
    const filteredAssets = currentFilter === 'all' 
        ? assets 
        : assets.filter(asset => asset.status === currentFilter);

    if (filteredAssets.length === 0) {
        assetsContainer.innerHTML = `
            <div class="no-assets">
                <i class="fas fa-box-open"></i>
                <p>No ${currentFilter === 'all' ? '' : currentFilter} assets found.</p>
                ${currentFilter !== 'all' ? '<p>Try changing the filter or add new assets.</p>' : '<p>Click "Add Asset" to get started.</p>'}
            </div>
        `;
        return;
    }

    const assetsHTML = filteredAssets.map(asset => `
        <div class="asset-card" data-id="${asset.id}">
            <div class="asset-header">
                <span class="asset-id">#${asset.id}</span>
                <span class="status-badge ${asset.status.toLowerCase()}">
                    <i class="fas fa-${asset.status === 'Available' ? 'check' : 'user'}"></i>
                    ${asset.status}
                </span>
            </div>
            <h3 class="asset-name">${escapeHtml(asset.name)}</h3>
            <div class="asset-meta">
                <small><i class="far fa-calendar"></i> Added: ${formatDate(asset.created_at)}</small>
                ${asset.updated_at ? `
                    <small><i class="far fa-edit"></i> Updated: ${formatDate(asset.updated_at)}</small>
                ` : ''}
            </div>
            <div class="asset-footer">
                <button class="btn-icon edit" onclick="editAsset(${asset.id})">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="btn-icon delete" onclick="deleteAsset(${asset.id})">
                    <i class="fas fa-trash-alt"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');

    assetsContainer.innerHTML = assetsHTML;
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Helper: Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Add new asset
assetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = assetForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;

    const newAsset = {
        name: document.getElementById('assetName').value.trim(),
        status: document.getElementById('assetStatus').value
    };

    if (!newAsset.name) {
        showNotification('Please enter an asset name', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/assets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newAsset)
        });

        if (!response.ok) throw new Error('Failed to add asset');

        const createdAsset = await response.json();
        
        // Clear form
        assetForm.reset();
        
        // Update assets array
        assets.push(createdAsset);
        updateFilterCounts();
        displayAssets();
        
        showNotification('Asset added successfully!', 'success');
    } catch (error) {
        showNotification('Failed to add asset. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Edit asset
window.editAsset = async function(assetId) {
    try {
        const response = await fetch(`${API_BASE}/assets/${assetId}`);
        if (!response.ok) throw new Error('Failed to fetch asset');
        
        const asset = await response.json();
        
        document.getElementById('editAssetId').value = asset.id;
        document.getElementById('editAssetName').value = asset.name;
        document.getElementById('editAssetStatus').value = asset.status;
        
        editModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        showNotification('Failed to load asset details.', 'error');
    }
};

// Handle edit form submission
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = editForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    submitBtn.disabled = true;

    const assetId = document.getElementById('editAssetId').value;
    const updatedAsset = {
        name: document.getElementById('editAssetName').value.trim(),
        status: document.getElementById('editAssetStatus').value
    };

    if (!updatedAsset.name) {
        showNotification('Please enter an asset name', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/assets/${assetId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedAsset)
        });

        if (!response.ok) throw new Error('Failed to update asset');

        const updated = await response.json();
        
        // Update assets array
        const index = assets.findIndex(a => a.id === assetId);
        if (index !== -1) {
            assets[index] = updated;
        }
        
        updateFilterCounts();
        displayAssets();
        closeModal();
        
        showNotification('Asset updated successfully!', 'success');
    } catch (error) {
        showNotification('Failed to update asset.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Delete asset
window.deleteAsset = async function(assetId) {
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/assets/${assetId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete asset');

        // Remove from assets array
        assets = assets.filter(a => a.id !== assetId);
        
        updateFilterCounts();
        displayAssets();
        
        showNotification('Asset deleted successfully!', 'success');
    } catch (error) {
        showNotification('Failed to delete asset.', 'error');
    }
};

// Filter functionality
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.dataset.filter;
        displayAssets();
    });
});

// Modal close functions
function closeModal() {
    editModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    editForm.reset();
}

closeModalBtn.addEventListener('click', closeModal);
cancelEditBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editModal.style.display === 'block') {
        closeModal();
    }
});

// Prevent zoom on input focus for mobile
if (/Mobi|Android/i.test(navigator.userAgent)) {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            document.body.style.zoom = '1';
        });
    });
}