# EDI Order Removal Tool

A web-based tool for removing specific orders from EDI (Electronic Data Interchange) files before processing, with automated PPO rejection file generation.

## Overview

This application allows users to upload EDI files, analyze all orders within them, and selectively remove problematic orders before processing. The tool automatically generates PPO (Purchase Order Position) rejection files for order cancellation notifications and maintains proper EDI format with accurate record counts.

## Features

### Core Functionality
- **Web-based Interface**: Clean, responsive Bootstrap UI
- **File Upload**: Support for .txt EDI files via file picker
- **Automatic Analysis**: Instant file analysis upon upload
- **Real-time Processing**: Progress indicators and status updates
- **Proper EDI Format**: Maintains correct header and footer structure
- **Error Handling**: Validates file format and EDI structure
- **Reset Functionality**: Process multiple files without page refresh

### Order Management
- **Automatic Order Detection**: Scans file and displays all orders with statistics
- **Order Search**: Real-time search to filter orders by order number
- **Selective Removal**: Choose specific orders to remove via checkboxes
- **Bulk Operations**: Select all visible orders or individual selection
- **Clean File Generation**: Creates new file with selected orders removed
- **Updated Record Counts**: Automatically adjusts footer counts after removal

### PPO Rejection File Generation
- **Automatic PPO Creation**: Generates rejection files for removed orders
- **Industry Standard Format**: CSV format following PPO conventions
- **Configurable Rejection Details**: Customizable status codes and rejection reasons
- **Intelligent ISBN Extraction**: Automatically extracts ISBN numbers from EDI records
- **Timestamped Filenames**: Follows PPO.M{MMDDYYHHMM}.PPR naming convention
- **Dual Output**: Downloads both cleaned EDI file and PPO rejection file

## File Structure

