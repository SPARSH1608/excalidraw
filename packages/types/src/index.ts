import {z} from 'zod'

export const createUserSchema=z.object({
    username:z.string().min(3).max(30),
    email:z.string().email(),
    password:z.string().min(4)
})

export const loginUserSchema=z.object({
    email:z.string().email(),
    password:z.string().min(4)
})

export const createRoomScheama=z.object({
    slug:z.string().min(3).max(50),
})