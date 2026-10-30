import order from '../models/order.js'

export const create_order=async (order_data)=>{
    const new_order=new order(order_data);
    return await new_order.save();
}

export const get_all_orders=async()=>{
    return await order.find().sort({createdAt:-1});
}

export const update_order = async (id, orderData) => {
  return await order.findByIdAndUpdate(id, orderData, { new: true });
};

export const delete_order = async (id) => {
  return await order.findByIdAndDelete(id);
};