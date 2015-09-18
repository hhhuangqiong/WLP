export default function(context, params, callback) {
  context.api.getAuthorityList(params, function(err, result) {
    callback(err, result);
    return;
  });
}
