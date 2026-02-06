import { useState } from 'react';
import { useCreateGenerationRequest } from '../../hooks/useQueries';
import { useCustomApiGeneration } from '../../hooks/useCustomApiGeneration';
import { Provider } from '../../backend';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Sparkles, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import CustomApiConfigFields from './CustomApiConfigFields';

const PROVIDER_OPTIONS = [
  { value: Provider.ReplicateOrProxy, label: 'Replicate / Proxy Endpoint', available: true },
  { value: Provider.Flux, label: 'Flux', available: false },
  { value: Provider.StableDiffusion, label: 'Stable Diffusion', available: false },
  { value: Provider.Dalle3, label: 'DALL·E 3', available: false },
  { value: Provider.MidJourney, label: 'Midjourney API', available: false },
];

export default function GenerationForm() {
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState<Provider | ''>('');
  const [errors, setErrors] = useState<{ prompt?: string; provider?: string }>({});

  const createRequest = useCreateGenerationRequest();
  const { generateWithCustomApi, isGenerating: isCustomApiGenerating } = useCustomApiGeneration();

  const isGenerating = createRequest.isPending || isCustomApiGenerating;

  const validate = () => {
    const newErrors: { prompt?: string; provider?: string } = {};

    if (!prompt.trim()) {
      newErrors.prompt = 'Please enter a prompt';
    }

    if (!provider) {
      newErrors.provider = 'Please select a provider';
    }

    // Defensive check: block unsupported providers
    if (provider && provider !== Provider.ReplicateOrProxy) {
      newErrors.provider = 'Only Replicate / Proxy Endpoint is currently supported';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (provider === Provider.ReplicateOrProxy) {
        await generateWithCustomApi(prompt);
      } else {
        // This should never happen due to validation, but defensive check
        throw new Error('Only Replicate / Proxy Endpoint is currently supported');
      }

      // Clear form on success
      setPrompt('');
      setProvider('');
      setErrors({});
    } catch (error: any) {
      setErrors({ prompt: error.message || 'Generation failed. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          rows={4}
          className="resize-none"
        />
        {errors.prompt && (
          <p className="text-sm text-destructive">{errors.prompt}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="provider">AI Model</Label>
        <Select
          value={provider}
          onValueChange={(value) => setProvider(value as Provider)}
          disabled={isGenerating}
        >
          <SelectTrigger id="provider">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {PROVIDER_OPTIONS.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                disabled={!option.available}
              >
                {option.label}
                {!option.available && ' (Not available yet)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.provider && (
          <p className="text-sm text-destructive">{errors.provider}</p>
        )}
      </div>

      {provider && provider !== Provider.ReplicateOrProxy && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This provider is not available yet. Please use Replicate / Proxy Endpoint to generate images.
          </AlertDescription>
        </Alert>
      )}

      {provider === Provider.ReplicateOrProxy && <CustomApiConfigFields />}

      <Button type="submit" disabled={isGenerating} className="w-full">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Image
          </>
        )}
      </Button>
    </form>
  );
}
