import Bool "mo:base/Bool";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import List "mo:base/List";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Principal "mo:base/Principal";

actor {
  type Post = {
    id: Nat;
    title: Text;
    body: Text;
    author: Text;
    timestamp: Time.Time;
    creator: Principal;
  };

  stable var posts : List.List<Post> = List.nil();
  stable var nextId : Nat = 0;

  public shared(msg) func createPost(title: Text, body: Text, author: Text) : async Result.Result<Post, Text> {
    let caller = msg.caller;
    if (Principal.isAnonymous(caller)) {
      return #err("Authentication required");
    };

    let post : Post = {
      id = nextId;
      title = title;
      body = body;
      author = author;
      timestamp = Time.now();
      creator = caller;
    };
    posts := List.push(post, posts);
    nextId += 1;
    #ok(post)
  };

  public query func getPosts() : async [Post] {
    List.toArray(posts)
  };

  public query func getPost(id: Nat) : async Result.Result<Post, Text> {
    switch (List.find(posts, func (p: Post) : Bool { p.id == id })) {
      case (null) { #err("Post not found") };
      case (?post) { #ok(post) };
    }
  };

  public shared(msg) func getMyPrincipal() : async Principal {
    msg.caller
  };

  system func preupgrade() {};

  system func postupgrade() {};
}
