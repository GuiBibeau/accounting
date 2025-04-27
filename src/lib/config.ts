/**
 * Application configuration settings derived from environment variables.
 */
export const config = {
  /** Google Client ID for OAuth */
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  /** Google Client Secret for OAuth */
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  /** Base URL of the application */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  /**
   * Constructs the Google OAuth redirect URI based on the application's base URL.
   * @returns {string} The full redirect URI.
   */
  get googleRedirectUri(): string {
    if (!this.appUrl) {
        console.error("Configuration Error: NEXT_PUBLIC_APP_URL is not set.");
         throw new Error("NEXT_PUBLIC_APP_URL environment variable is not defined.");
     }
     return `${this.appUrl}/auth/google/callback`;
   },

  /**
   * Checks if essential Google OAuth credentials are configured.
   * @returns {boolean} True if client ID and secret are set, false otherwise.
   */
  hasGoogleCredentials(): boolean {
    return !!this.googleClientId && !!this.googleClientSecret;
  }
};

if (!config.hasGoogleCredentials()) {
  console.warn("Configuration Warning: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables are missing.");
}
