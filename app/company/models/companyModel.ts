/**
 * Created by ksh on 12/12/14.
 */
import mongoose = require('mongoose');
export function CompanySchema():mongoose.Schema{

  return new mongoose.Schema(
    { name:{
        type:String,
        required:true,
        unique:true
      },
      address:{
        type:String,
        required:true
      },
      reseller:{
        type:Boolean,
        required:true
      },
      domain:{
        type:String,
        required:true
      },
      businessContact:{
        type:Object,
        required:true
      },
      technicalContact:{
        type:Object,
        required:true
      },
      supportContact:{
        type:Object,
        required:true
      },
      logo:{
        type:String
      },
      themeType:{
        type:String
      },
      status: {
        type: String,
        required: true,
        default: 'inactive'
      },
      createAt: {
        type: Date,
        required: true
      },
      createBy: {
        type: String,
        required: true
      },
      updateAt: {
        type: Date,
        required: true
      },
      updateBy: {
        type: String,
        required: true
      }
    },{collection:'Company',strict:true});
}

export interface Company {
  name:string;
  address:string;
  reseller:boolean;
  domain:string;
  businessContact:Contact;
  technicalContact:Contact;
  supportContact:Contact;
  logo:string;
  themeType:string;
  createAt: string;
  createBy: String;
  updateAt: string;
  updateBy: String;
}

/**
 *Contact interface
 */
interface Contact {
  name:string;
  phone:string;
  email:string;
}
