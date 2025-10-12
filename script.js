// EDI Order Removal Tool JavaScript
class EDIOrderRemovalTool {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.removeOrdersBtn = document.getElementById('removeOrdersBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.statusContainer = document.getElementById('statusContainer');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.downloadCleaned = document.getElementById('downloadCleaned');
        this.downloadRejection = document.getElementById('downloadRejection');
        this.resetBtn = document.getElementById('resetBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.cleanedInfo = document.getElementById('cleanedInfo');
        this.rejectionInfo = document.getElementById('rejectionInfo');
        this.orderAnalysis = document.getElementById('orderAnalysis');
        this.ordersTableBody = document.getElementById('ordersTableBody');
        this.orderSearch = document.getElementById('orderSearch');
        this.selectAllOrders = document.getElementById('selectAllOrders');
        this.statusCode = document.getElementById('statusCode');
        this.generateRejectionFile = document.getElementById('generateRejectionFile');
        this.rejectionDownloadSection = document.getElementById('rejectionDownloadSection');

        this.cleanedFile = null;
        this.rejectionFile = null;
        this.currentFileContent = null;
        this.currentFileName = null;
        this.orders = [];

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.fileInput.addEventListener('change', () => this.handleFileSelection());
        this.removeOrdersBtn.addEventListener('click', () => this.removeSelectedOrders());
        this.downloadCleaned.addEventListener('click', () => this.downloadFile('cleaned'));
        this.downloadRejection.addEventListener('click', () => this.downloadFile('rejection'));
        this.resetBtn.addEventListener('click', () => this.reset());
        this.clearBtn.addEventListener('click', () => this.reset());
        this.orderSearch.addEventListener('input', () => this.filterOrders());
        this.selectAllOrders.addEventListener('change', () => this.toggleAllOrders());
    }

    async handleFileSelection() {
        const file = this.fileInput.files[0];
        if (file) {
            if (file.name.toLowerCase().endsWith('.txt')) {
                this.currentFileName = file.name;
                try {
                    this.currentFileContent = await this.readFileContent(file);
                    this.showStatus('File loaded successfully: ' + file.name, 'success');
                    await this.analyzeFile();
                } catch (error) {
                    this.showStatus('Error reading file: ' + error.message, 'error');
                }
            } else {
                this.showStatus('Please select a .txt file', 'warning');
            }
        }
    }

    showStatus(message, type = 'info') {
        const alertClass = `alert alert-${type === 'error' ? 'danger' : type}`;
        const icon = type === 'error' ? 'fas fa-exclamation-triangle' : 
                    type === 'success' ? 'fas fa-check-circle' : 
                    type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
        
        this.statusContainer.innerHTML = `
            <div class="${alertClass} alert-dismissible fade show" role="alert">
                <i class="${icon} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    showProgress(percentage) {
        this.progressContainer.style.display = 'block';
        this.progressBar.style.width = percentage + '%';
        this.progressBar.setAttribute('aria-valuenow', percentage);
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
        this.progressBar.style.width = '0%';
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
        this.rejectionDownloadSection.style.display = 'none';
    }

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    async analyzeFile() {
        if (!this.currentFileContent) {
            this.showStatus('No file loaded', 'error');
            return;
        }

        try {
            this.showStatus('Analyzing file...', 'info');
            this.showProgress(25);

            const lines = this.currentFileContent.split(/\r?\n/);
            this.orders = this.extractOrders(lines);
            this.showProgress(75);

            if (this.orders.length === 0) {
                this.showStatus('No orders found in the file', 'warning');
                this.hideProgress();
                return;
            }

            this.displayOrders();
            this.orderAnalysis.style.display = 'block';
            this.showProgress(100);
            this.showStatus(`Analysis complete! Found ${this.orders.length} orders in the file.`, 'success');
            this.hideProgress();

        } catch (error) {
            this.showStatus('Error analyzing file: ' + error.message, 'error');
            this.hideProgress();
        }
    }

    extractOrders(lines) {
        const orders = new Map();

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('D1')) {
                const orderNumber = trimmedLine.substring(2).split(/\s+/)[0];
                if (orderNumber) {
                    const orderId = orderNumber;
                    
                    if (!orders.has(orderId)) {
                        orders.set(orderId, {
                            orderId: orderId,
                            lines: [],
                            recordCount: 0,
                            firstRecord: null,
                            lastRecord: null
                        });
                    }

                    const order = orders.get(orderId);
                    order.lines.push({
                        content: line,
                        lineNumber: index,
                        recordNumber: trimmedLine.split(/\s+/)[2] || '',
                        fullLine: trimmedLine
                    });
                    order.recordCount++;
                    
                    if (order.firstRecord === null) {
                        order.firstRecord = trimmedLine.split(/\s+/)[2] || '';
                    }
                    order.lastRecord = trimmedLine.split(/\s+/)[2] || '';
                }
            }
        });

        return Array.from(orders.values()).sort((a, b) => a.orderId.localeCompare(b.orderId));
    }

    displayOrders() {
        this.ordersTableBody.innerHTML = '';
        
        this.orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="form-check-input order-checkbox" data-order-id="${order.orderId}">
                </td>
                <td><code>${order.orderId}</code></td>
                <td><span class="badge bg-secondary">${order.recordCount}</span></td>
                <td><code>${order.firstRecord}</code></td>
                <td><code>${order.lastRecord}</code></td>
            `;
            this.ordersTableBody.appendChild(row);
        });

