module.exports = () => {
  let _router;

  return {
    name: 'RouterPlugin',

    plugContext() {
      return {
        plugActionContext(actionContext) {
          actionContext.getRouter = () => _router;
        },
      };
    },

    setRouter(router) {
      _router = router;
    },
  };
};
