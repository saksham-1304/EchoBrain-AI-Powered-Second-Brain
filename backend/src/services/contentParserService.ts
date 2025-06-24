import checkLinkType from "../utils/checkURLtype";
import { getYouTubeVideoDetails } from "../utils/linkType";
import { getTweetDetails } from "../utils/tweetParse";
import { getWebsiteMetadata } from "../utils/parseWebsiteData";

export interface ParsedContent {
    type: 'youtube' | 'tweet' | 'link';
    data: any;
}

export class ContentParserService {
    static async parseURL(url: string): Promise<ParsedContent | null> {
        try {
            const linkType = checkLinkType(url);
            console.log(`Parsing URL: ${url}, Type: ${linkType}`);
            
            let parsedData = null;
            
            switch (linkType) {
                case 'youtube':
                    parsedData = await getYouTubeVideoDetails(url);
                    break;
                case 'tweet':
                    parsedData = await getTweetDetails(url);
                    break;
                case 'link':
                    parsedData = await getWebsiteMetadata(url);
                    break;
                default:
                    console.warn(`Unknown link type: ${linkType}`);
                    return null;
            }

            if (!parsedData) {
                console.warn(`Failed to parse content for URL: ${url}`);
                return null;
            }

            return {
                type: linkType as 'youtube' | 'tweet' | 'link',
                data: parsedData
            };
        } catch (error) {
            console.error(`Error parsing URL ${url}:`, error);
            return null;
        }
    }

    static formatParsedContent(parsedContent: ParsedContent): string {
        try {
            switch (parsedContent.type) {
                case 'youtube':
                    const videoData = parsedContent.data.videoMetadata;
                    return `YouTube Video: ${videoData.title} by ${videoData.channelTitle}. Description: ${videoData.description?.substring(0, 200)}...`;
                
                case 'tweet':
                    return `Tweet by @${parsedContent.data.author.username}: ${parsedContent.data.text}`;
                
                case 'link':
                    return `Website: ${parsedContent.data.title}. Description: ${parsedContent.data.description}`;
                
                default:
                    return JSON.stringify(parsedContent.data);
            }
        } catch (error) {
            console.error('Error formatting parsed content:', error);
            return JSON.stringify(parsedContent.data);
        }
    }
}
