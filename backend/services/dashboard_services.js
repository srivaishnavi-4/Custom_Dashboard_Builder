import dashboard from '../models/dashboard.js'

//create new dashboard
export const create_dashboard=async(data)=>{
    const new_dashboard=new dashboard(data)
    return await new_dashboard.save();
}

//get all dashboard
export const get_all_dashboards=async()=>{
    return await dashboard.find().sort({updatedAt:-1});
}

//get a dashboard by id
export const get_dashboards_by_id=async(id)=>{
    return await dashboard.findById(id);
};

//update changes
export const update_dashboard=async(id,data)=>{
    return await dashboard.findByIdAndUpdate(id,Date,{new:true});
}

//delete a dashboard
export const delete_dashboard=async(id)=>{
    return await dashboard.findByIdAndDelete(id);
}