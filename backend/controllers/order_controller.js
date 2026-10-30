import order from '../models/order.js';
import Customer from '../models/customer.js';
import generate_id from '../utils/generate_id.js';

// 1. Create a new order
export const create_order = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    // Step 1: Find the customer using their email
    let customer = await Customer.findOne({ email });

    // Step 2: Generate a customer ID only for a new customer
    if (!customer) {
      const customer_id = await generate_id('customer', 'CUS');

      customer = await Customer.create({
        customer_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        postal_code: req.body.postal_code,
        country: req.body.country
      });
    }

    // Step 3: Generate a new order ID for every order
    const order_id = await generate_id('order', 'ORD');

    // Step 4: Save the order with the customer's existing ID
    const newOrder = new order({
      ...req.body,
      email,
      customer_id: customer.customer_id,
      order_id
    });

    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);

    res.status(500).json({
      error: 'Failed to create order'
    });
  }
};

// 2. Get all orders
export const get_order = async (req, res) => {
  try {
    const orders = await order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// 3. Update an order by ID
export const update_order = async (req, res) => {
  try {
    const { id } = req.params;
const updatedOrder = await order.findByIdAndUpdate(
  id,
  req.body,
  { returnDocument: 'after' }
);    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// 4. Delete an order by ID
export const delete_order = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};