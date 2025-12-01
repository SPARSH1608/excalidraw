import express from 'express';
const app = express();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

import JWT_SECRET  from '@repo/config/secrets';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware.js';
import { createUserSchema,createRoomScheama,loginUserSchema } from '@repo/types/types';
import { prisma} from "@repo/db/client"
import bcrypt from 'bcrypt';
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/signin', async(req, res) => {
  try {
    console.log('Request body:', req.body);
    const {username, email, password} = req.body;
    const userParse = createUserSchema.safeParse({username, email, password});
    if(!userParse.success){
    return res.status(400).json({error:"Invalid user data"});
  }
  //db\
  const existingUser=await prisma.user.findUnique({
    where:{
      email:userParse.data.email
    }
  })
  if(existingUser){
    return res.status(400).json({error:"User already exists"});
  }
  //
  const hashedPassword=bcrypt.hashSync(userParse.data.password,10);
  const user =await prisma.user.create({
    data:{
      name: userParse.data.username,
      email: userParse.data.email,
      password: hashedPassword,
    
    }
  })
  console.log('User created:', user);
  res.json({ userId: user.id });
} catch (error) {
  console.error('Error creating user:', error);
  res.status(500).json({ error: 'Internal server error' });  
}
})
app.post('/signup', async (req, res) => {
  const {email, password} = req.body;
  try {
    
 
  const loginParse= loginUserSchema.safeParse({email, password});
  if(!loginParse.success){
    return res.status(400).json({error:"Invalid login data"});
  }
  //db check
  const user=await prisma.user.findUnique({
    where:{
      email:loginParse.data.email
    }
  })
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const isVerified=bcrypt.compareSync(loginParse.data.password,user.password);
  if(!isVerified){
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const userId=user.id;
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
} catch (error) {
 console.error('Error during login:', error);
 res.status(500).json({ error: 'Internal server error' });     
}
});
app.post('/room', middleware, async (req, res) => {
  const {slug} = req.body;
  try {
    
    const roomParse= createRoomScheama.safeParse({slug});
    if(!roomParse.success){
      return res.status(400).json({error:"Invalid room data"});
    }
    //db
    if(!req.userId){
      return res.status(401).json({error:"Unauthorized"});
    }
    const room=await prisma.room.create({
      data:{
        slug:roomParse.data.slug,
        adminId:req.userId
      }
    })
    res.json({ roomId: room.id });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });  
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});