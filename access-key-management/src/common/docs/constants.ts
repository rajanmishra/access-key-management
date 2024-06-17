import { IDocOptions } from './interfaces/doc-options.interface';

export const apiTitle = 'Access Key Management Service';
export const apiDescription =
  'This service is responsible for generating access keys for users, defining rate limits, expiration times, and providing administrative capabilities to create or delete keys. Users can retrieve their plan details using their key';

export const adminTags = ['Admin'];
export const userTags = ['User'];

export const admin: IDocOptions = {
  tagGroupName: 'Admin',
  tags: adminTags,
};

export const user: IDocOptions = {
  tagGroupName: 'User',
  tags: userTags,
};

export const xTagGroups = [
  {
    name: admin.tagGroupName,
    tags: admin.tags,
  },
  {
    name: user.tagGroupName,
    tags: user.tags,
  },
];
