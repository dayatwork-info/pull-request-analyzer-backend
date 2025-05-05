export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    isVerified: boolean;
  };
  encryptedCredentials?: {
    email: string;
    password: string;
  };
}
