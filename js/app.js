document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadText = document.getElementById('upload-text');
    const previewContainer = document.getElementById('preview-container');
    const fileList = document.getElementById('file-list');
    const fileCount = document.getElementById('file-count');
    const convertBtn = document.getElementById('convert-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultsList = document.getElementById('results-list');
    const downloadAllBtn = document.getElementById('download-all-btn');

    // Store selected files
    let selectedFiles = [];
    let convertedFiles = [];

    // Event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('active');
    }

    function unhighlight() {
        dropArea.classList.remove('active');
    }

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle file input change
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Process the selected files
    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            return file.name.toLowerCase().endsWith('.heic');
        });

        if (validFiles.length === 0) {
            alert('Please select HEIC files only.');
            return;
        }

        // Add valid files to our array
        selectedFiles = [...selectedFiles, ...validFiles];
        updateFilePreview();
    }

    // Update the file preview section
    function updateFilePreview() {
        // Clear the list
        fileList.innerHTML = '';
        fileCount.textContent = selectedFiles.length;

        // Show the preview container if we have files
        if (selectedFiles.length > 0) {
            previewContainer.classList.remove('hidden');
        } else {
            previewContainer.classList.add('hidden');
        }

        // Create a preview for each file
        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            // Create file preview item
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedFiles.splice(index, 1);
                updateFilePreview();
            });
            
            // Add placeholder image (we can't preview HEIC directly)
            const img = document.createElement('img');
            img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23cccccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M20.4 14.5L16 10 4 20"/><path d="M16 20l4-4"/></svg>';
            
            // Add file name
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            
            // Assemble the file item
            fileItem.appendChild(removeBtn);
            fileItem.appendChild(img);
            fileItem.appendChild(fileName);
            
            // Add to the file list
            fileList.appendChild(fileItem);
        });
    }

    // Handle the convert button click
    convertBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;
        
        // Show loading state
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';
        fileList.classList.add('loading');
        
        // Clear previous results
        resultsList.innerHTML = '';
        convertedFiles = [];
        
        try {
            // Process each file
            for (const file of selectedFiles) {
                try {
                    // Convert HEIC to JPEG using heic2any
                    const jpegBlob = await heic2any({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.8
                    });
                    
                    // Create a new filename
                    const fileName = file.name.replace(/\.heic$/i, '.jpg');
                    
                    // Store the converted file
                    convertedFiles.push({
                        blob: jpegBlob,
                        name: fileName
                    });
                    
                    // Create a result item
                    const resultItem = document.createElement('div');
                    resultItem.className = 'result-item';
                    
                    // Create image preview
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(jpegBlob);
                    
                    // Create info container
                    const resultInfo = document.createElement('div');
                    resultInfo.className = 'result-info';
                    
                    // Add file name
                    const resultName = document.createElement('div');
                    resultName.className = 'result-name';
                    resultName.textContent = fileName;
                    
                    // Add download button
                    const downloadBtn = document.createElement('button');
                    downloadBtn.className = 'download-btn';
                    downloadBtn.textContent = 'Download';
                    downloadBtn.addEventListener('click', () => {
                        downloadFile(jpegBlob, fileName);
                    });
                    
                    // Assemble the result item
                    resultInfo.appendChild(resultName);
                    resultInfo.appendChild(downloadBtn);
                    resultItem.appendChild(img);
                    resultItem.appendChild(resultInfo);
                    
                    // Add to the results list
                    resultsList.appendChild(resultItem);
                } catch (error) {
                    console.error(`Error converting ${file.name}:`, error);
                }
            }
            
            // Show results container
            resultsContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Conversion error:', error);
            alert('An error occurred during conversion. Please try again.');
        } finally {
            // Reset loading state
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to JPEG';
            fileList.classList.remove('loading');
        }
    });

    // Handle download all button
    downloadAllBtn.addEventListener('click', () => {
        if (convertedFiles.length === 0) return;
        
        // If only one file, just download it directly
        if (convertedFiles.length === 1) {
            downloadFile(convertedFiles[0].blob, convertedFiles[0].name);
            return;
        }
        
        // For multiple files, create a zip (not implemented in this basic version)
        // We would need to add a library like JSZip for this functionality
        // For now, we'll just download them one by one
        convertedFiles.forEach(file => {
            downloadFile(file.blob, file.name);
        });
    });

    // Helper function to download a file
    function downloadFile(blob, fileName) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});