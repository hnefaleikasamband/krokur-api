import Router from 'express';
import users from './authentication';
import utils from '../services/utils';

const { ADMIN } = utils.ROLES;

const userRouter = new Router();

userRouter.get('/', users.restrictAccessTo([ADMIN]), users.getUsers);
userRouter.post('/', users.restrictAccessTo([ADMIN]), users.register);
userRouter.put('/:id/password', users.restrictAccessTo([ADMIN]), users.updatePassword);
userRouter.put('/:id/disable', users.restrictAccessTo([ADMIN]), users.setDisabledValue);
userRouter.put('/:id', users.restrictAccessTo([ADMIN]), users.updateUser);

export default userRouter;
