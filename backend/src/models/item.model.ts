import { Schema, model, Document } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Item = model<IItem>('Item', itemSchema);
