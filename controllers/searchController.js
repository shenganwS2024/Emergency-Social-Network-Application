import getStrategy from './searchStrategies/searchIndex.js'
import {Users} from '../models/Users.js'
import stop_words from '../config/stopWords.json' assert { type: 'json' };


function validateCriteria(criteria) {
    let bannedWords = stop_words.stop_words;
  
    if (bannedWords.includes(criteria)) {
      return false;
    }else {
      return true;
    }
  }

  async function getSearchResults(req, res) {
    try {
        const { criteria, context, pageNumber, sender, receiver } = extractParameters(req);
        const searchResults = await getStrategy(context, criteria, sender, receiver);
        const validatedCriteria = validateCriteria(criteria);

        // Retrieve all usernames from searchResults
        const usernames = searchResults.map(item => item.username);
        // Fetch activeness status for these users in one query
        const activeUsers = await Users.find({
            username: { $in: usernames },
            activeness: true
        }).select('username -_id');  // We only need the username field

        // Convert activeUsers to a set for quick lookup
        const activeUsernames = new Set(activeUsers.map(user => user.username));

        // Filter results to include only those with an active username
        let results = searchResults.filter(item => activeUsernames.has(item.username));
        results = prepareResults(results, pageNumber, validatedCriteria);  // Apply any additional preparation based on pagination and criteria validation

        res.status(200).json({ data: { results } });
    } catch (error) {
        console.error('Error getting search results:', error);
        res.status(500).send('Error getting search results');
    }
}

function extractParameters(req) {
    return {
        criteria: req.params.criteria,
        context: req.params.context,
        pageNumber: req.params.pageNumber,
        sender: req.params.sender,
        receiver: req.params.receiver,
    };
}

function prepareResults(searchResults, pageNumber, validatedCriteria) {
    if (!validatedCriteria) {
        return [];
    }

    if (pageNumber === '0') {
        return searchResults;
    }

    return paginateResults(searchResults, pageNumber);
}

function paginateResults(searchResults, pageNumber) {
    pageNumber = parseInt(pageNumber); // Convert string to integer
    if (isInvalidPageNumber(pageNumber)) {
        return []; // Handle invalid page number
    }

    searchResults.reverse();
    const paginationDetails = calculatePaginationDetails(pageNumber, searchResults.length);

    if (paginationDetails.startIndex >= searchResults.length) {
        return [];
    }

    return searchResults.slice(paginationDetails.startIndex, paginationDetails.endIndex);
}

function isInvalidPageNumber(pageNumber) {
    return isNaN(pageNumber) || pageNumber <= 0;
}

function calculatePaginationDetails(pageNumber, totalResults) {
    const itemsPerPage = 10;
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalResults);
    return { startIndex, endIndex };
}



export { getSearchResults, validateCriteria };