import Joi from '@hapi/joi';

const UUIDv4 = Joi.string().guid({ version: 'uuidv4' });
const SHORTHAND = Joi.string()
  .min(2)
  .max(5)
  .uppercase();

const userSchema = Joi.object().keys({
  email: Joi.string()
    .email()
    .lowercase()
    .required(),
  password: Joi.string()
    .min(5)
    .required()
    .strict(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .strict(),
  name: Joi.string().required(),
  club: UUIDv4.allow(null).when('role', { is: 'COACH', then: UUIDv4.required() }),
  disabled: Joi.boolean().default(false),
  role: Joi.string()
    .uppercase()
    .valid('ADMIN', 'COACH', 'JUDGE')
    .required(),
});

const clubSchema = Joi.object().keys({
  id: UUIDv4,
  name: Joi.string().required(),
  shorthand: SHORTHAND.required(),
});

const athleteSchema = Joi.object().keys({
  name: Joi.string().required(),
  ssn: Joi.string()
    .length(10)
    .required(),
  club: UUIDv4.required(),
});

const boutSchema = Joi.object().keys({
  athleteId: UUIDv4.required(),
  athleteName: Joi.string().required(),
  athleteClubShortHand: Joi.alternatives()
    .try(SHORTHAND, UUIDv4)
    .required(),
  opponentId: UUIDv4.required(),
  opponentName: Joi.string().required(),
  opponentClubShortHand: Joi.alternatives()
    .try(SHORTHAND, UUIDv4)
    .required(),
  class: Joi.string()
    .uppercase()
    .valid('A', 'B', 'C')
    .required(),
  boutDate: Joi.date()
    .iso()
    .required(),
  points: Joi.number()
    .min(9)
    .max(45)
    .required(),
  organizer: SHORTHAND.required(),
});

const fullMatchSchema = Joi.object().keys({
  athleteAId: UUIDv4.required(),
  athleteAName: Joi.string().required(),
  athleteAClubShortHand: Joi.alternatives()
    .try(SHORTHAND, UUIDv4)
    .required(),
  athleteAPoints: Joi.number()
    .min(9)
    .max(45)
    .required(),
  athleteBId: UUIDv4.required(),
  athleteBName: Joi.string().required(),
  athleteBClubShortHand: Joi.alternatives()
    .try(SHORTHAND, UUIDv4)
    .required(),
  athleteBPoints: Joi.number()
    .min(9)
    .max(45)
    .required(),
  class: Joi.string()
    .uppercase()
    .valid('A', 'B', 'C')
    .required(),
  boutDate: Joi.date()
    .iso()
    .required(),
  organizer: SHORTHAND.required(),
});

const passwordValidation = Joi.object().keys({
  password: Joi.string()
    .min(5)
    .required()
    .strict(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .strict(),
});

const userWithoutPasswordSchema = Joi.object().keys({
  id: UUIDv4.required(),
  email: Joi.string()
    .lowercase()
    .required()
    .email(),
  name: Joi.string().required(),
  club: UUIDv4.allow(null).when('role', { is: 'COACH', then: UUIDv4.required() }),
  role: Joi.string()
    .uppercase()
    .valid('ADMIN', 'COACH', 'JUDGE')
    .required(),
  disabled: Joi.boolean().default(false),
});

const defaultValidationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: false,
};

export default {
  UUIDv4,
  userSchema,
  clubSchema,
  athleteSchema,
  boutSchema,
  fullMatchSchema,
  passwordValidation,
  userWithoutPasswordSchema,
  defaultValidationOptions,
};
