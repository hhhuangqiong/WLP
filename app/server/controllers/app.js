var App = (function () {
    function App() {
        this.index = function (req, res, next) {
            res.render('layout/admin-layout', {});
        };
    }
    return App;
})();
module.exports = App;
