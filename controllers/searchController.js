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
        //context/:criteria/:pageNumber
        let criteria = req.params.criteria;
        let context = req.params.context;
        let pageNumber = req.params.pageNumber;
        let sender = req.params.sender;
        let receiver = req.params.receiver;
        let searchResults = await getStrategy(context, criteria, sender, receiver)
        let ret;
        let check = validateCriteria(criteria)

        if (!check) {
            ret = []
        }
        else{
            if (pageNumber === '0') {
                ret = searchResults
            }
            else {
                pageNumber = + pageNumber  //string to int
                if (!isNaN(pageNumber) && pageNumber > 0) {
                    searchResults.reverse();
                    const itemsPerPage = 10;
                    const startIndex = (pageNumber - 1) * itemsPerPage;
    
                    if (startIndex >= searchResults.length) {
                        ret = []
                    }
                    else {
                        let endIndex = startIndex + itemsPerPage;
                        if (endIndex >= searchResults.length) {
                            endIndex = searchResults.length
                        }
                        ret = searchResults.slice(startIndex, endIndex);
                    }
                    
                } else {
                    // Handle invalid page number (e.g., non-numeric or negative)
                    ret = []; // or any other fallback logic you prefer
                }
            }
        }
console.log("ret", ret, pageNumber)
        res.status(200).json({ data: { results: ret } })
    } catch (error) {
        console.error('Error getting search results:', error);
        res.status(500).send('Error search results');
    }
}


export { getSearchResults, validateCriteria };