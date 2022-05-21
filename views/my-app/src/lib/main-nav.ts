import {
  mdiHomeOutline,
  mdiEmailOpenOutline,
  mdiOrderBoolDescending,
  mdiAccountOutline,
} from '@mdi/js';


export default [
  {
    name: 'Home',
    icon: mdiHomeOutline,
    link: '/',
  },
  {
    name: 'Pesanan',
    icon: mdiOrderBoolDescending,
    link: '/order/nota/semua/',
  },
  {
    name: 'Pesan',
    icon: mdiEmailOpenOutline,
    link: '/chat',
  },
  {
    name: 'Akun',
    icon: mdiAccountOutline,
    link: '/account',
  },
];