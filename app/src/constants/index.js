import { createDemand, createSupply, dashboard, logout, payment, profile, withdraw } from '../assets';

export const navlinks = [
  {
    name: 'dashboard',
    imgUrl: dashboard,
    link: '/',
  },
  {
    name: 'task',
    imgUrl: createTask,
    link: '/create-task',
  },
  {
    name: 'buyer',
    imgUrl: createDemand,
    link: '/create-demand',
  },
  {
    name: 'seller',
    imgUrl: createSupply,
    link: '/create-supply',
  },
  {
    name: 'payment',
    imgUrl: payment,
    link: '/',
    disabled: true,
  },
  {
    name: 'withdraw',
    imgUrl: withdraw,
    link: '/',
    disabled: true,
  },
  {
    name: 'profile',
    imgUrl: profile,
    link: '/profile',
  },
  {
    name: 'logout',
    imgUrl: logout,
    link: '/',
    disabled: true,
  },
];