const validate = (schema) => (req, _res, next) => {
  const data = ["body", "params", "query"].reduce(
    (acc, key) => ({ ...acc, [key]: req[key] }),
    {}
  );
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    return next({
      status: 400,
      message: error.details.map((d) => d.message).join(", ")
    });
  }
  next();
};

export default validate;

