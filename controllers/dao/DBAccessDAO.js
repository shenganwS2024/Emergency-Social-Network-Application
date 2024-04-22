import DBConnection from '../../config/database.js';

class DBAccessDAO {
  static switchDatabase = async (newDbUri) => {
    await this._getDBInstance(newDbUri);
  };

  static _getDBInstance = async (newDbUri) => {
    return await DBConnection.getInstance(newDbUri);
  };

  static destroyTestDatabase = async () => {
    await DBConnection.dropDatabase();
  };
}

export default DBAccessDAO;
