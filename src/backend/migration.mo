import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
  type OldProvider = {
    #Flux;
    #StableDiffusion;
    #Dalle3;
    #MidJourney;
    #CustomApi;
  };

  type OldGenerationRequest = {
    id : Text;
    user : Principal;
    prompt : Text;
    provider : OldProvider;
    timestamp : Time.Time;
    status : {
      #pending;
      #succeeded;
      #failed;
    };
    resultBlob : ?Storage.ExternalBlob;
    errorMessage : ?Text;
  };

  type OldActor = {
    requests : Map.Map<Text, OldGenerationRequest>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    nextId : Nat;
  };

  type NewActor = {
    requests : Map.Map<Text, { id : Text; user : Principal; prompt : Text; provider : { #Flux; #StableDiffusion; #Dalle3; #MidJourney; #ReplicateOrProxy }; timestamp : Time.Time; status : { #pending; #succeeded; #failed }; resultBlob : ?Storage.ExternalBlob; errorMessage : ?Text }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    nextId : Nat;
  };

  func mapOldProviderToNew(oldProvider : OldProvider) : { #Flux; #StableDiffusion; #Dalle3; #MidJourney; #ReplicateOrProxy } {
    switch (oldProvider) {
      case (#CustomApi) { #ReplicateOrProxy };
      case (#Flux) { #Flux };
      case (#StableDiffusion) { #StableDiffusion };
      case (#Dalle3) { #Dalle3 };
      case (#MidJourney) { #MidJourney };
    };
  };

  func mapOldGenerationRequestToNew(old : OldGenerationRequest) : { id : Text; user : Principal; prompt : Text; provider : { #Flux; #StableDiffusion; #Dalle3; #MidJourney; #ReplicateOrProxy }; timestamp : Time.Time; status : { #pending; #succeeded; #failed }; resultBlob : ?Storage.ExternalBlob; errorMessage : ?Text } {
    {
      old with
      provider = mapOldProviderToNew(old.provider)
    };
  };

  public func run(old : OldActor) : NewActor {
    let newRequests = old.requests.map<Text, OldGenerationRequest, { id : Text; user : Principal; prompt : Text; provider : { #Flux; #StableDiffusion; #Dalle3; #MidJourney; #ReplicateOrProxy }; timestamp : Time.Time; status : { #pending; #succeeded; #failed }; resultBlob : ?Storage.ExternalBlob; errorMessage : ?Text }>(
      func(_id, oldRequest) {
        mapOldGenerationRequestToNew(oldRequest);
      }
    );
    {
      old with
      requests = newRequests
    };
  };
};
