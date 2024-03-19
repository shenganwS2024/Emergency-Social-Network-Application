import { validateUserInfo } from '../../controllers/userController';


describe('Test Cases to validate password rule', () => {
    it('Password is shorter than required', async () => {
      const username = 'testuser';
      const password = 'pas';
      const result = await validateUserInfo(username, password);
      expect(result).toBe(false);
    });

    it('Password meets minimum length requirement', async () => {
        const username = 'testuser';
        const password = 'pass';
        const result = await validateUserInfo(username, password);
        expect(result).toBe(true);
    });

    it('Password meets minimum length with mixed characters', async () => {
        const username = 'testuser';
        const password = '! +%';
        const result = await validateUserInfo(username, password);
        expect(result).toBe(true);
    });

    it('Long and complicated valid password', async () => {
        const username = 'testuser';
        const password = '#$%@#$%gwergwervrewv  ewrfwerf$#@%5234543265363546wvse! +%fqwfw4ff';
        const result = await validateUserInfo(username, password);
        expect(result).toBe(true);
    });

});
