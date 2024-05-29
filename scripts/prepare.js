const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const axios = require('axios');

// Function to read all files from a directory
function readFilesFromDirectory(directory) {
  return fs.readdirSync(directory).filter(file => path.extname(file) === '.html');
}

// Function to extract styles from external CSS files
async function getExternalStyles(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching external stylesheet from ${url}: ${error.message}`);
    return '';
  }
}

// Function to extract HTML, text, and CSS from an HTML file
async function extractHtmlData(filePath) {
  const htmlContent = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(htmlContent);

  const htmlStructure = $('body').html();
  const textContent = $('body').text();
  
  let styles = '';
  $('style').each((i, elem) => {
    styles += $(elem).html();
  });

  const externalStyles = await Promise.all(
    $('link[rel="stylesheet"]').map(async (i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        return await getExternalStyles(href);
      }
      return '';
    }).get()
  );

  styles += externalStyles.join('');

  return { html: htmlStructure, text: textContent, css: styles };
}

// Main function to process all HTML files in a directory
async function processDirectory(directory) {
  const files = readFilesFromDirectory(directory);
  const results = [];

  for (const file of files) {
    const filePath = path.join(directory, file);
    const data = await extractHtmlData(filePath);
    results.push(data);
  }

  fs.writeFileSync('output.json', JSON.stringify(results, null, 2));
  console.log('Data extracted and saved to output.json');
}

// Replace 'your_directory_path' with the path to your directory containing HTML files
const directoryPath = './data/downloads';
processDirectory(directoryPath);
