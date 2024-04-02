import mongoose from "mongoose";

const isValidObjectId = mongoose.Types.ObjectId.isValid;

const userSchema = new mongoose.Schema(
  {
    // userName: {
    //   type: String,
    //   match: [
    //     /^[a-zA-Z0-9]{1,10}$/,
    //     "userName only allow alphanumeric characters (a-zA-Z0-9), hyphens (-), underscores (_), and periods (.) and length between 1 and 10 characters",
    //   ],
    //   required: true,
    //   trim: true,
    //   unique: true,
    //   index: true,
    // },
    email: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    name: { type: String, max: 100, required: true, trim: true },
    password: { type: String, max: 25, required: true, select: false },
    role: {
      type: String,
      enum: ["user", "issuer", "admin"],
      required: true,
      default: "user",
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: function () {
        return this.role === "issuer";
      },
      validate: {
        validator: async function (value) {
          if (this.role !== "issuer" || !isValidObjectId(value)) {
            return false;
          }
          return await mongoose.model("Institute").exists({ _id: value });
        },
        message:
          "Required only for issuer and must exist in the 'Institute' collection.",
      },
    },
    active: { type: Boolean, default: true },
  },

  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
