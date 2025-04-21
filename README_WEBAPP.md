# Top Research Papers Web Application

This web application displays top research papers from major AI/CV conferences and allows users to refresh the list with a click of a button without redeploying the entire website.

## Features

- Display of research papers with their titles, conferences, and years
- Filter papers by randomly selected topics
- One-click refresh to get a new batch of papers
- Fast performance through client-side processing

## How It Works

The application uses a hybrid approach:

1. During the GitHub Actions deployment:
   - The Python script `select_papers.py` generates an initial list of papers
   - All available papers are collected into a JSON file
   - A static HTML site is built with the initial paper list embedded

2. When a user clicks the "Get New Papers" button:
   - JavaScript loads the full paper database from the JSON file
   - It filters papers based on a randomly selected topic
   - The page is updated with the new paper selection without a full page reload

## Running Locally

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/top-papers.git
   cd top-papers
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the Flask development server:
   ```
   python app.py
   ```

4. Open your browser and navigate to `http://localhost:8080`

## Deployment

This project is configured to automatically deploy to GitHub Pages through GitHub Actions. The workflow:

1. Runs on:
   - Every push to the main branch
   - Once per week (Sunday at midnight UTC)
   - Manual triggering via the GitHub Actions interface

2. The deployment process:
   - Sets up Python
   - Installs dependencies
   - Generates an initial paper list
   - Creates a static site with embedded JavaScript for client-side paper filtering
   - Deploys the site to GitHub Pages

## Customization

You can customize this application by:

1. Modifying the list of topics in the GitHub Actions workflow script
2. Changing the number of papers displayed
3. Updating the CSS styling in `static/css/style.css`
4. Adding more paper sources to the `papers` directory

## License

This project is licensed under the terms specified in the LICENSE file. 