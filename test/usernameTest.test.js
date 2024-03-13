import { validateUserInfo } from '../controllers/userController';


// Use your test URI here
//const TestDBUri = 'mongodb+srv://yus2:1111@fse.dty3o9p.mongodb.net/ESNTestDB';
//
//beforeAll(async () => {
//    await DBConnection.getInstance(TestDBUri);
//});


describe('Test Cases to validate username rule', () => {
    it('Valid username', async () => {
        const username = 'testuser';
        const password = 'password';
        const result = await validateUserInfo(username, password);
        expect(result).toBe(true);
    });

    it('Username is banned', async () => {
      const username = 'admin';
      const password = 'password';
      const result = await validateUserInfo(username, password);
      expect(result).toBe(false);
    });

    it('Username is too short', async () => {
      const username = 'ab';
      const password = 'password';
      const result = await validateUserInfo(username, password);
      expect(result).toBe(false);
    });

    it('Username is not case sensitive', async () => {
      const username = 'ADMIN';
      const password = 'password';
      const result = await validateUserInfo(username, password);
      expect(result).toBe(false);
    });

    it('Valid username but complicated with symbols', async () => {
      const username = '6345@#$%Rgwer@#$%#$@6WREGEWT#$@%#$Tfergwer#@$%@#$%#T';
      const password = 'password';
      const result = await validateUserInfo(username, password);
      expect(result).toBe(true);
    });

    it('Valid username with spaces', async () => {
      const username = '    tes     tuse      r     ';
      const password = 'password';
      const result = await validateUserInfo(username, password);
      expect(result).toBe(true);
  });
});

//afterAll(async () => {
//    // clean the database
//    await mongoose.connection.db.dropDatabase();
//    await DBConnection.close();
//});

