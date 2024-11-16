import { body } from "express-validator"


// validation for register method
export const registerValidation=[
body("userName").notEmpty().withMessage('userName is required'),
body('email').isEmail().withMessage('email is invalid'),
body('password').isLength({min:8})
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
body('confirmPassword')
  .custom((value, { req }) => {
    if (value !== req.body.password) {
        throw new Error('Passwords do not match');
    }
    return true;
   }),
body('phone').isNumeric().withMessage('Phone number must be numeric'),
body('role').optional().isString().withMessage('Role must be a string'),
];


// validation for login method
export const loginValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];


