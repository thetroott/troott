import z from 'zod'

export const SignupSchema = z.object({
    first_name:z.string().min(3,{
        message:'Name must be at least 3 characters'
    }),
    last_name:z.string().min(3,{
        message:'Name must be at least 3 characters'
    }),
    email:z.string().email({
        message:"Enter a valid email"
    }).min(6,{
        message:'Email must be at least 6 characters'
    }),
    password:z.string().min(8,{
        message:"Password must be at least 8 characters"
    })
})

export type SignupSchemaType = z.infer<typeof SignupSchema>