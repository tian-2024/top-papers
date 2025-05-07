import os
import re

# import shutil # Uncomment this line if you want to overwrite the original file


def remove_technical_track_lines(input_filepath, output_filepath):
    """
    Reads an input file and writes to an output file, removing lines
    that contain "Technical Track".

    Args:
        input_filepath (str): The path to the input file.
        output_filepath (str): The path to the output file.
    """
    try:
        with open(input_filepath, "r", encoding="utf-8") as infile, open(
            output_filepath, "w", encoding="utf-8"
        ) as outfile:
            for line in infile:
                # Check if the line contains "Technical Track"
                if "Technical Track" not in line:
                    outfile.write(line)
        print("Lines containing 'Technical Track' removed successfully.")
        print(f"Output written to '{output_filepath}'")

    except FileNotFoundError:
        print(f"Error: Input file not found at {input_filepath}")
    except Exception as e:
        print(f"An error occurred: {e}")


def extract_titles_with_page_numbers(input_filepath, output_filepath):
    """
    Reads an input file and writes to an output file, keeping only title parts
    from lines that contain patterns like ". 3-11".

    Args:
        input_filepath (str): The path to the input file.
        output_filepath (str): The path to the output file.
    """
    try:
        pattern = r"\.\s+\d+-\d+"  # Pattern for ". 3-11" or similar
        
        with open(input_filepath, "r", encoding="utf-8") as infile, open(
            output_filepath, "w", encoding="utf-8"
        ) as outfile:
            for line in infile:
                # Check if the line contains the pattern (e.g., ". 3-11")
                if re.search(pattern, line):
                    # Remove the pattern and write only the title part
                    clean_line = re.sub(pattern, "", line).strip()
                    outfile.write(clean_line + "\n")
        
        print("Titles extracted successfully.")
        print(f"Output written to '{output_filepath}'")

    except FileNotFoundError:
        print(f"Error: Input file not found at {input_filepath}")
    except Exception as e:
        print(f"An error occurred: {e}")


# --- Configuration ---
input_file = "xx.md"  # Your input file path
output_file = "2023.txt"  # The desired output file path (changed name for clarity)

# --- Run the script ---
# remove_technical_track_lines(input_file, output_file)
extract_titles_with_page_numbers(input_file, output_file)