import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { GenerationRequest, UserProfile, Provider, ImageStatus } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUserGenerationRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GenerationRequest[]>({
    queryKey: ['userGenerationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Use caller-based method to work for both anonymous and authenticated users
      const requests = await actor.getCallerGeneratedRequests();
      // Sort newest first
      return requests.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: (query) => {
      // Poll every 5 seconds if there are pending requests
      const hasPending = query.state.data?.some(r => r.status === 'pending');
      return hasPending ? 5000 : false;
    },
  });
}

export function useCreateGenerationRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prompt, provider }: { prompt: string; provider: Provider }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGenerationRequest(prompt, provider);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGenerationRequests'] });
    },
  });
}

export function useUpdateGenerationRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      resultBlob,
      errorMessage,
    }: {
      id: string;
      status: ImageStatus;
      resultBlob: ExternalBlob | null;
      errorMessage: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGenerationRequestStatus(id, status, resultBlob, errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGenerationRequests'] });
    },
  });
}
