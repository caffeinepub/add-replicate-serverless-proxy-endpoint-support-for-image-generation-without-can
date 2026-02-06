import { ExternalBlob } from '../backend';
import { PLACEHOLDER_IMAGE_URL } from '../utils/placeholderImages';
import type { AuthorizationHeaderMode } from '../hooks/useCustomApiConfig';

export async function callCustomApi(
  apiUrl: string,
  apiKey: string,
  prompt: string,
  authMode: AuthorizationHeaderMode = 'bearer'
): Promise<ExternalBlob> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Apply authorization header based on selected mode
  if (authMode !== 'none' && apiKey) {
    if (authMode === 'bearer') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (authMode === 'token') {
      headers['Authorization'] = `Token ${apiKey}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt }),
    });
  } catch (error: any) {
    throw new Error(`Network error: ${error.message || 'Failed to connect to API'}`);
  }

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = `API error: ${errorData.error}`;
      }
    } catch {
      // If error response is not JSON, use status text
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('Content-Type') || '';

  // Handle direct image response - use placeholder instead of storing bytes
  if (contentType.startsWith('image/')) {
    console.info('Custom API returned image bytes; using placeholder URL instead of storing bytes');
    return ExternalBlob.fromURL(PLACEHOLDER_IMAGE_URL);
  }

  // Handle JSON response
  let data: any;
  try {
    data = await response.json();
  } catch (error: any) {
    throw new Error('API response is not valid JSON or image data');
  }

  // If API returns a URL, use it directly
  if (data.image_url) {
    return ExternalBlob.fromURL(data.image_url);
  }

  // If API returns base64, use placeholder instead of converting to bytes
  if (data.image_base64) {
    console.info('Custom API returned base64 image data; using placeholder URL instead of storing bytes');
    return ExternalBlob.fromURL(PLACEHOLDER_IMAGE_URL);
  }

  throw new Error('API response does not contain image_url field. Expected JSON with {image_url: "..."} or direct image bytes (which will use a placeholder).');
}
