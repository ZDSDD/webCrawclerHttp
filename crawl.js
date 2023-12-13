function normalizeURL(url) {
    try {
        const urlObj = new URL(url);
        return `${urlObj.host.normalize()}${urlObj.pathname.normalize()}`.replace(/\/+$/, '');
    } catch (error) {
        // Handle invalid URL
        console.error(`Invalid URL: ${url}`);
        return null;
    }
}

const {JSDOM} = require('jsdom')


function getURLsFromHTML(htmlBody, baseURL){
    const urls = []
    const dom = new JSDOM(htmlBody)
    const aElements = dom.window.document.querySelectorAll('a')
    for (const aElement of aElements){
        if (aElement.href.slice(0,1) === '/'){
            try {
                urls.push(new URL(aElement.href, baseURL).href)
            } catch (err){
                console.log(`${err.message}: ${aElement.href}`)
            }
        } else {
            try {
                urls.push(new URL(aElement.href).href)
            } catch (err){
                console.log(`${err.message}: ${aElement.href}`)
            }
        }
    }
    return urls
}

async function crawlPage2(currentURL) {
    fetch(currentURL)
        .then(response => {
            // Check for error-level status codes (400+)
            if (!response.ok) {
                console.error(`Error: HTTP status code ${response.status}`);
                return;
            }

            // Check if the Content-Type header is not text/html
            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('text/html')) {
                console.error('Error: Content-Type is not text/html');
                return;
            }

            // Return the HTML body as a string
            return response.text();
        })
        .then(html => {
            if (html) {
                // Print the HTML body
                console.log(html);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}
async function crawlPage(baseURL, currentURL, pages) {
    // Step 1: Ensure currentURL is on the same domain as the baseURL
    if (!currentURL.startsWith(baseURL)) {
        return pages; // Skip if not on the same domain
    }
    // Step 2: Get a normalized version of the currentURL
    const normalizedURL = normalizeURL(currentURL);

    // Step 3: Check if the pages object already has an entry for the normalized URL
    if (pages[normalizedURL]) {
        // Increment the count and return the current pages
        pages[normalizedURL]++;
        return pages;
    }

    // Step 4: Add an entry to the pages object for the normalized URL
    // Set the count to 1 if it's not the base URL, otherwise set it to 0
    pages[normalizedURL] = currentURL === baseURL ? 0 : 1;

    // Step 5: Make a request to the current URL and log the progress
    console.log(`Crawling: ${currentURL}, pages = ${pages[normalizedURL]}`);
    const response = await fetch(currentURL);

    // Assuming all went well with the fetch request
    if (response.ok) {
        // Step 6: Get all the URLs from the response body HTML
        const bodyHTML = await response.text();
        const foundURLs = getURLsFromHTML(bodyHTML,baseURL);

        // Step 7: Recursively crawl each URL found on the page and update the pages
        for (const furl of foundURLs) {
            pages = await crawlPage(baseURL, furl, pages);
        }
    }

    // Step 8: Return the updated pages object
    return pages;
}



module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
}
