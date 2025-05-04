import { ContributorDto, PaginationMetaDto } from './contributor.dto';

export class RepositoryContributorsDto {
  repository: string;
  contributors: ContributorDto[];
  pagination: PaginationMetaDto;
}
