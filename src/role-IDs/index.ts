import {prodRoleIds} from './prod';
import {devRoleIds} from './dev';

const roleIds = process.env.NODE_ENV === 'production' 
  ? prodRoleIds
  : devRoleIds;

export {roleIds};