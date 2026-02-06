import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface GenerationRequest {
    id: string;
    status: ImageStatus;
    provider: Provider;
    errorMessage?: string;
    user: Principal;
    timestamp: Time;
    resultBlob?: ExternalBlob;
    prompt: string;
}
export interface UserProfile {
    name: string;
}
export enum ImageStatus {
    pending = "pending",
    failed = "failed",
    succeeded = "succeeded"
}
export enum Provider {
    Flux = "Flux",
    Dalle3 = "Dalle3",
    ReplicateOrProxy = "ReplicateOrProxy",
    MidJourney = "MidJourney",
    StableDiffusion = "StableDiffusion"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Only authenticated users can create image generation requests.
     */
    createGenerationRequest(prompt: string, provider: Provider): Promise<string>;
    getAllFailedRequests(): Promise<Array<GenerationRequest>>;
    getAllPendingRequests(): Promise<Array<GenerationRequest>>;
    getAllSucceededRequests(): Promise<Array<GenerationRequest>>;
    getAllUserGenerationRequests(): Promise<Array<GenerationRequest>>;
    getCallerGeneratedRequests(): Promise<Array<GenerationRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGenerationRequest(id: string): Promise<GenerationRequest>;
    getUserFailedRequests(userId: Principal): Promise<Array<GenerationRequest>>;
    getUserGenerationRequests(userId: Principal): Promise<Array<GenerationRequest>>;
    getUserPendingRequests(userId: Principal): Promise<Array<GenerationRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserSucceededRequests(userId: Principal): Promise<Array<GenerationRequest>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateGenerationRequestStatus(id: string, status: ImageStatus, resultBlob: ExternalBlob | null, errorMessage: string | null): Promise<void>;
}
