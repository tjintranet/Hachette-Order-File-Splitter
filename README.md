# EDI File Manager Web Application

A web-based tool for managing EDI (Electronic Data Interchange) order files with dual functionality: splitting files into equal parts or removing specific orders before processing.

## Overview

This application allows users to upload EDI files and either split them into two separate files with equal numbers of detail records, or analyze and remove specific orders from the file. The tool ensures that each output file maintains the correct EDI format with proper headers, footers, and accurate record counts.

## Features

### Core Functionality
- **Web-based Interface**: Clean, responsive Bootstrap UI with dual operation modes
- **File Upload**: Support for .txt EDI files via file picker
- **Real-time Processing**: Progress indicators and status updates
- **Proper EDI Format**: Maintains correct header and footer structure
- **Error Handling**: Validates file format and EDI structure
- **Reset Functionality**: Process multiple files without page refresh

### Split Mode (Original)
- **Automatic Splitting**: Divides D1 detail records equally between two files
- **Accurate Record Counts**: Footer counts include header lines plus detail records
- **Dual Downloads**: Download both split files separately

### Remove Orders Mode (New)
- **Order Analysis**: Scans file and displays all orders with statistics
- **Order Search**: Real-time search to filter orders by order number
- **Selective Removal**: Choose specific orders to remove via checkboxes
- **Bulk Operations**: Select all visible orders or individual selection
- **Clean File Generation**: Creates new file with selected orders removed
- **Updated Record Counts**: Automatically adjusts footer counts after removal

## File Structure

```
edi-file-manager/
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

### Split Mode
1. **Select File**: Click "Select EDI File" and choose a .txt file
2. **Choose Split**: Select "Split File" operation mode
3. **Process**: Click "Split File into Two Parts" to begin processing
4. **Monitor Progress**: Watch the progress bar and status messages
5. **Download**: Click the download buttons for each split file

### Remove Orders Mode
1. **Select File**: Click "Select EDI File" and choose a .txt file
2. **Choose Remove**: Select "Remove Orders" operation mode
3. **Analyze**: Click "Analyze File & Show Orders" to scan the file
4. **Search**: Use the search box to filter orders (optional)
5. **Select**: Check the orders you want to remove
6. **Remove**: Click "Remove Selected Orders"
7. **Download**: Download the cleaned file with updated record counts

### Reset Options
- **Clear Button**: In header - resets entire application
- **Process Another File**: After results - ready for new file

## EDI File Requirements

The input file must follow this structure:

- **Header Line**: Must start with `$$HDR`
- **H1 Line**: First header record line
- **H2 Line**: Second header record line  
- **D1 Lines**: Detail record lines (these get split or filtered)
- **Footer Line**: Must start with `$$EOF`

### Example File Structure
```
$$HDRTFUK  0023602   20250827181254
H17000799574     20250827...
H27000799574     ST0071007687...
D17000799574     FT0818NM6KS     00001...
D17000799574     FT0818NM6KS     00002...
...
$$EOFTFUK  0023602   202508271812540001078
```

### Order Identification
Orders are identified by the order number immediately following "D1":
- From `D17000799574     FT0818NM6KS     00001...`
- The order number is `7000799574`
- All D1 lines with the same order number are grouped together

## Output Files

### Split Mode Output
Each split file contains:
- Complete original header ($$HDR, H1, H2 lines)
- Half of the original D1 detail records
- Updated footer with correct record count

### Remove Orders Mode Output
The cleaned file contains:
- Complete original header ($$HDR, H1, H2 lines)
- All D1 records except those from removed orders
- Updated footer with correct record count reflecting removed records

### Record Count Calculation
Footer count = Number of remaining D1 records + 2 (for H1 and H2 lines)

**Split Example**: If original file has 1078 D1 records:
- Part 1: 539 D1 records + 2 headers = 541 total
- Part 2: 539 D1 records + 2 headers = 541 total

**Remove Example**: If original file has 1078 D1 records and you remove 50:
- Cleaned file: 1028 D1 records + 2 headers = 1030 total

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

- **EDIFileManager Class**: Main application logic with dual operation modes
- **File Reading**: Uses FileReader API to process uploaded files
- **Content Processing**: Identifies and processes D1 detail records by order number
- **Order Analysis**: Extracts and groups orders for selective removal
- **File Generation**: Creates properly formatted EDI output files
- **Download Management**: Uses Blob API for file downloads

### Key Methods

#### Core Methods
- `readFileContent()`: Reads uploaded file content
- `switchMode()`: Toggles between split and remove operation modes
- `reset()`: Clears interface for new file processing

#### Split Mode Methods
- `splitEDIFile()`: Processes and splits the EDI data equally
- `generateEDIContent()`: Creates formatted split output files
- `generateSplitFiles()`: Prepares split files for download

#### Remove Orders Mode Methods
- `analyzeFile()`: Scans file and identifies all orders
- `extractOrders()`: Groups D1 lines by order number
- `displayOrders()`: Shows orders in interactive table
- `removeSelectedOrders()`: Filters out selected orders
- `updateFooterCount()`: Recalculates record counts after removal

#### Utility Methods
- `filterOrders()`: Search functionality for order table
- `toggleAllOrders()`: Select/deselect all visible orders
- `downloadFile()`: Handles file downloads for all modes

## Error Handling

The application validates:
- File format (.txt extension required)
- EDI structure (presence of D1 records and required headers)
- Order extraction and grouping
- File reading and processing errors
- Empty selection validation for remove operations

Error messages are displayed with appropriate styling and icons.

## Security Notes

- All processing occurs client-side in the browser
- No data is uploaded to external servers
- Files are processed locally using JavaScript APIs
- Generated files are created in browser memory only
- Original files remain unchanged

## Use Cases

### Split Mode Use Cases
- Breaking large EDI files into manageable chunks for processing
- Load balancing across multiple processing systems
- Meeting file size limits in downstream systems

### Remove Orders Mode Use Cases
- Removing problematic orders before import
- Excluding orders that need special handling
- Creating test files with specific order subsets
- Quality control and data cleanup

## Limitations

- Maximum file size depends on browser memory limits
- Large files (>100MB) may cause performance issues
- Only supports text-based EDI files
- Designed specifically for the EDI format structure shown
- Order identification relies on consistent D1 line formatting

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
- Export order analysis to CSV
- Order validation and duplicate detection
- Custom order identification patterns

## Troubleshooting

**File won't upload**: Ensure file has .txt extension and contains valid EDI structure

**Processing fails**: Check that file contains D1 records and follows EDI format with required headers

**No orders found**: Verify D1 lines follow expected format with order numbers immediately after "D1"

**Downloads don't work**: Verify browser supports Blob downloads and check popup blockers

**Interface not responsive**: Ensure Bootstrap CSS is loading properly

**Search not working**: Clear search field and verify orders are displayed in table

**Footer count incorrect**: Check that H1 and H2 lines are present in original file

## File Naming Conventions

- **Split files**: `{original_name}_p1.txt` and `{original_name}_p2.txt`
- **Cleaned files**: `{original_name}_cleaned.txt`

## Data Processing Flow

### Split Mode
1. Parse EDI file structure
2. Extract all D1 records
3. Calculate 50/50 split point
4. Generate two files with equal record distribution
5. Update footer counts for each file

### Remove Orders Mode
1. Parse EDI file structure
2. Group D1 records by order number
3. Display orders in interactive table
4. Filter out selected orders
5. Recalculate footer count
6. Generate cleaned file

## License

This project is provided as-is for educational and business use.