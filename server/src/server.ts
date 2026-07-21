import dotenv from 'dotenv';
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import app from './app';
import { connectDB } from './db/mongo';

const PORT = process.env.PORT || 5000;
const startServer = async (): Promise<void> => {
  try {
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

   
await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);  
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
app.post("/ping", (req, res) => {
  res.json({ message: "pong" });
});

startServer();
