import mongoose from "mongoose";

const order_schema = new mongoose.Schema({

    order_id: {
  type: String,
  unique: true,
  immutable: true
},
    first_name: { 
        type: String, 
        required: true 
    },
    last_name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    city: { 
        type: String, 
        required: true 
    },
    state: { 
        type: String, 
        required: true 
    },
    postal_code: { 
        type: String, 
        required: true 
    },
    country: { 
        type: String, 
        required: true 
    },
    customer_id: {
  type: String,
  required: true,
  immutable: true,
  index: true
},
    product: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    unit_price: { 
        type: Number, 
        required: true 
    },
    total_amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        required: true 
    },
    created_by: { 
        type: String, 
        required: true 
    }

}, { timestamps: true });

const order = mongoose.model('order', order_schema);
export default order;