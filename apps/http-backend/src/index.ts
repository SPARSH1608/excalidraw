import express from 'express';
const app = express();
import JWT_SECRET  from '@repo/config/secrets';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import { createUserSchema,createRoomScheama,loginUserSchema } from '@repo/types/types';
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/signin', (req, res) => {
  const {username, email, password} = req.body;
  const userParse = createUserSchema.safeParse({username, email, password});
  if(!userParse.success){
    return res.status(400).json({error:"Invalid user data"});
  }
  //db
  res.json({ userId:"123"})
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