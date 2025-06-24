import axios from "axios";

const twitterBearerToken = process.env.TWEET_BEARER

const extractTweetID = (url: string): string | null => {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
};

export const getTweetDetails = async (tweetURL: string) => {
    try {
        console.log(`Processing Tweet URL: ${tweetURL}`);

        const tweetID = extractTweetID(tweetURL);
        if (!tweetID) {
            throw new Error("Invalid Twitter URL: Unable to extract tweet ID.");
        }

        console.log(`Extracted Tweet ID: ${tweetID}`);

        const twitterAPIURL = `https://api.twitter.com/2/tweets/${tweetID}`;
        console.log(`Calling Twitter API: ${twitterAPIURL}`);

        const response = await axios.get(twitterAPIURL, {
            headers: {
                Authorization: `Bearer ${twitterBearerToken}`
            },
            params: {
                expansions: "author_id",
                "tweet.fields": "created_at,text,public_metrics",
                "user.fields": "username,name"
            }
        });

        console.log("Raw API Response:", JSON.stringify(response.data, null, 2));

        const tweet = response.data?.data;
        const author = response.data?.includes?.users?.[0]; // Check if `includes` exists

        if (!tweet) {
            throw new Error("No tweet data found for the given ID.");
        }

        const tweetDetails = {
            text: tweet.text,
            createdAt: tweet.created_at,
            author: {
                id: author?.id || "Unknown",
                username: author?.username || "Unknown",
                name: author?.name || "Unknown",
            },
            metrics: tweet.public_metrics || {}
        };

        console.log("Parsed Tweet Details:", tweetDetails);

        return tweetDetails;
    } catch (error: any) {
        console.error("Error fetching tweet details:", error?.response?.data || error.message);
        return null;
    }
};
