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
        const username = req.body.username;

        if(isSpeedTestMode){
            // Emit and wait for all clients to acknowledge the logout.
            const loggedOut = await new Promise((resolve, reject) => {
                let loggedOutUsers = 0;
                io.emit('speed test logout', { username: username }, () => {
                    loggedOutUsers++;
                    if (loggedOutUsers === io.engine.clientsCount) {
                        resolve(true);
                    }
                });

                // Failsafe timeout in case some clients don't respond.
                setTimeout(() => {
                    if (loggedOutUsers < io.engine.clientsCount) {
                        console.error('Not all users logged out');
                        reject('Logout timeout');
                    }
                }, 5000); // Adjust timeout as needed.
            });

            if (!loggedOut) {
                throw new Error('Not all users logged out');
            }
        }
        else{
            await DBAccessDAO.destroyTestDatabase();
        }
    

        let newDbUri = isSpeedTestMode ? TEST_DB_URI : PRODUCTION_DB_URI;
        await DBAccessDAO.switchDatabase(newDbUri);

        res.status(200).json({ message: 'Database switched successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error switching database' });
    }
}

export { switchDatabase, PRODUCTION_DB_URI, TEST_DB_URI };
