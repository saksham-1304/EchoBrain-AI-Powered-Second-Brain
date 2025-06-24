import puppeteer from 'puppeteer';

export async function getWebsiteMetadata(url: string) {
    try {
        const browser = await puppeteer.launch({ headless: true }); // Launch headless browser
        const page = await browser.newPage();
        
        // Wait until the page content is loaded
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Extract metadata from the website
        const metadata = await page.evaluate((url: string) => {
            const title = document.querySelector("title")?.textContent || "No title found";
            const description = document.querySelector("meta[name='description']")?.getAttribute("content") || 
                                document.querySelector("meta[property='og:description']")?.getAttribute("content") || "No description found";
            const keywords = document.querySelector("meta[name='keywords']")?.getAttribute("content") || "No keywords found";
            const ogImage = document.querySelector("meta[property='og:image']")?.getAttribute("content") || "No image found";
            const canonicalURL = document.querySelector("link[rel='canonical']")?.getAttribute("href") || url;
            const favicon = document.querySelector("link[rel='icon']")?.getAttribute("href") || "No favicon found";
            const publishedDate = document.querySelector("meta[property='article:published_time']")?.getAttribute("content") || "No published date found";
            const author = document.querySelector("meta[name='author']")?.getAttribute("content") || "No author found";
            const pageType = document.querySelector("meta[property='og:type']")?.getAttribute("content") || "No type found";

            // Extract the first paragraph or main content snippet
            const mainContentSnippet = document.querySelector("p")?.textContent?.trim() || "No main content available";

            return {
                title,
                description,
                keywords,
                ogImage,
                canonicalURL,
                favicon,
                publishedDate,
                author,
                pageType,
                mainContentSnippet,
            };
        }, url); // Pass the `url` here as a parameter

        await browser.close(); // Close the browser

        return metadata; // Return the extracted metadata
    } catch (error) {
        console.error("Error fetching website metadata:", error);
        return null;
    }
}
