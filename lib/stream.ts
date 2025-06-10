// lib/stream.ts
/**
 * Provides Stream video token generation
 */
import { jwtDecode } from "jwt-decode";

export const tokenProvider = async (userId: string) => {
  // In a real app, you would fetch this from your backend
  // This is a mock implementation
  const mockToken = generateMockToken(userId);
  return mockToken;
};

const generateMockToken = (userId: string) => {
  const payload = {
    user_id: userId,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
  };

  // In a real app, this would be signed with your secret key
  return `mock.${btoa(JSON.stringify(payload))}.signature`;
};

export const getTokenExpiration = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? new Date(decoded.exp * 1000) : null;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};