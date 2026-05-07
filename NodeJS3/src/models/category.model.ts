import { Document, Schema, model } from 'mongoose';

export interface ICategory {
    name: string;
    description?: string;
    type: 'income' | 'expense';
    color: string;
    userId: number;
}

export interface ICategoryDocument extends ICategory, Document {
    createdAt: Date;
    updatedAt: Date;
    readonly displayInfo: string; 
}

const categorySchema = new Schema<ICategoryDocument>(
    {
        name: {
            type: String,
            required: [true, 'Назва не може бути порожньою'],
            trim: true,
            minlength: [1, 'Назва не може бути порожньою'],
            maxlength: [100, 'Назва занадто довга']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Опис занадто довгий'],
            required: false
        },
        type: {
            type: String,
            required: [true, 'Тип є обов\'язковим'],
            enum: {
                values: ['income', 'expense'],
                message: '{VALUE} не є валідним типом категорії'
            }
        },
        color: {
            type: String,
            required: [true, 'Колір є обов\'язковим'],
            match: [/^#[0-9A-Fa-f]{6}$/, 'Невірний формат кольору, очікується HEX (наприклад, #FF0000)']
        },
        userId: {
            type: Number,
            required: [true, 'ID користувача є обов\'язковим'],
            min: [1, 'ID користувача має бути додатним числом'],
            validate: {
                validator: function (value: number) {
                    return Number.isInteger(value);
                },
                message: 'ID користувача ({VALUE}) має бути цілим числом'
            }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

categorySchema.virtual('displayInfo').get(function (this: ICategoryDocument) {
    const typeTranslated = this.type === 'income' ? 'Дохід' : 'Витрата';
    return `${this.name} (${typeTranslated}) [Колір: ${this.color}]`;
});

export const CategoryModel = model<ICategoryDocument>('Category', categorySchema);