import { useCustomApiConfig } from '../../hooks/useCustomApiConfig';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Info } from 'lucide-react';

export default function CustomApiConfigFields() {
  const { config, updateConfig, validationError } = useCustomApiConfig();

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Replicate / Proxy Endpoint Configuration:</strong> Configure your endpoint to accept POST requests with JSON payload{' '}
          <code className="bg-background px-1 rounded">{'{ "prompt": "..." }'}</code> and return JSON with{' '}
          <code className="bg-background px-1 rounded">image_url</code> field pointing to a publicly accessible image URL.
          <div className="mt-2 text-xs text-muted-foreground">
            This can be a public Replicate endpoint, a serverless proxy (e.g., Vercel function) that injects secrets server-side, or any compatible API.
          </div>
          <div className="mt-1 text-xs text-muted-foreground font-semibold">
            Important: API calls are made directly from your browser. Keys/tokens are never sent to the canister backend.
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="apiUrl">API Endpoint URL</Label>
        <Input
          id="apiUrl"
          type="url"
          placeholder="https://api.replicate.com/v1/predictions or your proxy URL"
          value={config.apiUrl}
          onChange={(e) => updateConfig({ apiUrl: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="authMode">Authorization Mode</Label>
        <Select
          value={config.authorizationHeaderMode}
          onValueChange={(value) => updateConfig({ authorizationHeaderMode: value as 'none' | 'bearer' | 'token' })}
        >
          <SelectTrigger id="authMode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No auth</SelectItem>
            <SelectItem value="bearer">Bearer token</SelectItem>
            <SelectItem value="token">Token</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select how the API key/token should be sent in the Authorization header.
        </p>
      </div>

      {config.authorizationHeaderMode !== 'none' && (
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key / Token</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Your API key or token"
            value={config.apiKey}
            onChange={(e) => updateConfig({ apiKey: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            {config.authorizationHeaderMode === 'bearer' && (
              <>Sent as <code className="bg-background px-1 rounded">Authorization: Bearer &lt;key&gt;</code> header in browser requests only.</>
            )}
            {config.authorizationHeaderMode === 'token' && (
              <>Sent as <code className="bg-background px-1 rounded">Authorization: Token &lt;key&gt;</code> header in browser requests only.</>
            )}
          </p>
        </div>
      )}

      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}
    </div>
  );
}
