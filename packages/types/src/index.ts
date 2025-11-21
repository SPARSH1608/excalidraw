import {z} from 'zod'

export const createUserSchema=z.object({
    username:z.string().min(3).max(30),
    email:z.string().email(),
    password:z.string().min(8)
})

export const loginUserSchema=z.object({
    email:z.string().email(),
    password:z.string().min(8)
})

export const createRoomScheama=z.object({
    name:z.string().min(3).max(50),
})