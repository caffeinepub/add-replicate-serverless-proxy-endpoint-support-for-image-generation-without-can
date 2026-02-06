import { useState } from 'react';
import { useCustomApiConfig } from './useCustomApiConfig';
import { useCreateGenerationRequest, useUpdateGenerationRequestStatus } from './useQueries';
import { Provider, ImageStatus } from '../backend';
import { callCustomApi } from '../services/customApiClient';
import { useQueryClient } from '@tanstack/react-query';

export function useCustomApiGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { config, validate } = useCustomApiConfig();
  const createRequest = useCreateGenerationRequest();
  const updateStatus = useUpdateGenerationRequestStatus();
  const queryClient = useQueryClient();

  const generateWithCustomApi = async (prompt: string) => {
    const validationError = validate();
    if (validationError) {
      throw new Error(validationError);
    }

    setIsGenerating(true);

    try {
      // Create pending request with ReplicateOrProxy provider
      const requestId = await createRequest.mutateAsync({
        prompt,
        provider: Provider.ReplicateOrProxy,
      });

      // Call custom API (client-side fetch with configurable authorization)
      try {
        const resultBlob = await callCustomApi(
          config.apiUrl,
          config.apiKey,
          prompt,
          config.authorizationHeaderMode
        );

        // Update request with success (resultBlob is always URL-based)
        await updateStatus.mutateAsync({
          id: requestId,
          status: ImageStatus.succeeded,
          resultBlob,
          errorMessage: null,
        });

        // Force immediate refresh of gallery
        await queryClient.invalidateQueries({ queryKey: ['userGenerationRequests'] });
      } catch (apiError: any) {
        // Update request with failure
        const errorMessage = apiError.message || 'API request failed';
        await updateStatus.mutateAsync({
          id: requestId,
          status: ImageStatus.failed,
          resultBlob: null,
          errorMessage,
        });

        // Force immediate refresh of gallery to show error
        await queryClient.invalidateQueries({ queryKey: ['userGenerationRequests'] });
        
        throw apiError;
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateWithCustomApi,
    isGenerating,
  };
}
