const router = require('express').Router();
const { 
    readAllYoutubeComments,
    postSingleYoutubeComment,
    deleteYoutubeComment 
} = require('../youtube'); 
const { normalizeText, removeWhitespace } = require('../normalize');
const { KMP, BoyerMoore, RabinKarp, Regex } = require('../matching');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(403).json({ message: 'Unauthorized' });
}

router.post('/comments/search/:videoId', async (req, res) => {
    const { videoId } = req.params;
    const { method, patterns } = req.body; 
    const apiKey = process.env.API_KEY;

    try {
        const allComments = await readAllYoutubeComments(apiKey, videoId, 1000);

        const matchingComments = allComments.filter(comment => {
            console.log(comment)
            const normalizedText = normalizeText(comment.text);
            console.log(`Normalized text: ${normalizedText}`);

            if (method === 'Regex') {
                const matches = Regex.search(normalizedText);
                return matches.length > 0; 
            } else {
                if (!patterns || !Array.isArray(patterns)) return false;

                return patterns.some(pattern => {
                    let result = [];
                    pattern = removeWhitespace(pattern)
                    console.log(pattern)

                    if (method === 'KMP') {
                        result = KMP.search(normalizedText, pattern);
                    } else if (method === 'BM') {
                        result = BoyerMoore.search(normalizedText, pattern);
                    } else if (method === 'Rabin-Karp') {
                        result = RabinKarp.search(normalizedText, pattern);
                    }
                    console.log(`Matches:`, result);
                    return result.length > 0;
                });
            }
        });
        
        const finalResponse = matchingComments.map(comment => ({
            id: comment.id,
            author: comment.author,
            text: comment.text
        }));
        
        console.log('Final response:', finalResponse);
        res.status(200).json(finalResponse);

    } catch (error) {
        console.error('Error searching YouTube comments:', error);
        res.status(500).json({ message: 'Failed to search comments' });
    }
});

router.post('/comments/batch/:videoId', isAuthenticated, async (req, res) => {
    const { videoId } = req.params;
    const { commentsToPost } = req.body; 
    const authToken = req.user.accessToken;

    if (!commentsToPost || !Array.isArray(commentsToPost)) {
        return res.status(400).json({ message: 'Request body must contain a "commentsToPost" array.' });
    }

    try {
        const results = [];
        for (const commentText of commentsToPost) {
            if (commentText.trim()) {
                const response = await postSingleYoutubeComment(authToken, videoId, commentText);
                results.push({ status: 'success', posted: commentText, response });
            }
        }
        res.status(201).json({ message: 'Batch post operation completed.', results });
    } catch (error) {
        console.error('Error posting batch YouTube comments:', error);
        res.status(500).json({ message: 'Failed to post batch comments' });
    }
});

router.delete('/comments/:commentId', isAuthenticated, async (req, res) => {
    const { commentId } = req.params;
    const authToken = req.user.accessToken;

    try {
        await deleteYoutubeComment(authToken, commentId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting YouTube comment:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
});

module.exports = router;
