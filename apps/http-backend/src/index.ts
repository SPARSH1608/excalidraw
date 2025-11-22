import express from 'express';
const app = express();
import JWT_SECRET  from '@repo/config/secrets';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import { createUserSchema,createRoomScheama,loginUserSchema } from '@repo/types/types';
import { prisma} from '@repo/db/client';
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/signin', async(req, res) => {
  try {
    
    const {username, email, password} = req.body;
    const userParse = createUserSchema.safeParse({username, email, password});
    if(!userParse.success){
    return res.status(400).json({error:"Invalid user data"});
  }
  //db
  const user =await prisma.user.create({
    data:{
      name: userParse.data.username,
      email: userParse.data.email,
      password: userParse.data.password,
      rooms: { create: [] },
      chats: { create: [] }
    }
  })
  console.log('User created:', user);
  res.json({ userId: user.id });
} catch (error) {
  console.error('Error creating user:', error);
  res.status(500).json({ error: 'Internal server error' });  
}
})
app.post('/signup', (req, res) => {
  const {email, password} = req.body;
  const loginParse= loginUserSchema.safeParse({email, password});
  if(!loginParse.success){
    return res.status(400).json({error:"Invalid login data"});
  }
  //db check
  const userId=1;
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});
app.post('/room', middleware, (req, res) => {
  const {name} = req.body;
  const roomParse= createRoomScheama.safeParse({name});
  if(!roomParse.success){
    return res.status(400).json({error:"Invalid room data"});
  }
  //db
  res.json({ roomId: 'room123' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});