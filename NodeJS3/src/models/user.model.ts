import bcrypt from 'bcryptjs';
import { Document, Schema, model } from 'mongoose';

export interface IUserDocument extends Document {
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
    {
        email: {
            type: String,
            required: [true, 'Електронна пошта є обов\'язковою'],
            unique: true,
            index: true,
            trim: true,
            lowercase: true
        },
        passwordHash: {
            type: String,
            required: [true, 'Пароль є обов\'язковим'],
            select: false
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                const transformed = ret as Record<string, unknown>;
                delete transformed.passwordHash;
                delete transformed.__v;
                return transformed;
            }
        }
    }
);

userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) {
        return;
    }

    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

export const UserModel = model<IUserDocument>('User', userSchema);