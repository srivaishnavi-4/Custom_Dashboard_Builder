import mongoose from "mongoose";

const connect_db=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URL||'mongodb://127.0.0.1:27017/dashboard_builder');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    }catch(err){
        console.log(`MongoDb connection Error: ${err.message}`)
        process.exit(1);
    }
}

export default connect_db;