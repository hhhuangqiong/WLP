import _ from 'lodash';
import Q from 'q';
import createStore from 'fluxible/addons/createStore';


var ModalStore = createStore({
  storeName: 'ModalStore',
  initialize: function () {
    this.title = ""
    this.content = ""
  },
  getAll: function() {
    return this.content;
  },
  handleContentChange: function() {
    this.emitChange();
  },
  receiveContent: function(modalContent) {
    // TODO: assign a key of _id to this.content Object
    this.content = modalContent.content;
    this.title = modalContent.title;

    this.emit('change');
  },
  componentDidMount: function(){
    var elm = this;
    $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
      elm.setState({isModalOpen: false});
    });
  },
  handlers: {
    'MODAL_CONTENT_CHANGE': 'receiveContent'
  },
  getState: function () {
    return {
      Content: this.content,
      Title: this.title,
      isModalOpen: false
    };
  },
  dehydrate: function () {
    return this.getState();
  },
  rehydrate: function (state) {
    this.content = state.content;
    this.title = state.title;
  }
});

export default ModalStore;
