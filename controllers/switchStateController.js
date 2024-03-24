import { PRODUCTION_DB_URI, TEST_DB_URI, io } from '../config/serverConfig.js';
import DBAccessDAO from '../dao/DBAccessDAO.js';

let isSpeedTestMode = false;

// async function checkSpeedTestMode(req, res, next) {
//     if (isSpeedTestMode) {
//         res.status(503).json({ message: 'System is currently undergoing a speed test, please try again later.' });
//     }
//     next();
// }

async function switchDatabase(req, res) {
    try {

        isSpeedTestMode = req.body.isSpeedTestMode;
        
        let newDbUri = isSpeedTestMode ? TEST_DB_URI : PRODUCTION_DB_URI;

        if (!isSpeedTestMode) {
            await DBAccessDAO.destroyTestDatabase();
        }

        await DBAccessDAO.switchDatabase(newDbUri);

        res.status(200).json({ message: 'Database switched successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error switching database' });
    }
}

export { switchDatabase, PRODUCTION_DB_URI, TEST_DB_URI };
