// Global variables
let currentUser = null;
let userFiles = [];
let userWebsites = [];

// DOM Elements
const username = document.getElementById('username');
const userAvatar = document.getElementById('userAvatar');
const displayName = document.getElementById('displayName');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filesList = document.getElementById('filesList');
const deploymentForm = document.getElementById('deploymentForm');
const websitesList = document.getElementById('websitesList');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const deploymentModal = document.getElementById('deploymentModal');
const modalDeploymentForm = document.getElementById('modalDeploymentForm');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    await loadUserData();
    setupEventListeners();
    await loadFiles();
    await loadWebsites();
    updateStats();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/';
            return;
        }
        
        currentUser = data.user;
        updateUserInterface();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/';
    }
}

// Update user interface with current user data
function updateUserInterface() {
    if (currentUser) {
        username.textContent = currentUser.username;
        displayName.textContent = currentUser.username;
        userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
    }
}

// Load user data
async function loadUserData() {
    // Additional user data can be loaded here
    console.log('Loading user data for:', currentUser?.username);
}

// Setup event listeners
function setupEventListeners() {
    // File upload area
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFileSelect({ target: { files: e.dataTransfer.files } });
    });
    
    // Deployment form
    deploymentForm.addEventListener('submit', handleDeployment);
    modalDeploymentForm.addEventListener('submit', handleModalDeployment);
    
    // Subdomain input listeners
    document.getElementById('subdomainName')?.addEventListener('input', updateSubdomainPreview);
    document.getElementById('domainSuffix')?.addEventListener('change', updateSubdomainPreview);
    document.getElementById('modalSubdomainName')?.addEventListener('input', updateModalSubdomainPreview);
    document.getElementById('modalDomainSuffix')?.addEventListener('change', updateModalSubdomainPreview);
    
    // Initialize subdomain previews
    updateSubdomainPreview();
    updateModalSubdomainPreview();
    
    // Logout
    document.querySelectorAll('a[href="/"]').forEach(link => {
        if (link.textContent.includes('Logout')) {
            link.addEventListener('click', handleLogout);
        }
    });
}

// Handle file selection
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        uploadFiles(files);
    }
}

// Upload files
async function uploadFiles(files) {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    
    // Show progress
    uploadProgress.classList.add('active');
    progressFill.style.width = '0%';
    
    try {
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            progressFill.style.width = progress + '%';
            if (progress >= 90) {
                clearInterval(progressInterval);
            }
        }, 200);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(`Successfully uploaded ${data.files.length} file(s)`, 'success');
            await loadFiles();
            updateStats();
            
            // Reset form
            fileInput.value = '';
            
            // Hide progress after delay
            setTimeout(() => {
                uploadProgress.classList.remove('active');
                progressFill.style.width = '0%';
            }, 1000);
        } else {
            showToast(data.error || 'Upload failed', 'error');
            uploadProgress.classList.remove('active');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed: ' + error.message, 'error');
        uploadProgress.classList.remove('active');
    }
}

// Load user files
async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const data = await response.json();
        
        if (response.ok) {
            userFiles = data;
            displayFiles();
        } else {
            showToast('Failed to load files', 'error');
        }
    } catch (error) {
        console.error('Error loading files:', error);
        showToast('Error loading files', 'error');
    }
}

// Display files in the UI
function displayFiles() {
    if (userFiles.length === 0) {
        filesList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No files uploaded yet</p>';
        return;
    }
    
    filesList.innerHTML = userFiles.map(file => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">${getFileIcon(file.mime_type)}</div>
                <div class="file-details">
                    <div class="file-name">${file.original_name}</div>
                    <div class="file-size">${formatFileSize(file.file_size)}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn-icon" onclick="downloadFile('${file.id}')" title="Download">
                    ⬇️
                </button>
                <button class="btn-icon" onclick="deleteFile('${file.id}')" title="Delete">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// Get file icon based on MIME type
function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    if (mimeType.includes('text') || mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('javascript')) return '📝';
    return '📎';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Download file
async function downloadFile(fileId) {
    try {
        const file = userFiles.find(f => f.id == fileId);
        if (!file) return;
        
        const link = document.createElement('a');
        link.href = file.file_path;
        link.download = file.original_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Download started', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed', 'error');
    }
}

// Delete file
async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('File deleted successfully', 'success');
            await loadFiles();
            updateStats();
        } else {
            showToast('Failed to delete file', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Delete failed', 'error');
    }
}

