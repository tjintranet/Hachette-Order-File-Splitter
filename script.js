// EDI File Splitter JavaScript
class EDIFileSplitter {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.processBtn = document.getElementById('processBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.statusContainer = document.getElementById('statusContainer');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.downloadPart1 = document.getElementById('downloadPart1');
        this.downloadPart2 = document.getElementById('downloadPart2');
        this.resetBtn = document.getElementById('resetBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.part1Info = document.getElementById('part1Info');
        this.part2Info = document.getElementById('part2Info');

        this.splitFiles = {
            part1: null,
            part2: null
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.fileInput.addEventListener('change', () => this.handleFileSelection());
        this.processBtn.addEventListener('click', () => this.processFile());
        this.downloadPart1.addEventListener('click', () => this.downloadFile('part1'));
        this.downloadPart2.addEventListener('click', () => this.downloadFile('part2'));
        this.resetBtn.addEventListener('click', () => this.reset());
        this.clearBtn.addEventListener('click', () => this.reset());
    }

    handleFileSelection() {
        const file = this.fileInput.files[0];
        if (file) {
            if (file.name.toLowerCase().endsWith('.txt')) {
                this.processBtn.disabled = false;
                this.showStatus('File selected: ' + file.name, 'success');
            } else {
                this.showStatus('Please select a .txt file', 'warning');
                this.processBtn.disabled = true;
            }
        } else {
            this.processBtn.disabled = true;
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

    async processFile() {
        const file = this.fileInput.files[0];
        if (!file) {
            this.showStatus('Please select a file first', 'error');
            return;
        }

        this.processBtn.disabled = true;
        this.resultsContainer.style.display = 'none';
        
        try {
            this.showStatus('Reading file...', 'info');
            this.showProgress(10);

            const fileContent = await this.readFileContent(file);
            this.showProgress(30);

            this.showStatus('Processing EDI file...', 'info');
            const result = this.splitEDIFile(fileContent, file.name);
            this.showProgress(70);

            this.showStatus('Generating download files...', 'info');
            this.generateDownloadFiles(result.part1Content, result.part2Content, file.name);
            this.showProgress(100);

            this.showStatus(`File split successfully! Part 1: ${result.part1Count} records, Part 2: ${result.part2Count} records`, 'success');
            this.hideProgress();
            this.showResults(result.part1Count, result.part2Count);

        } catch (error) {
            this.showStatus('Error processing file: ' + error.message, 'error');
            this.hideProgress();
            console.error('Processing error:', error);
        }

        this.processBtn.disabled = false;
    }

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    splitEDIFile(content, originalFilename) {
        const lines = content.split(/\r?\n/);
        
        // Find detail lines (D1 records)
        const detailLines = lines.filter(line => line.startsWith('D1'));
        
        if (detailLines.length === 0) {
            throw new Error('No D1 detail records found in the file');
        }

        // Calculate split point
        const totalDetails = detailLines.length;
        const splitPoint = Math.floor(totalDetails / 2);
        
        const part1Details = detailLines.slice(0, splitPoint);
        const part2Details = detailLines.slice(splitPoint);

        // Generate file contents
        const part1Content = this.generateEDIContent(part1Details);
        const part2Content = this.generateEDIContent(part2Details);

        return {
            part1Content,
            part2Content,
            part1Count: part1Details.length + 2, // +2 for H1 and H2 lines
            part2Count: part2Details.length + 2, // +2 for H1 and H2 lines
            originalFilename
        };
    }

    generateEDIContent(detailLines) {
        const totalCount = detailLines.length + 2; // +2 for H1 and H2 header lines
        
        let content = '';
        
        // Add header lines
        content += '$$HDRTFUK  0023602   20250827181254\n';
        content += 'H17000799572     20250827                              C FT0818NM6KS                        STANDARD N                              000000000000000000000000000000000000000000000000000000000      TFUK_7000799572.pdf                       GBP                                                                                                              \n';
        content += 'H27000799572     ST0071007686               Forward Transit                                   Portcentric House                                  Mike Sibley PO FT0818NM6KS                       Thurrock Park Way                                 APecommerce@FARCORNERINC.COM                      TILBURY                         RM18 7HD GBR410-423-0870        \n';
        
        // Add detail lines
        detailLines.forEach(line => {
            content += line + '\n';
        });
        
        // Add footer with correct count
        content += `$$EOFTFUK  0023602   20250827181254${totalCount.toString().padStart(7, '0')}\n`;
        
        return content;
    }

    generateDownloadFiles(part1Content, part2Content, originalFilename) {
        const baseName = originalFilename.replace(/\.txt$/i, '');
        
        // Create blobs for download
        this.splitFiles.part1 = {
            blob: new Blob([part1Content], { type: 'text/plain' }),
            filename: `${baseName}_p1.txt`
        };
        
        this.splitFiles.part2 = {
            blob: new Blob([part2Content], { type: 'text/plain' }),
            filename: `${baseName}_p2.txt`
        };
    }

    showResults(part1Count, part2Count) {
        this.part1Info.textContent = `${part1Count} total lines`;
        this.part2Info.textContent = `${part2Count} total lines`;
        this.resultsContainer.style.display = 'block';
    }

    downloadFile(part) {
        const fileData = this.splitFiles[part];
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
        // Reset form
        this.fileInput.value = '';
        this.processBtn.disabled = true;
        
        // Hide sections
        this.resultsContainer.style.display = 'none';
        this.hideProgress();
        
        // Clear status
        this.statusContainer.innerHTML = '';
        
        // Clear file data
        this.splitFiles = {
            part1: null,
            part2: null
        };
        
        this.showStatus('Ready to process a new file', 'info');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EDIFileSplitter();
});