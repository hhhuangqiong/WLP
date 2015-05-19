var submitForm  = {
  onSubmit:function(data, callback){
    console.log(data)
    $("#myModal").foundation('reveal', 'close');
  }
};
export default submitForm;

