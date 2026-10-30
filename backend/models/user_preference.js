import mongoose from 'mongoose';

const user_preference_schema=new mongoose.Schema({
    user_id:{
        type:String,
        required:true,
        default:'default_user'
    },
    page:{
        type:String,
        required:true,
        default:'orders_table'
    },
    columns:{
        type:Array,
        required:true
    }
},{timestamps:true})

const user_preference_model=mongoose.models.user_preference || mongoose.model('user_preference',user_preference_schema);
export default user_preference_model;