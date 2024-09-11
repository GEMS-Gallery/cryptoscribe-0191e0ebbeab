import Bool "mo:base/Bool";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import List "mo:base/List";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";

actor {
  // Define the Post type
  type Post = {
    id: Nat;
    title: Text;
    body: Text;
    author: Text;
    timestamp: Time.Time;
  };

  // Stable variable to store posts
  stable var posts : List.List<Post> = List.nil();
  stable var nextId : Nat = 0;

  // Create a new post
  public func createPost(title: Text, body: Text, author: Text) : async Result.Result<Post, Text> {
    let post : Post = {
      id = nextId;
      title = title;
      body = body;
      author = author;
      timestamp = Time.now();
    };
    posts := List.push(post, posts);
    nextId += 1;
    #ok(post)
  };

  // Get all posts
  public query func getPosts() : async [Post] {
    List.toArray(posts)
  };

  // Get a specific post by ID
  public query func getPost(id: Nat) : async ?Post {
    List.find(posts, func (p: Post) : Bool { p.id == id })
  };

  // System functions for upgrades
  system func preupgrade() {
    // No need to do anything as we're using a stable variable
  };

  system func postupgrade() {
    // No need to do anything as we're using a stable variable
  };
}
