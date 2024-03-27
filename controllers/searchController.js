import getStrategy from '../searchStrategies/searchIndex.js'
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
        
        let results = prepareResults(searchResults, pageNumber, validatedCriteria);
        console.log("Results", results, pageNumber);
        
        res.status(200).json({ data: { results } });
    } catch (error) {
        console.error('Error getting search results:', error);
        res.status(500).send('Error search results');
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