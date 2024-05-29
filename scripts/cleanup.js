const fs = require('fs');

// Function to clean up text
function cleanText(text) {
    // Remove double spaces and replace with a single space
    text = text.replace(/\s\s+/g, ' ');
    // Remove newlines, tab characters, and other unwanted characters
    text = text.replace(/[\n\t\r]+/g, ' ');
    // Remove non-UTF8 characters
    text = text.replace(/[^\x00-\x7F]/g, '');
    return text;
}

// Function to process the JSON data
function processJsonData(jsonData) {
    return jsonData.map(entry => {
        return {
            text: cleanText(entry.text),
            html: cleanText(entry.html),
            css: cleanText(entry.css)
        };
    });
}

// Read the JSON file
const inputFilePath = 'output.json';
const outputFilePath = 'clean.json';

fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading file: ${err}`);
        return;
    }

    try {
        const jsonData = JSON.parse(data);
        const processedData = processJsonData(jsonData);

        // Write the cleaned data to a new file
        fs.writeFile(outputFilePath, JSON.stringify(processedData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
            } else {
                console.log(`Processed data saved to ${outputFilePath}`);
            }
        });
    } catch (e) {
        console.error(`Error processing JSON data: ${e}`);
    }
});
