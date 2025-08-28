# EDI File Splitter Web Application

A web-based tool for splitting EDI (Electronic Data Interchange) order files into two equal parts while maintaining proper file structure and record counts.

## Overview

This application allows users to upload EDI files and split them into two separate files with equal numbers of detail records. The tool ensures that each output file maintains the correct EDI format with proper headers, footers, and accurate record counts.

## Features

- **Web-based Interface**: Clean, responsive Bootstrap UI
- **File Upload**: Support for .txt EDI files via file picker
- **Real-time Processing**: Progress indicators and status updates
- **Automatic Splitting**: Divides D1 detail records equally between two files
- **Proper EDI Format**: Maintains correct header and footer structure
- **Accurate Record Counts**: Footer counts include header lines plus detail records
- **Dual Downloads**: Download both split files separately
- **Error Handling**: Validates file format and EDI structure
- **Reset Functionality**: Process multiple files without page refresh

## File Structure

```
edi-file-splitter/
├── index.html          # Main HTML interface
├── script.js           # JavaScript processing logic
└── README.md          # This documentation
```

## Installation

1. Download or clone the project files
2. Place `index.html` and `script.js` in the same directory
3. Open `index.html` in a modern web browser

No server setup or additional dependencies required - runs entirely in the browser.

## Usage

1. **Select File**: Click "Select EDI File" and choose a .txt file
2. **Process**: Click "Split File" to begin processing
3. **Monitor Progress**: Watch the progress bar and status messages
4. **Download**: Click the download buttons for each split file
5. **Reset**: Use "Clear" button in header or "Process Another File" to start over

## EDI File Requirements

The input file must follow this structure:

- **Header Line**: Must start with `$$HDR`
- **H1 Line**: First header record line
- **H2 Line**: Second header record line  
- **D1 Lines**: Detail record lines (these get split)
- **Footer Line**: Must start with `$$EOF`

### Example File Structure
```
$$HDRTFUK  0023602   20250827181254
H17000799572     20250827...
H27000799572     ST0071007686...
D17000799572     FT0818NM6KS     00001...
D17000799572     FT0818NM6KS     00002...
...
$$EOFTFUK  0023602   202508271812540001078
```

## Output Files

Each split file contains:

- Complete original header ($$HDR, H1, H2 lines)
- Half of the original D1 detail records
- Updated footer with correct record count

### Record Count Calculation
Footer count = Number of D1 records + 2 (for H1 and H2 lines)

**Example**: If original file has 1078 D1 records:
- Part 1: 539 D1 records + 2 headers = 541 total
- Part 2: 539 D1 records + 2 headers = 541 total

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Requires support for:
- FileReader API
- Blob API
- ES6 Classes
- Async/Await

## Technical Details

### JavaScript Components

- **EDIFileSplitter Class**: Main application logic
- **File Reading**: Uses FileReader API to process uploaded files
- **Content Processing**: Identifies and splits D1 detail records
- **File Generation**: Creates properly formatted EDI output files
- **Download Management**: Uses Blob API for file downloads

### Key Methods

- `readFileContent()`: Reads uploaded file content
- `splitEDIFile()`: Processes and splits the EDI data  
- `generateEDIContent()`: Creates formatted output files
- `downloadFile()`: Handles file downloads
- `reset()`: Clears interface for new file processing

## Error Handling

The application validates:

- File format (.txt extension required)
- EDI structure (presence of D1 records)
- File reading errors
- Processing errors

Error messages are displayed with appropriate styling and icons.

## Security Notes

- All processing occurs client-side in the browser
- No data is uploaded to external servers
- Files are processed locally using JavaScript APIs
- Generated files are created in browser memory only

## Limitations

- Maximum file size depends on browser memory limits
- Large files (>100MB) may cause performance issues
- Only supports text-based EDI files
- Designed specifically for the EDI format structure shown

## Development

To modify or extend the application:

1. **HTML Changes**: Update `index.html` for UI modifications
2. **Logic Changes**: Modify `script.js` for processing logic
3. **Styling**: Bootstrap classes are used throughout - customize via CSS overrides

### Adding Features

Common extensions might include:
- Support for different EDI formats
- Configurable split ratios (other than 50/50)
- Batch processing of multiple files
- Preview of file contents before processing

## Troubleshooting

**File won't upload**: Ensure file has .txt extension

**Processing fails**: Check that file contains D1 records and follows EDI format

**Downloads don't work**: Verify browser supports Blob downloads and check popup blockers

**Interface not responsive**: Ensure Bootstrap CSS is loading properly

## License

This project is provided as-is for educational and business use.