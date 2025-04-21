# Paper Selector

A tool to select academic papers based on topics from conferences like CVPR.

## How it Works

1. The `select_papers.py` script selects papers based on topics from the papers directory
2. A GitHub Pages site provides a user interface to view results
3. GitHub Actions can be used to run the script and update the results

## Setup Instructions

### Enable GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "GitHub Actions"

### Enable GitHub Actions

1. Go to the "Actions" tab in your repository
2. Click "I understand my workflows, go ahead and enable them"

### Running the Paper Selector

You can run the paper selector in three ways:

1. **Web Interface**: Visit your GitHub Pages site (usually `https://yourusername.github.io/your-repo-name/`) and use the interface. Note that the button in the web interface currently doesn't directly trigger the workflow due to GitHub API limitations.

2. **GitHub Actions UI**: 
   - Go to the "Actions" tab in your repository
   - Select the "Select Papers" workflow
   - Click "Run workflow"
   - Enter topics (comma-separated) and number of papers
   - Click "Run workflow"

3. **Manual Execution**:
   - Clone the repository
   - Run `python select_papers.py`

## Viewing Results

After running the script, two files are generated:
- `selected_papers.txt`: The list of selected papers
- `statistics.md`: Statistics about the paper distribution

These files can be viewed directly in the repository or through the web interface.

## Customization

- Modify `select_papers.py` to change the selection algorithm
- Update the GitHub Action workflow in `.github/workflows/select_papers.yml` to change how the script is run
- Edit `index.html` to customize the web interface 