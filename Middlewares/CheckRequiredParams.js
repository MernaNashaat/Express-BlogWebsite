const CustomError = require('../Helpers/customError');

module.exports = (params) => (req, res, next) => {
  debugger;
  const recievedParams = Object.keys(req.body);
  const missingParams = params.filter(
    (paramName) => !recievedParams.includes(paramName)
  );
  if (missingParams.length) {
    
    const error= new CustomError("requird parameter",422, missingParams.reduce((agg, param) => {agg[param] = { type: "required" };return agg;}))
    
    return next(error);
  }
  next();
};
