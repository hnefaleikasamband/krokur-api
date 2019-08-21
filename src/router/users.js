import Router from 'express';
import users from './authentication';
import utils from '../services/utils';

const { ADMIN } = utils.ROLES;

const userRouter = new Router();

userRouter.get('/', users.restrictAccess([ADMIN]), users.getUsers);
userRouter.post('/', users.restrictAccess([ADMIN]), users.register);
userRouter.put('/:id/password', users.restrictAccess([ADMIN]), users.updatePassword);
userRouter.post('/:id/disabled', users.restrictAccess([ADMIN]), users.setDisabledValue);
userRouter.put('/:id', users.restrictAccess([ADMIN]), users.updateUser);

export default userRouter;
