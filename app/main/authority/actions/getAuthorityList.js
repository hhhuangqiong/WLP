export default function (context, carrierId, callback) {
  context.api.getAuthorityList(carrierId, (err, payload) => {
    if (!payload) {
      callback();
      return;
    }

    const authority = context.getAuthority();
    authority.reset(carrierId, payload.capability);

    callback(err);
  });
}
