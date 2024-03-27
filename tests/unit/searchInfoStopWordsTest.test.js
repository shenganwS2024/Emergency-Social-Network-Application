import { validateCriteria } from '../../controllers/searchController';

describe('Stop Words Rule for Search Information', () => {

  test('should reject a known stop word', () => {
    const inputWord = 'the';
    const isValid = validateCriteria(inputWord);
    expect(isValid).toBe(false);
  });

  test('should accept a valid word not in the stop words list', () => {
    const inputWord = 'information';
    const isValid = validateCriteria(inputWord);
    expect(isValid).toBe(true);
  });
  

});
