const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3/';

async function handleApiError(response) {
    const errorData = await response.json();
    const errorMessage = errorData.error?.message || `Request failed with status ${response.status}`;
    throw new Error(`YouTube API Error: ${errorMessage}`);
}

async function readAllYoutubeComments(apiKey, videoId, maxResults = 20) {
    const url = `${YOUTUBE_API_BASE_URL}commentThreads?part=snippet,replies&videoId=${videoId}&key=${apiKey}&maxResults=${maxResults}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            await handleApiError(response);
        }
        console.log('Successfully fetched comments.');
        const jsonData = await response.json();
        return processYoutubeCommentsJSON(jsonData);

    } catch (error) {
        console.error('Failed to read comments:', error);
        throw error;
    }
}

function processYoutubeCommentsJSON(jsonData) {
    if (!jsonData || !jsonData.items) {
        console.error('Invalid JSON data:', jsonData);
        return [];
    }
    const comments = jsonData.items.map(item => {
        const snippet = item.snippet.topLevelComment.snippet;
        return {
            id: item.id,
            author: snippet.authorDisplayName,
            text: snippet.textDisplay,
        };
    });

    if (jsonData.items.some(item => item.replies)) {
        jsonData.items.forEach(item => {
            if (item.replies && item.replies.comments) {
                item.replies.comments.forEach(reply => {
                    const snippet = reply.snippet;
                    comments.push({
                        id: reply.id,
                        author: snippet.authorDisplayName,
                        text: snippet.textDisplay,
                    });
                });
            }
        });
    }
    return comments;
}

async function postSingleYoutubeComment(authToken, videoId, commentText) {
    const url = `${YOUTUBE_API_BASE_URL}commentThreads?part=snippet`;

    const requestBody = {
        snippet: {
            videoId: videoId,
            topLevelComment: {
                snippet: {
                    textOriginal: commentText,
                },
            },
        },
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
        console.log('Successfully posted new comment.');
        return await response.json();
    } catch (error) {
        console.error('Failed to post comment:', error);
        throw error;
    }
}

async function deleteYoutubeComment(authToken, commentId) {
    const url = `${YOUTUBE_API_BASE_URL}comments?id=${commentId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.status !== 204) {
            await handleApiError(response);
        }
        
        console.log(`Successfully deleted comment with ID: ${commentId}`);
    } catch (error) {
        console.error('Failed to delete comment:', error);
        throw error;
    }
}

module.exports = {
    readAllYoutubeComments,
    postSingleYoutubeComment,
    deleteYoutubeComment
};
