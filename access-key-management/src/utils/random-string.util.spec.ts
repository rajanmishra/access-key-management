import { generateRandomString } from './random-string.util';

describe('generateRandomString', () => {
  it('should generate a string of the specified length', () => {
    const length = 32;
    const userId = 'userId123';
    const randomString = generateRandomString(userId, length);
    expect(randomString.length).toBe(length);
  });

  it('should generate different strings for different userIds', () => {
    const length = 32;
    const userId1 = 'userId123';
    const userId2 = 'userId456';
    const randomString1 = generateRandomString(userId1, length);
    const randomString2 = generateRandomString(userId2, length);
    expect(randomString1).not.toBe(randomString2);
  });

  it('should generate different strings for the same userId with different random parts', () => {
    const length = 32;
    const userId = 'userId123';
    const randomString1 = generateRandomString(userId, length);
    const randomString2 = generateRandomString(userId, length);
    expect(randomString1).not.toBe(randomString2);
  });
});
