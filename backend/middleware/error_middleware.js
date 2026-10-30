const error_handler=(err,req,res,next)=>{
    console.log(`Error : ${err.message}`);
    const status_code=res.statusCode===200 ? 500:res.statusCode;
    res.status(status_code).json({message:err.message,stack:process.env.NODE_ENV='production' ? null :err.stack})
}

export default error_handler;