// Handle website deployment
async function handleDeployment(event) {
    event.preventDefault();
    
    const siteName = document.getElementById('siteName').value;
    const deploymentType = document.getElementById('deploymentType').value;
    const websiteFiles = document.getElementById('websiteFiles').files;
    
    let subdomain = null;
    let domain = null;
    
    if (deploymentType === 'subdomain') {
        subdomain = document.getElementById('subdomainName').value;
        const domainSuffix = document.getElementById('domainSuffix').value;
        
        if (!subdomain) {
            showToast('Please enter a subdomain name', 'error');
            return;
        }
        
        domain = `${subdomain}.${domainSuffix}`;
    } else {
        domain = document.getElementById('customDomain').value;
    }
    
    if (websiteFiles.length === 0) {
        showToast('Please select at least one file for your website', 'error');
        return;
    }
    
    await deployWebsite(siteName, domain, websiteFiles, subdomain);
}

// Handle modal deployment
async function handleModalDeployment(event) {
    event.preventDefault();
    
    const siteName = document.getElementById('modalSiteName').value;
    const deploymentType = document.getElementById('modalDeploymentType').value;
    const websiteFiles = document.getElementById('modalWebsiteFiles').files;
    
    let subdomain = null;
    let domain = null;
    
    if (deploymentType === 'subdomain') {
        subdomain = document.getElementById('modalSubdomainName').value;
        const domainSuffix = document.getElementById('modalDomainSuffix').value;
        
        if (!subdomain) {
            showToast('Please enter a subdomain name', 'error');
            return;
        }
        
        domain = `${subdomain}.${domainSuffix}`;
    } else {
        domain = document.getElementById('modalCustomDomain').value;
    }
    
    if (websiteFiles.length === 0) {
        showToast('Please select at least one file for your website', 'error');
        return;
    }
    
    await deployWebsite(siteName, domain, websiteFiles, subdomain);
    closeDeploymentModal();
}

// Toggle deployment options
function toggleDeploymentOptions() {
    const deploymentType = document.getElementById('deploymentType').value;
    const subdomainOptions = document.getElementById('subdomainOptions');
    const customDomainOptions = document.getElementById('customDomainOptions');
    
    if (deploymentType === 'subdomain') {
        subdomainOptions.style.display = 'block';
        customDomainOptions.style.display = 'none';
    } else {
        subdomainOptions.style.display = 'none';
        customDomainOptions.style.display = 'block';
    }
}

// Toggle modal deployment options
function toggleModalDeploymentOptions() {
    const deploymentType = document.getElementById('modalDeploymentType').value;
    const subdomainOptions = document.getElementById('modalSubdomainOptions');
    const customDomainOptions = document.getElementById('modalCustomDomainOptions');
    
    if (deploymentType === 'subdomain') {
        subdomainOptions.style.display = 'block';
        customDomainOptions.style.display = 'none';
    } else {
        subdomainOptions.style.display = 'none';
        customDomainOptions.style.display = 'block';
    }
}

// Update subdomain preview
function updateSubdomainPreview() {
    const subdomainName = document.getElementById('subdomainName').value || 'myportfolio';
    const domainSuffix = document.getElementById('domainSuffix').value;
    document.getElementById('subdomainPreview').textContent = `${subdomainName}.${domainSuffix}`;
}

// Update modal subdomain preview
function updateModalSubdomainPreview() {
    const subdomainName = document.getElementById('modalSubdomainName').value || 'myportfolio';
    const domainSuffix = document.getElementById('modalDomainSuffix').value;
    document.getElementById('modalSubdomainPreview').textContent = `${subdomainName}.${domainSuffix}`;
}

