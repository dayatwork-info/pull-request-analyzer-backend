import { UserJournalsDto } from './user-journals.dto';

describe('UserJournalsDto', () => {
  it('should create a valid user journals dto with empty array', () => {
    const userJournals = new UserJournalsDto();
    userJournals.journalIds = [];

    expect(userJournals).toBeDefined();
    expect(userJournals.journalIds).toEqual([]);
  });

  it('should create a valid user journals dto with journal IDs', () => {
    const userJournals = new UserJournalsDto();
    userJournals.journalIds = ['journal-1', 'journal-2', 'journal-3'];

    expect(userJournals).toBeDefined();
    expect(userJournals.journalIds).toHaveLength(3);
    expect(userJournals.journalIds).toEqual([
      'journal-1',
      'journal-2',
      'journal-3',
    ]);
  });

  it('should allow serialization to JSON', () => {
    const userJournals = new UserJournalsDto();
    userJournals.journalIds = ['journal-1', 'journal-2', 'journal-3'];

    const serialized = JSON.stringify(userJournals);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual({
      journalIds: ['journal-1', 'journal-2', 'journal-3'],
    });
  });
});
