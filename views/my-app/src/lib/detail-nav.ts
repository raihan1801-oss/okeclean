import {
  mdiCartPlus,
  mdiMessageTextOutline,
} from '@mdi/js';

export default [
  {
    name: 'Pesan',
    short: 'Pesan',
    desc: 'Chat with Seller',
    icon: mdiMessageTextOutline,
    link: '/chat',
  },
  {
    name: 'Troli',
    short: 'Tambah ke Troli',
    desc: 'Add to Cart',
    icon: mdiCartPlus,
    link: '/cart',
  },
] as { name: string; short: string; desc: string; icon: string; link: string; action?: (event: Event) => void }[];