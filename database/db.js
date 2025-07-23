import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const USERNAME= process.env.DB_USERNAME;
const PASSWORD =process.env.DB_PASSWORD;

const Connection = async() =>{
    const URL=`mongodb://${USERNAME}:${PASSWORD}@cluster0-shard-00-00.fh58h.mongodb.net:27017,cluster0-shard-00-01.fh58h.mongodb.net:27017,cluster0-shard-00-02.fh58h.mongodb.net:27017/?ssl=true&replicaSet=atlas-l71728-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`
    try{
       await  mongoose.connect(URL,{ useUnifiedTopology: true});
       console.log('Database connected successfully');
    }catch(error){
       console.log('Error while conntecting to database',error.message);
    }
}
export default Connection;

