export default function (context, carrierId, callback) {
  context.api.getAuthorityList(carrierId, (err, payload) => {
    if (!payload) return callback();

    const authority = context.getAuthority();
    authority.reset(carrierId, payload.capability);

    callback(err);
  });
}