        document.querySelectorAll('.order-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateRemoveButton());
        });
    }

    filterOrders() {
        const searchTerm = this.orderSearch.value.toLowerCase();
        const rows = this.ordersTableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const orderId = row.querySelector('code').textContent.toLowerCase();
            if (orderId.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    toggleAllOrders() {
        const selectAll = this.selectAllOrders.checked;
        const visibleCheckboxes = Array.from(document.querySelectorAll('.order-checkbox'))
            .filter(cb => cb.closest('tr').style.display !== 'none');
        
        visibleCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
        
        this.updateRemoveButton();
    }

    updateRemoveButton() {
        const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
        this.removeOrdersBtn.disabled = checkedBoxes.length === 0;
        
        if (checkedBoxes.length > 0) {
            this.removeOrdersBtn.innerHTML = `
                <i class="fas fa-minus-circle me-2"></i>Remove ${checkedBoxes.length} Selected Order${checkedBoxes.length !== 1 ? 's' : ''}
            `;
        } else {
            this.removeOrdersBtn.innerHTML = `
                <i class="fas fa-minus-circle me-2"></i>Remove Selected Orders
            `;
        }
    }

    generatePPOFilename() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        
        return `PPO.M${month}${day}${year}${hour}${minute}.PPR`;
    }

    extractISBNFromLine(line) {
        const parts = line.split(/\s+/);
        
        for (const part of parts) {
            if (/^97[89]\d{10}$/.test(part)) {
                return part;
            }
        }
        
        for (const part of parts) {
            if (/^\d{9}[\dX]$/.test(part)) {
                return part;
            }
        }
        
        return '';
    }

    generatePPOContent(removedOrders) {
        const statusCode = this.statusCode.value || 'IR';
        const statusDescriptions = {
            'IR': 'Item template not found',
            'CO': 'Item Cancelled',
            'NF': 'Not Found',
            'OP': 'Out of Print',
            'OS': 'Out of Stock'
        };
        const rejectionReason = statusDescriptions[statusCode] || statusCode;
        
        let csvContent = '';
        
        removedOrders.forEach(order => {
            order.lines.forEach(lineData => {
                const isbn = this.extractISBNFromLine(lineData.fullLine);
                const recordNumber = lineData.recordNumber || '00001';
                
                csvContent += `${order.orderId},${recordNumber},${isbn},${statusCode},${rejectionReason}\n`;
            });
        });
        
        return csvContent;
    }

    async removeSelectedOrders() {
        const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
        if (checkedBoxes.length === 0) return;

        const orderIdsToRemove = Array.from(checkedBoxes).map(cb => cb.dataset.orderId);
        const removedOrders = this.orders.filter(order => orderIdsToRemove.includes(order.orderId));
        
        try {
            this.showStatus('Removing selected orders...', 'info');
            this.showProgress(25);

            const lines = this.currentFileContent.split(/\r?\n/);
            const cleanedLines = [];
            let removedCount = 0;

            this.showProgress(50);

            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('D1')) {
                    const orderNumber = trimmedLine.substring(2).split(/\s+/)[0];
                    
                    if (!orderIdsToRemove.includes(orderNumber)) {
                        cleanedLines.push(line);
                    } else {
                        removedCount++;
                    }
                } else {
                    cleanedLines.push(line);
                }
            });

            this.showProgress(75);

            const newContent = this.updateFooterCount(cleanedLines);
            
            this.cleanedFile = {
                blob: new Blob([newContent], { type: 'text/plain' }),
                filename: this.currentFileName.replace(/\.txt$/i, '') + '_cleaned.txt'
            };

            if (this.generateRejectionFile.checked) {
                const ppoContent = this.generatePPOContent(removedOrders);
                this.rejectionFile = {
                    blob: new Blob([ppoContent], { type: 'text/plain' }),
                    filename: this.generatePPOFilename()
                };
                this.rejectionDownloadSection.style.display = 'block';
                this.rejectionInfo.textContent = `${removedOrders.length} orders, ${removedCount} records`;
            }

            this.showProgress(100);
            this.showStatus(`Successfully removed ${orderIdsToRemove.length} orders (${removedCount} records total)`, 'success');
            this.showCleanedResults(removedCount);
            this.hideProgress();

        } catch (error) {
            this.showStatus('Error removing orders: ' + error.message, 'error');
            this.hideProgress();
        }
    }

    updateFooterCount(lines) {
        const nonEmptyLines = lines.filter(line => line.trim() !== '');
        const totalLineCount = nonEmptyLines.length - 1;
        const importCount = totalLineCount - 1;

        const updatedLines = lines.map(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('$$EOF')) {
                const eofBase = line.substring(0, line.length - 7);
                return `${eofBase}${importCount.toString().padStart(7, '0')}`;
            }
            return line;
        });

        return updatedLines.join('\n');
    }

    showCleanedResults(removedRecordCount) {
        this.cleanedInfo.textContent = `${removedRecordCount} records removed`;
        this.resultsContainer.style.display = 'block';
    }

    downloadFile(type) {
        let fileData;
        
        if (type === 'cleaned') {
            fileData = this.cleanedFile;
        } else if (type === 'rejection') {
            fileData = this.rejectionFile;
        }
        
        if (!fileData) {
            this.showStatus('File not ready for download', 'error');
            return;
        }

        const url = URL.createObjectURL(fileData.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showStatus(`Downloaded: ${fileData.filename}`, 'success');
    }

    reset() {
        this.fileInput.value = '';
        
        this.orderAnalysis.style.display = 'none';
        this.hideResults();
        this.hideProgress();
        
        this.statusContainer.innerHTML = '';
        
        this.cleanedFile = null;
        this.rejectionFile = null;
        this.currentFileContent = null;
        this.currentFileName = null;
        this.orders = [];
        this.ordersTableBody.innerHTML = '';
        this.orderSearch.value = '';
        this.selectAllOrders.checked = false;
        this.statusCode.value = 'IR';
        this.generateRejectionFile.checked = true;
        
        this.showStatus('Ready to process a new file', 'info');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EDIOrderRemovalTool();
});