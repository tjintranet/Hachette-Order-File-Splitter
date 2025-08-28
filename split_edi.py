import os
import glob

def split_edi_file(input_filename):
    """
    Split an EDI file into two equal parts based on detail records (D1 lines).
    Each output file retains the original header and gets its own footer.
    """
    # Read the input file
    with open(input_filename, 'r') as file:
        lines = file.readlines()
    
    # Extract header and footer lines from original file
    hdr_line = ""
    h1_line = ""
    h2_line = ""
    eof_line = ""
    detail_lines = []
    
    for line in lines:
        if line.startswith('$$HDR'):
            hdr_line = line
        elif line.startswith('H1'):
            h1_line = line
        elif line.startswith('H2'):
            h2_line = line
        elif line.startswith('D1'):
            detail_lines.append(line)
        elif line.startswith('$$EOF'):
            eof_line = line
    
    # Validate required lines exist
    if not hdr_line:
        print("ERROR: $$HDR line not found in file!")
        return
    if not h1_line:
        print("ERROR: H1 line not found in file!")
        return
    if not h2_line:
        print("ERROR: H2 line not found in file!")
        return
    if not eof_line:
        print("ERROR: $$EOF line not found in file!")
        return
    if not detail_lines:
        print("ERROR: No D1 detail lines found in file!")
        return
    
    print(f"Found {len(detail_lines)} detail records to split")
    
    # Calculate split point (middle of detail records)
    total_details = len(detail_lines)
    split_point = total_details // 2
    
    # Split detail lines into two parts
    part1_details = detail_lines[:split_point]
    part2_details = detail_lines[split_point:]
    
    print(f"Part 1: {len(part1_details)} records")
    print(f"Part 2: {len(part2_details)} records")
    
    # Generate output filenames
    base_name = os.path.splitext(input_filename)[0]
    extension = os.path.splitext(input_filename)[1]
    part1_filename = f"{base_name}_p1{extension}"
    part2_filename = f"{base_name}_p2{extension}"
    
    # Create part 1 file
    print(f"\nCreating {part1_filename}...")
    with open(part1_filename, 'w') as file:
        # Write original header lines
        file.write(hdr_line)
        file.write(h1_line)
        file.write(h2_line)
        
        # Write part 1 details
        file.writelines(part1_details)
        
        # Write updated footer (original footer base + new count)
        total_count_p1 = len(part1_details) + 2  # +2 for H1 and H2 lines
        eof_base = eof_line.rstrip('\n\r')[:-7]  # Remove last 7 digits and newline
        file.write(f"{eof_base}{total_count_p1:07d}\n")
    
    # Create part 2 file
    print(f"Creating {part2_filename}...")
    with open(part2_filename, 'w') as file:
        # Write original header lines
        file.write(hdr_line)
        file.write(h1_line)
        file.write(h2_line)
        
        # Write part 2 details
        file.writelines(part2_details)
        
        # Write updated footer (original footer base + new count)
        total_count_p2 = len(part2_details) + 2  # +2 for H1 and H2 lines
        eof_base = eof_line.rstrip('\n\r')[:-7]  # Remove last 7 digits and newline
        file.write(f"{eof_base}{total_count_p2:07d}\n")
    
    print(f"\nFiles created successfully:")
    print(f"- {part1_filename}: {len(part1_details)} detail records + 2 headers = {len(part1_details) + 2} total")
    print(f"- {part2_filename}: {len(part2_details)} detail records + 2 headers = {len(part2_details) + 2} total")
    
    # Verify the files were created correctly
    print(f"\nVerification:")
    with open(part1_filename, 'r') as f:
        first_line = f.readline().strip()
        print(f"Part 1 starts with: {first_line}")
    
    with open(part2_filename, 'r') as f:
        first_line = f.readline().strip()
        print(f"Part 2 starts with: {first_line}")

# Main execution
if __name__ == "__main__":
    # Get all .txt files in current directory
    txt_files = glob.glob("*.txt")
    
    print(f"Found {len(txt_files)} .txt files in directory:")
    for file in txt_files:
        print(f"  - {file}")
    
    if not txt_files:
        print("No .txt files found in current directory.")
    elif len(txt_files) == 1:
        # Process the single file
        input_file = txt_files[0]
        print(f"\nProcessing: {input_file}")
        try:
            split_edi_file(input_file)
        except Exception as e:
            print(f"Error processing file: {e}")
    else:
        # Multiple files - show menu
        print(f"\nSelect a file to process:")
        for i, file in enumerate(txt_files, 1):
            print(f"{i}. {file}")
        
        try:
            choice = input("\nEnter file number: ")
            file_index = int(choice) - 1
            
            if 0 <= file_index < len(txt_files):
                input_file = txt_files[file_index]
                print(f"\nProcessing: {input_file}")
                split_edi_file(input_file)
            else:
                print("Invalid selection.")
        except ValueError:
            print("Invalid input. Please enter a number.")
        except KeyboardInterrupt:
            print("\nOperation cancelled.")