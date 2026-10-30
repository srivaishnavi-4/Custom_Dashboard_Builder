import mongoose from 'mongoose';

const dashboard_schema = new mongoose.Schema({
  name: { type: String, default: 'My Dashboard' },
  widgets: { type: Array, required: true } 
}, { timestamps: true });

const dashboard_model = mongoose.model('Dashboard', dashboard_schema);
export default dashboard_model;