// Deploy website
async function deployWebsite(siteName, customDomain, files, subdomain = null) {
    const formData = new FormData();
    formData.append('siteName', siteName);
    if (customDomain) {
        formData.append('domain', customDomain);
    }
    if (subdomain) {
        formData.append('subdomain', subdomain);
    }
    
    Array.from(files).forEach(file => {
        formData.append('websiteFiles', file);
    });
    
    try {
        const response = await fetch('/api/deploy', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const fullUrl = data.website.url;
            const realDomain = data.website.domain;
            const message = subdomain 
                ? `Subdomain "${data.website.domain}" deployed successfully!`
                : `Website "${siteName}" deployed successfully!`;
            
            showToast(message, 'success');
            
            // Show subdomain information if applicable
            if (subdomain) {
                setTimeout(() => {
                    const realDomainUrl = `https://${realDomain}`;
                    const simulationUrl = fullUrl;
                    
                    showToast(`🌐 Real Domain: ${realDomainUrl} (requires DNS setup)`, 'info');
                    showToast(`🔗 Demo URL: ${simulationUrl} (available now)`, 'success');
                }, 2000);
            }
            
            // Reset forms
            deploymentForm.reset();
            modalDeploymentForm.reset();
            
            // Reset deployment type to default
            document.getElementById('deploymentType').value = 'subdomain';
            document.getElementById('modalDeploymentType').value = 'subdomain';
            toggleDeploymentOptions();
            toggleModalDeploymentOptions();
            
            // Reload websites
            await loadWebsites();
            updateStats();
            
            // Open demo site in new tab
            setTimeout(() => {
                window.open(fullUrl, '_blank');
            }, 3000);
        } else {
            showToast(data.error || 'Deployment failed', 'error');
        }
    } catch (error) {
        console.error('Deployment error:', error);
        showToast('Deployment failed: ' + error.message, 'error');
    }
}

// Load deployed websites
async function loadWebsites() {
    try {
        const response = await fetch('/api/websites');
        const data = await response.json();
        
        if (response.ok) {
            userWebsites = data;
            displayWebsites();
        } else {
            showToast('Failed to load websites', 'error');
        }
    } catch (error) {
        console.error('Error loading websites:', error);
        showToast('Error loading websites', 'error');
    }
}

// Display websites in the UI
function displayWebsites() {
    if (userWebsites.length === 0) {
        websitesList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No websites deployed yet</p>';
        return;
    }
    
    websitesList.innerHTML = userWebsites.map(website => {
        const isSubdomain = website.domain && (website.domain.includes('ntando.store') || website.domain.includes('ntando.cloud'));
        const simulationUrl = isSubdomain 
            ? `${window.location.origin}/subdomain/${website.domain.split('.')[0]}`
            : website.site_path;
        
        return `
            <div class="website-item">
                <div class="website-info">
                    <h4>${website.site_name}</h4>
                    ${isSubdomain ? `
                        <div style="margin-bottom: 0.5rem;">
                            <a href="https://${website.domain}" target="_blank" class="website-url" style="display: block; margin-bottom: 0.25rem;">
                                🌐 ${website.domain} (Real Domain)
                            </a>
                            <a href="${simulationUrl}" target="_blank" class="website-url" style="font-size: 0.875rem; color: #22d3ee;">
                                🔗 Demo Version (Available Now)
                            </a>
                        </div>
                        <p style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">
                            💡 Real domain requires DNS configuration
                        </p>
                    ` : `
                        <a href="${simulationUrl}" target="_blank" class="website-url">
                            ${website.domain || `${window.location.origin}/deployed/${website.user_id}/${website.site_name}`}
                        </a>
                    `}
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="status-badge status-active">${website.deployment_status}</span>
                    <button class="btn-icon" onclick="deleteWebsite('${website.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Delete website
async function deleteWebsite(websiteId) {
    if (!confirm('Are you sure you want to delete this website? This action cannot be undone.')) return;
    
    try {
        const response = await fetch(`/api/websites/${websiteId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Website deleted successfully', 'success');
            await loadWebsites();
            updateStats();
        } else {
            showToast('Failed to delete website', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Delete failed', 'error');
    }
}

// Update statistics
function updateStats() {
    // Update file count
    document.getElementById('totalFiles').textContent = userFiles.length;
    
    // Update website count
    document.getElementById('totalWebsites').textContent = userWebsites.length;
    
    // Calculate storage used
    const totalSize = userFiles.reduce((sum, file) => sum + (file.file_size || 0), 0);
    document.getElementById('storageUsed').textContent = formatFileSize(totalSize);
}

// Refresh files
async function refreshFiles() {
    await loadFiles();
    showToast('Files refreshed', 'success');
}

// Open deployment modal
function openDeploymentModal() {
    deploymentModal.classList.add('show');
}

// Close deployment modal
function closeDeploymentModal() {
    deploymentModal.classList.remove('show');
    modalDeploymentForm.reset();
}

// Handle logout
async function handleLogout(event) {
    event.preventDefault();
    
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/';
        } else {
            showToast('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === deploymentModal) {
        closeDeploymentModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDeploymentModal();
    }
});

// Auto-refresh every 30 seconds
setInterval(async () => {
    await loadFiles();
    await loadWebsites();
    updateStats();
}, 30000);