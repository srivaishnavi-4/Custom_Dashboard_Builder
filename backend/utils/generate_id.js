import Counter from '../models/counter.js'

const generate_id = async (counter_name, prefix) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: counter_name },
    { $inc: { sequence_value: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  )

  return `${prefix}${String(counter.sequence_value).padStart(3, '0')}`
}

export default generate_id