import getStrategy from '../searchStrategies/searchIndex.js'

async function getSearchResults(req, res) {
    try {
        //context/:criteria/:pageNumber
        let criteria = req.params.criteria;
        let context = req.params.context;
        let pageNumber = req.params.pageNumber;
        let searchResults = getStrategy(context, criteria)
        if (pageNumber === '0') {
            res.status(200).json({ data: { results: searchResults } })
        }
    } catch (error) {
        console.error('Error getting search results:', error);
        res.status(500).send('Error search results');
    }
}


export { getSearchResults };