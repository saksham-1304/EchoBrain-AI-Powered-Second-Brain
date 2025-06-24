import { google, youtube_v3 } from "googleapis";

const youtubeURLtoID=(url:string)=>{
    const urlObj = new URL(url);
    let videoId;

    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
        videoId = urlObj.searchParams.get('v');
    }
    else if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1); // Remove leading '/'
    }
    else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1];
    }

    if (videoId && videoId.length === 11) {
        return videoId;
    } else {
        return null
    }
}
export const getYouTubeVideoDetails = async (videoLink: string) => {
    const videoId= youtubeURLtoID(videoLink)

    if(videoId === null){
        console.log("Invalid Video Link")
        return
    }
    try {
        const youtube = google.youtube({
            version: "v3",
            auth: process.env.YT_API, // Replace with your API Key
        });

        // Get the video details
        //@ts-ignore
        const response = await youtube.videos.list({
            part: ["snippet"], // Specify parts as an array of strings
            id: videoId,
        });

        // Check if the response contains valid data
        //@ts-ignore
        const items = response.data.items;
        if (items && items.length > 0) {
            const videoDetails = items[0].snippet;
            const videoMetadata = {
                title: videoDetails?.title || "No Title",
                description: videoDetails?.description || "No Description",
                publishedAt: videoDetails?.publishedAt || "No Publish Date",
                channelTitle: videoDetails?.channelTitle || "No Channel Title",
            };

            console.log(videoMetadata);
            return {videoMetadata};
        } else {
            console.error("Video not found.");
        }
    } catch (error) {
        console.error("Error fetching video details:", error);
    }
};


