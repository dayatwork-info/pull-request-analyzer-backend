import { JournalResponseDto } from './journal-response.dto';

describe('JournalResponseDto', () => {
  it('should create a valid journal response dto', () => {
    const date = new Date();
    const journalResponse = new JournalResponseDto();
    journalResponse.id = '12345';
    journalResponse.title = 'My Journal Entry';
    journalResponse.content = 'This is the content of my journal entry.';
    journalResponse.userId = 'user-123';
    journalResponse.createdAt = date;

    expect(journalResponse).toBeDefined();
    expect(journalResponse.id).toBe('12345');
    expect(journalResponse.title).toBe('My Journal Entry');
    expect(journalResponse.content).toBe(
      'This is the content of my journal entry.',
    );
    expect(journalResponse.userId).toBe('user-123');
    expect(journalResponse.createdAt).toBe(date);
  });

  it('should allow serialization to JSON', () => {
    const date = new Date('2023-01-15T12:00:00Z');
    const journalResponse = new JournalResponseDto();
    journalResponse.id = '12345';
    journalResponse.title = 'My Journal Entry';
    journalResponse.content = 'This is the content of my journal entry.';
    journalResponse.userId = 'user-123';
    journalResponse.createdAt = date;

    const serialized = JSON.stringify(journalResponse);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual({
      id: '12345',
      title: 'My Journal Entry',
      content: 'This is the content of my journal entry.',
      userId: 'user-123',
      createdAt: date.toISOString(),
    });
  });
});
