import mongoose from 'mongoose'

const counter_schema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    default: 0
  }
})

export default mongoose.model('Counter', counter_schema)