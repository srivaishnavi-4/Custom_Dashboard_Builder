import user_preference_model from '../models/user_preference.js'

//load the preference 
export const get_preferences=async(req,res)=>{
    try{
        const {user_id,page}=req.query;
        const preference=await user_preference_model.findOne({
            user_id: user_id ||  'default_user',
            page:page || 'order_table'
        })
        res.json(preference || { columns: [] });  
    }catch(err){
        console.log('Failed to load Preferences:',err)
        res.status(500).json({error:'Failed to load the preferences'});
    }
}

//post the new preferences
export const save_preference=async(req,res)=>{
    try{
        const {user_id,page,columns}=req.body;
        let preference=await user_preference_model.findOne({
            user_id:user_id || 'default_user',
            page:page || 'order_table'
        });

        if(preference){
            preference.columns=columns;
            await preference.save();
        }else{
            preference=new user_preference_model({
                user_id:user_id || 'default_user',
                page: page || 'order_table',
                columns
            });
            await preference.save();
        }
        res.json({message:'Preference saved :',preference});
    }catch(err){
        console.log("Failed to save Preferences",err);
        res.status(500).json({error:'Failed to save Preferences'})
    }
}