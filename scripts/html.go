package main

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const (
	workerCount = 16 // Number of parallel workers
	outputDir   = "./data/downloads/"
)

func main() {
	start := time.Now()

	// Create the output directory if it doesn't exist
	if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
		fmt.Println("Error creating output directory:", err)
		return
	}

	// Open the file containing the URLs
	file, err := os.Open("./data/resolved_domains.txt")
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close()

	// Count the total number of lines (URLs)
	totalURLs := 0
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		totalURLs++
	}

	// Reset the file to the beginning
	file.Seek(0, 0)
	scanner = bufio.NewScanner(file)

	// Create a channel to pass URLs to workers
	urls := make(chan string, totalURLs)

	// WaitGroup to wait for all workers to finish
	var wg sync.WaitGroup

	// Start workers
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go worker(urls, &wg)
	}

	// Read URLs from the file and send them to the channel
	for scanner.Scan() {
		url := scanner.Text()
		if url != "" {
			if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
				url = "https://" + url
			}
			urls <- url
		}
	}

	// Close the channel after all URLs have been sent
	close(urls)

	// Wait for all workers to finish
	wg.Wait()

	// Check for errors during the file scanning
	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading file:", err)
	}

	elapsed := time.Since(start)
	fmt.Printf("Processed %d URLs in %s\n", totalURLs, elapsed)
}

func worker(urls <-chan string, wg *sync.WaitGroup) {
	defer wg.Done()

	for url := range urls {
		// Fetch the HTML page
		response, err := http.Get(url)
		if err != nil {
			fmt.Println("Error fetching URL:", err)
			continue
		}
		defer response.Body.Close()

		// Read the HTML content
		body, err := ioutil.ReadAll(response.Body)
		if err != nil {
			fmt.Println("Error reading response body:", err)
			continue
		}

		// Create a filename from the URL
		filename := strings.ReplaceAll(url, "https://", "")
		filename = strings.ReplaceAll(filename, "http://", "")
		filename = strings.ReplaceAll(filename, "/", "_") + ".html"
		filepath := filepath.Join(outputDir, filename)

		// Write the HTML content to a file
		err = ioutil.WriteFile(filepath, body, 0644)
		if err != nil {
			fmt.Println("Error writing to file:", err)
			continue
		}

		fmt.Println("Downloaded:", url, "to", filepath)
	}
}
