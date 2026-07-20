import { Schema } from "mongoose";

export function applySerializePlugin(schema: Schema) {
  schema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
      delete ret.__v;
      if (ret.password) delete ret.password;
      return ret;
    },
  });
}
