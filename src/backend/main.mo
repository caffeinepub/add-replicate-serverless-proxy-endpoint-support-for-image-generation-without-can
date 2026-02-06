import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type Provider = {
    #Flux;
    #StableDiffusion;
    #Dalle3;
    #MidJourney;
    #ReplicateOrProxy;
  };

  public type ImageStatus = {
    #pending;
    #succeeded;
    #failed;
  };

  public type GenerationRequest = {
    id : Text;
    user : Principal;
    prompt : Text;
    provider : Provider;
    timestamp : Time.Time;
    status : ImageStatus;
    resultBlob : ?Storage.ExternalBlob;
    errorMessage : ?Text;
  };

  public type UserProfile = {
    name : Text;
  };

  let requests = Map.empty<Text, GenerationRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextId = 0;

  func generateId() : Text {
    let id = nextId;
    nextId += 1;
    id.toText();
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Image Generation Request Management

  /// Only authenticated users can create image generation requests.
  public shared ({ caller }) func createGenerationRequest(prompt : Text, provider : Provider) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create generation requests");
    };
    let id = generateId();
    let request : GenerationRequest = {
      id;
      user = caller;
      prompt;
      provider;
      timestamp = Time.now();
      status = #pending;
      resultBlob = null;
      errorMessage = null;
    };
    requests.add(id, request);
    id;
  };

  public shared ({ caller }) func updateGenerationRequestStatus(id : Text, status : ImageStatus, resultBlob : ?Storage.ExternalBlob, errorMessage : ?Text) : async () {
    let request = switch (requests.get(id)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) { request };
    };

    let isOwner = request.user == caller;
    let isAdmin = AccessControl.hasPermission(accessControlState, caller, #admin);

    if (not isOwner and not isAdmin) {
      Runtime.trap("Unauthorized: Only request owner or admins can update request status");
    };

    let updatedRequest : GenerationRequest = {
      request with
      status;
      resultBlob;
      errorMessage;
    };
    requests.add(id, updatedRequest);
  };

  public query ({ caller }) func getGenerationRequest(id : Text) : async GenerationRequest {
    let request = switch (requests.get(id)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) { request };
    };

    let isOwner = request.user == caller;
    let isAdmin = AccessControl.hasPermission(accessControlState, caller, #admin);

    if (not isOwner and not isAdmin) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };

    request;
  };

  public query ({ caller }) func getUserGenerationRequests(userId : Principal) : async [GenerationRequest] {
    if (caller != userId and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };
    let userRequestsIter = requests.values().filter(
      func(request) {
        request.user == userId;
      }
    );
    userRequestsIter.toArray();
  };

  public query ({ caller }) func getCallerGeneratedRequests() : async [GenerationRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their requests");
    };
    let callerRequestsIter = requests.values().filter(
      func(request) {
        Principal.equal(request.user, caller);
      }
    );
    callerRequestsIter.toArray();
  };

  public query ({ caller }) func getAllUserGenerationRequests() : async [GenerationRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all requests");
    };
    requests.values().toArray();
  };

  public query ({ caller }) func getUserFailedRequests(userId : Principal) : async [GenerationRequest] {
    let isAdmin = AccessControl.hasPermission(accessControlState, caller, #admin);
    if (caller != userId and not isAdmin) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };
    let userRequestsIter = requests.values().filter(
      func(request) {
        request.user == userId and request.status == #failed;
      }
    );
    userRequestsIter.toArray();
  };

  public query ({ caller }) func getUserSucceededRequests(userId : Principal) : async [GenerationRequest] {
    let isAdmin = AccessControl.hasPermission(accessControlState, caller, #admin);
    if (caller != userId and not isAdmin) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };
    let userRequestsIter = requests.values().filter(
      func(request) {
        request.user == userId and request.status == #succeeded;
      }
    );
    userRequestsIter.toArray();
  };

  public query ({ caller }) func getUserPendingRequests(userId : Principal) : async [GenerationRequest] {
    let isAdmin = AccessControl.hasPermission(accessControlState, caller, #admin);
    if (caller != userId and not isAdmin) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };
    let userRequestsIter = requests.values().filter(
      func(request) {
        request.user == userId and request.status == #pending;
      }
    );
    userRequestsIter.toArray();
  };

  public query ({ caller }) func getAllFailedRequests() : async [GenerationRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all requests");
    };
    requests.values().filter(
      func(request) {
        request.status == #failed;
      }
    ).toArray();
  };

  public query ({ caller }) func getAllSucceededRequests() : async [GenerationRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all requests");
    };
    requests.values().filter(
      func(request) {
        request.status == #succeeded;
      }
    ).toArray();
  };

  public query ({ caller }) func getAllPendingRequests() : async [GenerationRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all requests");
    };
    requests.values().filter(
      func(request) {
        request.status == #pending;
      }
    ).toArray();
  };
};
