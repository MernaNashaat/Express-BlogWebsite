const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const util = require("util");

const signJWT = util.promisify(jwt.sign);
const saltRounds = 10;
const jwtSecret =process.env.JWT_Secret;
if(!jwtSecret) throw new Error("")
const verifyJWT = util.promisify(jwt.verify);

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  age: {
    type: Number,
  },
  address: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  followersIds: [
    {
      type: String,
    },
  ],
  followingIds: [
    {
      type: String,
    },
  ],
  BlogsIds: [
    {
      type: String,
    },
  ],
});

schema.pre("save", async function () {
  const currentDocument = this;
  if (currentDocument.isModified("password")) {
    currentDocument.password = await bcrypt.hash(
      currentDocument.password,
      saltRounds
    );
    const hashed = currentDocument.password;
  }
});

schema.methods.checkPassword = function (plainText) {
  const currentDocument = this;
  return bcrypt.compare(plainText, currentDocument.password);
};

schema.methods.generateToken = function () {
  const currentDocument = this;
  return signJWT({ id: currentDocument.id }, jwtSecret);
};

schema.statics.getUserFromToken = async function (token) {
  const User = this;
  const { id } = await verifyJWT(token, jwtSecret);
  const user = await User.findById(id);
  return user;
};

const User = mongoose.model("User", schema);
module.exports = User;
