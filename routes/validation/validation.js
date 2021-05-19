const Joi = require("joi");

const registervalidate = (req) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),

    password: Joi.string().min(8).max(20).required(),

    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });

  return schema.validate({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
};

const loginvalidate = (req) => {
  const schema = Joi.object({
    password: Joi.string().min(8).max(20).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });

  return schema.validate({
    email: req.body.email,
    password: req.body.password,
  });
};

const editpassword = (req) => {
  const schema = Joi.object({
    oldpassword: Joi.string().min(8).max(20).required(),
    password: Joi.string().min(8).max(20).required(),
  }).with("oldpassword", "password");

  return schema.validate({
    oldpassword: req.body.oldpassword,
    password: req.body.password,
  });
};

module.exports.registervalidate = registervalidate;
module.exports.loginvalidate = loginvalidate;
module.exports.editpassword = editpassword;
