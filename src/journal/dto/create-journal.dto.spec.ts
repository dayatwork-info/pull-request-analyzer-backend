import { validate } from 'class-validator';
import { CreateJournalDto } from './create-journal.dto';

describe('CreateJournalDto', () => {
  it('should validate a valid create journal dto', async () => {
    const journalDto = new CreateJournalDto();
    journalDto.email = 'test@example.com';
    journalDto.password = 'password123';
    journalDto.title = 'My Journal Entry';
    journalDto.content = 'This is the content of my journal entry.';
    journalDto.prRef = 'owner/repo/pulls/123';

    const errors = await validate(journalDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with empty email', async () => {
    const journalDto = new CreateJournalDto();
    journalDto.email = '';
    journalDto.password = 'password123';
    journalDto.title = 'My Journal Entry';
    journalDto.content = 'This is the content of my journal entry.';
    journalDto.prRef = 'owner/repo/pulls/123';

    const errors = await validate(journalDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with empty password', async () => {
    const journalDto = new CreateJournalDto();
    journalDto.email = 'test@example.com';
    journalDto.password = '';
    journalDto.title = 'My Journal Entry';
    journalDto.content = 'This is the content of my journal entry.';
    journalDto.prRef = 'owner/repo/pulls/123';

    const errors = await validate(journalDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with empty title', async () => {
    const journalDto = new CreateJournalDto();
    journalDto.email = 'test@example.com';
    journalDto.password = 'password123';
    journalDto.title = '';
    journalDto.content = 'This is the content of my journal entry.';
    journalDto.prRef = 'owner/repo/pulls/123';

    const errors = await validate(journalDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with empty content', async () => {
    const journalDto = new CreateJournalDto();
    journalDto.email = 'test@example.com';
    journalDto.password = 'password123';
    journalDto.title = 'My Journal Entry';
    journalDto.content = '';
    journalDto.prRef = 'owner/repo/pulls/123';

    const errors = await validate(journalDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with empty prRef', async () => {
    const journalDto = new CreateJournalDto();
    journalDto.email = 'test@example.com';
    journalDto.password = 'password123';
    journalDto.title = 'My Journal Entry';
    journalDto.content = 'This is the content of my journal entry.';
    journalDto.prRef = '';

    const errors = await validate(journalDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('prRef');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
