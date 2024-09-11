export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Post = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'creator' : IDL.Principal,
    'body' : IDL.Text,
    'author' : IDL.Text,
    'timestamp' : Time,
  });
  const Result = IDL.Variant({ 'ok' : Post, 'err' : IDL.Text });
  return IDL.Service({
    'createPost' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
    'getMyPrincipal' : IDL.Func([], [IDL.Principal], []),
    'getPost' : IDL.Func([IDL.Nat], [Result], ['query']),
    'getPosts' : IDL.Func([], [IDL.Vec(Post)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
