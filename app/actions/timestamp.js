export default {
  updateTime: function(context, payload, done) {
    context.dispatch('UPDATE_TIME');
    done();
  }
}
