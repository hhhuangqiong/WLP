export default function(context, carrierId, callback) {
  context.api.getAuthorityList(carrierId, function(err, { carrierId, capability }) {

    let authority = context.getAuthority();
    authority.reset(carrierId, capability);

    callback(err);
  });
}
