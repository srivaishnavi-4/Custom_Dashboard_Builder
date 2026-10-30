import 'dotenv/config'
import express from 'express'
import cors from 'cors';
import connect_db from './config/db.js'
import order_routes from './routes/order_routes.js'
import error_handler from './middleware/error_middleware.js';
import dashboard_routes from './routes/dashboard_routes.js'
import chart_routes from './routes/chart_routes.js';
import preference_routes from './routes/preference_routes.js'

//connect db
connect_db();

const app=express();

//middleware
app.use(cors());
app.use(express.json());

//routes
app.use('/api/orders',order_routes);
app.use('/api/dashboard', dashboard_routes);
app.use('/api/charts', chart_routes);
app.use('/api/preferences',preference_routes)

//error error handler
app.use(error_handler);

//start server
const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is running in ${process.env.NODE_ENV} on port ${PORT}`);
})