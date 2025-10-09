export default function validate(schema, where = "body") {
  return async (req, res, next) => {
    try {
      const data = await schema.parseAsync(req[where]);
      req[where] = data;
      next();
    } catch (e) {
      res.status(400).json({
        message: "Validation error",
        issues: e?.issues || e?.message,
      });
    }
  };
}