```
edi-order-removal-tool/
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

### Basic Workflow
1. **Select File**: Click "Select EDI File" and choose a .txt file
2. **Automatic Analysis**: The tool automatically analyzes and displays all orders
3. **Search (Optional)**: Use the search box to filter orders by order number
4. **Configure Rejection**: Set rejection reason and status code
5. **Select Orders**: Check the boxes next to orders you want to remove
6. **Remove**: Click "Remove Selected Orders"
7. **Download**: Download both the cleaned EDI file and PPO rejection file

### Search and Filter
- Type in the search box to filter orders by order number
- Search updates in real-time as you type
- Only visible (filtered) orders are affected by "Select All"

### Bulk Selection
- Check the box in the table header to select all visible orders
- Useful when combined with search to select specific groups of orders

### Rejection Configuration
Choose from predefined status codes:
- **IR** - Item template not found
- **CO** - Item Cancelled
- **NF** - Not Found
- **OP** - Out of Print
- **OS** - Out of Stock

### Reset Options
- **Clear Button**: In header - resets entire application
- **Process Another File**: After results - ready for new file

## EDI File Requirements

The input file must follow this structure:

- **Header Line**: Must start with `$$HDR`
- **H1 Line**: First header record line
- **H2 Line**: Second header record line  
- **D1 Lines**: Detail record lines (these get filtered)
- **Footer Line**: Must start with `$$EOF`

### Example File Structure
```
$$HDRTFUK  0023602   20250827181254
H17000799574     20250827...
H27000799574     ST0071007687...
D17000799574     FT0818NM6KS     00001...
D17000799574     FT0818NM6KS     00002...
D17000799575     FT0818NM6KT     00001...
...
$$EOFTFUK  0023602   202508271812540001078
```

### Order Identification
Orders are identified by the order number immediately following "D1":
- From `D17000799574     FT0818NM6KS     00001...`
- The order number is `7000799574`
- All D1 lines with the same order number are grouped together

## Output Files

### Cleaned EDI File Output
The cleaned file contains:
- Complete original header ($$HDR, H1, H2 lines)
- All D1 records except those from removed orders
- Updated footer with correct record count reflecting removed records

**Filename format**: `{original_name}_cleaned.txt`

### PPO Rejection File Output
The PPO file contains:
- CSV format with columns: order_number, record_number, isbn, status_code, rejection_reason
- One row per removed D1 record
- Automatically extracted ISBN numbers
- Configurable status codes and rejection reasons

**Filename format**: `PPO.M{MMDDYYHHMM}.PPR` (timestamped)

### PPO File Example
```
7000775823,00001,9781032803104,IR,Item template not found
7000775823,00002,9781032010113,IR,Item template not found
7000775823,00003,9780367821258,IR,Item template not found
```

### Record Count Calculation
Footer count = Number of remaining D1 records + 2 (for H1 and H2 lines)

**Example**: If original file has 1078 D1 records and you remove 50:
- Cleaned file: 1028 D1 records + 2 headers = 1030 total

## PPO Rejection Configuration

### Status Codes
- **IR**: Item Rejected / Item template not found
- **CO**: Order Cancelled / Item Cancelled
- **NF**: Not Found
- **OP**: Out of Print
- **OS**: Out of Stock

### ISBN Extraction
The system automatically extracts ISBN numbers from D1 lines using pattern matching:
- **13-digit ISBNs**: Starting with 978 or 979
- **10-digit ISBNs**: Traditional format with check digit (X allowed)
- **Fallback**: Empty string if no valid ISBN pattern found

## Browser Compatibility

Requires a modern web browser with support for:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Browser APIs required:
- FileReader API
- Blob API
- ES6 Classes
- Async/Await

## Technical Details

### JavaScript Components

**EDIOrderRemovalTool Class**: Main application logic

#### Key Methods

**File Processing:**
- `readFileContent()`: Reads uploaded file content
- `analyzeFile()`: Scans file and identifies all orders
- `extractOrders()`: Groups D1 lines by order number

**Order Management:**
- `displayOrders()`: Shows orders in interactive table
- `filterOrders()`: Search functionality for order table
- `toggleAllOrders()`: Select/deselect all visible orders
- `updateRemoveButton()`: Updates button text with selection count

**File Generation:**
- `removeSelectedOrders()`: Filters out selected orders
- `updateFooterCount()`: Recalculates record counts after removal
- `generatePPOContent()`: Creates CSV content for rejection file
- `generatePPOFilename()`: Creates timestamped PPO filenames

**ISBN Processing:**
- `extractISBNFromLine()`: Intelligently extracts ISBN from EDI records

**Utility Methods:**
- `downloadFile()`: Handles file downloads
- `showStatus()`: Displays status messages
- `showProgress()`: Updates progress bar
- `reset()`: Clears interface for new file processing

## Error Handling

The application validates:
- File format (.txt extension required)
- EDI structure (presence of D1 records and required headers)
- Order extraction and grouping
- ISBN pattern recognition
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

### Order Removal Use Cases
- Removing problematic orders before import
- Excluding orders that need special handling
- Creating test files with specific order subsets
- Quality control and data cleanup
- Handling out-of-stock or discontinued items

### PPO File Use Cases
- Automated order cancellation notifications
- Supply chain communication
- Inventory management integration
- Customer service follow-up
- Audit trail for rejected orders

## Limitations

- Maximum file size depends on browser memory limits
- Large files (>100MB) may cause performance issues
- Only supports text-based EDI files
- Designed specifically for the EDI format structure shown
- Order identification relies on consistent D1 line formatting
- ISBN extraction uses pattern matching (may not catch all formats)

## Development

To modify or extend the application:

1. **HTML Changes**: Update `index.html` for UI modifications
2. **Logic Changes**: Modify `script.js` for processing logic
3. **Styling**: Bootstrap classes are used throughout - customize via CSS overrides

### Adding Features

Common extensions might include:
- Support for different EDI formats
- Batch processing of multiple files
- Preview of file contents before processing
- Export order analysis to CSV
- Order validation and duplicate detection
- Custom order identification patterns
- Additional PPO file formats
- Email integration for rejection notifications
- Advanced ISBN validation and formatting
- Order statistics and reporting
- Multiple status code selection per order

## Troubleshooting

**File won't upload**: Ensure file has .txt extension and contains valid EDI structure

**Processing fails**: Check that file contains D1 records and follows EDI format with required headers

**No orders found**: Verify D1 lines follow expected format with order numbers immediately after "D1"

**Downloads don't work**: Verify browser supports Blob downloads and check popup blockers

**Interface not responsive**: Ensure Bootstrap CSS is loading properly from CDN

**Search not working**: Clear search field and verify orders are displayed in table

**Footer count incorrect**: Check that H1 and H2 lines are present in original file

**PPO file empty**: Verify orders were selected and rejection file generation checkbox is enabled

**ISBN extraction issues**: Check D1 line format - ISBNs should follow standard 10 or 13 digit patterns

**Select All not working**: Select All only affects visible (non-filtered) orders

## Data Processing Flow

1. Parse EDI file structure
2. Group D1 records by order number
3. Display orders in interactive table with search capability
4. Filter out selected orders when Remove button is clicked
5. Generate PPO rejection file (if enabled)
6. Recalculate footer count based on remaining records
7. Generate cleaned EDI file
8. Prepare both files for download

### PPO Generation Flow
1. Extract removed order details
2. Parse D1 records for ISBN and record numbers
3. Apply configured rejection reason and status code
4. Generate CSV content with proper formatting
5. Create timestamped filename
6. Prepare file for download

## Version History

**v2.0** - Simplified single-purpose tool
- Removed split file functionality
- Focused solely on order removal
- Auto-analysis on file upload
- Streamlined user interface

**v1.0** - Initial dual-purpose tool
- Split and remove modes
- Manual mode switching
- Manual analysis trigger

## License

This project is provided as-is for educational and business use.

## Support

For issues, questions, or feature requests, please refer to the troubleshooting section above or review the code comments in `script.js` for implementation details.