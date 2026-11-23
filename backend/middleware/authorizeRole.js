import { StatusCodes } from "http-status-codes";

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not authorized to access this resource",
      });
    }

    next();
  };
};

export default authorizeRole;
