import type { Env } from 'global';
import type EnvType from '../.env.json';

import fs from 'fs-extra';
import path from 'path';
import Dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import faker from 'faker';
import chalk from 'chalk';
import { PrismaClient } from '@prisma/client';

export interface Options {
	verbose?: boolean;
	dev?: boolean;
}

export const defOpts: Options = {
	verbose: true,
	dev: true,
};

export class Seed {
	public static async setup(opts?: Options) {
		const { verbose, dev } = Object.assign(
			{},
			defOpts,
			opts
		) as Required<Options>;

		const {
			env: { PROJECT_ROOT_DIR, SERVER_PUBLIC_DIR, DEV },
		} = process as Env<typeof EnvType>;
		const orm = new PrismaClient({ errorFormat: 'pretty' });
		const salt = await bcrypt.genSalt(16);

		const fake = {
			buyer: [] as any[],
			seller: [] as any[],
			courier: [] as any[],
			internal: [] as any[],
		};

		try {
			await orm.$connect();

			if (dev) {
				let name = '';

				fake.internal[0] = await orm.internal.upsert({
					create: {
						access: {},
						password: await bcrypt.hash('internal1', salt),
						role: 'internal',
						username: 'internal1',
						chatNode: {
							create: {
								role: 'internal',
								name: 'Internal Group',
								type: 'PerToGroup',
								image: (faker.image as any).lorempixel.business(),
								channel: { create: { type: 'PerToGroup' } },
							},
						},
					},
					update: {},
					where: { id: 1 },
					include: { chatNode: { include: { channel: true } } },
				});

				name = faker.name.findName();

				fake.buyer[0] = await orm.buyer.upsert({
					create: {
						email: 'pembeli1@mail.com',
						username: 'pembeli1',
						password: await bcrypt.hash('pembeli1', salt),
						role: 'buyer',
						name,
						telp: faker.phone.phoneNumber(),
						image: faker.image.avatar(),
						verified: true,
						chatNode: {
							create: {
								role: 'buyer',
								name,
								image: faker.image.fashion(),
								type: 'PerToPer',
							},
						},
						address: {
							create: {
								label: '',
								selected: false,
								pinned: true,
								name: faker.name.findName(),
								telp: faker.phone.phoneNumber(),
								value:
									'Kampus II UIN Alauddin Samata, Kampus II UIN Alauddin, Gowa, South Sulawesi 92118, Indonesia',
								detail: 'Kos',
								area: 'Romangpolong',
								local: 'Somba Opu',
								place: 'Gowa',
								position: [119.4980056626282, -5.201923874728976],
							},
						},
					},
					include: { address: true, chatNode: true },
					update: {},
					where: { id: 1 },
				});

				name = faker.name.findName();

				fake.buyer[1] = await orm.buyer.upsert({
					create: {
						email: 'pembeli2@mail.com',
						username: 'pembeli2',
						password: await bcrypt.hash('pembeli2', salt),
						role: 'buyer',
						name,
						telp: faker.phone.phoneNumber(),
						image: faker.image.avatar(),
						verified: true,
						chatNode: {
							create: {
								role: 'buyer',
								name,
								image: faker.image.fashion(),
								type: 'PerToPer',
							},
						},
						address: {
							create: {
								label: '',
								selected: false,
								pinned: true,
								name: faker.name.findName(),
								telp: faker.phone.phoneNumber(),
								value:
									'Research Center and Library, Jalan Sultan Alauddin No. 36, Gowa, South Sulawesi 92118, Indonesia',
								detail: 'Kampus',
								area: 'Romangpolong',
								local: 'Somba Opu',
								place: 'Gowa',
								position: [119.4981435715189, -5.205872792555951],
							},
						},
					},
					include: { address: true, chatNode: true },
					update: {},
					where: { id: 2 },
				});

				name = faker.company.companyName();

				fake.seller[0] = await orm.seller.upsert({
					create: {
						email: 'penjual1@mail.com',
						username: 'penjual1',
						password: await bcrypt.hash('penjual1', salt),
						role: 'seller',
						name: faker.name.findName(),
						store: {
							create: {
								name,
								telp: faker.phone.phoneNumber(),
								image: (faker.image as any).lorempixel.business(),
								address:
									'GOR Sudiang, Jl. Pajjaiang Raya, Makassar, South Sulawesi 90242, Indonesia',
								area: '90242',
								local: 'Makassar',
								place: 'South Sulawesi',
								position: [119.5267842565286, -5.105691981958643],
								chatNode: {
									create: {
										role: 'seller',
										name,
										image: (faker.image as any).lorempixel.business(),
										type: 'PerToPer',
									},
								},
								product: {
									createMany: {
										data: [
											{
												name: faker.commerce.productName(),
												description: faker.commerce.productDescription(),
												image: (faker.image as any).unsplash.food(),
												price: faker.commerce.price(10_000, 100_000),
												fresh: true,
												weight: faker.datatype.float(1),
												weightUnit: 'kg',
												stock: faker.datatype.number(100),
											},
											{
												name: faker.commerce.productName(),
												description: faker.commerce.productDescription(),
												image: (faker.image as any).unsplash.food(),
												price: faker.commerce.price(10_000, 100_000),
												fresh: true,
												weight: faker.datatype.float(1),
												weightUnit: 'kg',
												stock: faker.datatype.number(100),
											},
											{
												name: faker.commerce.productName(),
												description: faker.commerce.productDescription(),
												image: (faker.image as any).unsplash.food(),
												price: faker.commerce.price(10_000, 100_000),
												fresh: true,
												weight: faker.datatype.float(1),
												weightUnit: 'kg',
												stock: faker.datatype.number(100),
											},
										],
									},
								},
							},
						},
					},
					include: { store: { include: { product: true } } },
					update: {},
					where: { id: 1 },
				});

				name = faker.company.companyName();

				fake.seller[1] = await orm.seller.upsert({
					create: {
						email: 'penjual2@mail.com',
						username: 'penjual2',
						password: await bcrypt.hash('penjual2', salt),
						role: 'seller',
						name: faker.name.findName(),
						store: {
							create: {
								name,
								telp: faker.phone.phoneNumber(),
								image: (faker.image as any).lorempixel.business(),
								address:
									'GPdI EL-SHADDAI, Jl. Perintis Kemerdekaan No. 12, Makassar, South Sulawesi 90245, Indonesia',
								area: '90242',
								local: 'Makassar',
								place: 'South Sulawesi',
								position: [119.506160585125, -5.126680851927361],
								chatNode: {
									create: {
										role: 'seller',
										name,
										image: (faker.image as any).lorempixel.business(),
										type: 'PerToPer',
									},
								},
								product: {
									createMany: {
										data: [
											{
												name: faker.commerce.productName(),
												description: faker.commerce.productDescription(),
												image: (faker.image as any).unsplash.food(),
												price: faker.commerce.price(10_000, 100_000),
												fresh: true,
												weight: faker.datatype.float(1),
												weightUnit: 'kg',
												stock: faker.datatype.number(100),
											},
											{
												name: faker.commerce.productName(),
												description: faker.commerce.productDescription(),
												image: (faker.image as any).unsplash.food(),
												price: faker.commerce.price(10_000, 100_000),
												fresh: true,
												weight: faker.datatype.float(1),
												weightUnit: 'kg',
												stock: faker.datatype.number(100),
											},
											{
												name: faker.commerce.productName(),
												description: faker.commerce.productDescription(),
												image: (faker.image as any).unsplash.food(),
												price: faker.commerce.price(10_000, 100_000),
												fresh: true,
												weight: faker.datatype.float(1),
												weightUnit: 'kg',
												stock: faker.datatype.number(100),
											},
										],
									},
								},
							},
						},
					},
					include: { store: { include: { product: true } } },
					update: {},
					where: { id: 2 },
				});

				name = faker.name.findName();

				fake.courier[0] = await orm.courier.upsert({
					create: {
						email: 'kurir1@mail.com',
						username: 'kurir1',
						password: await bcrypt.hash('kurir1', salt),
						role: 'courier',
						name,
						telp: faker.phone.phoneNumber(),
						image: (faker.image as any).lorempixel.avatar(),
						area: 'Mario',
						local: 'Mariso',
						place: 'Makassar',
						address:
							'Stadion Andi Mattalatta - Mattoangin, Mattalatta, Makassar, South Sulawesi 90125, Indonesia',
						position: [119.41537217408592, -5.158676438584976],
						chatNode: {
							create: {
								role: 'courier',
								name,
								image: (faker.image as any).lorempixel.avatar(),
								type: 'PerToPer',
							},
						},
					},
					update: {},
					where: { id: 1 },
				});

				name = faker.name.findName();

				fake.courier[0] = await orm.courier.upsert({
					create: {
						email: 'kurir2@mail.com',
						username: 'kurir2',
						password: await bcrypt.hash('kurir2', salt),
						role: 'courier',
						name,
						telp: faker.phone.phoneNumber(),
						image: (faker.image as any).lorempixel.avatar(),
						area: 'Romangpolong',
						local: 'Somba Opu',
						place: 'Gowa',
						address:
							'Faculty of Syariah and Law, Jalan Sultan Alauddin No. 36, Gowa, South Sulawesi 92118, Indonesia',
						position: [119.49971310000001, -5.2039458776063015],
						chatNode: {
							create: {
								role: 'courier',
								name,
								image: (faker.image as any).lorempixel.avatar(),
								type: 'PerToPer',
							},
						},
					},
					update: {},
					where: { id: 2 },
				});
			} else {
				fake.internal[0] = await orm.internal.upsert({
					create: {
						access: {},
						password: await bcrypt.hash('Admin', salt),
						role: 'internal',
						username: 'Admin',
						chatNode: {
							create: {
								role: 'internal',
								name: 'Admin',
								type: 'PerToGroup',
								image: (faker.image as any).lorempixel.business(),
								channel: { create: { type: 'PerToGroup' } },
							},
						},
					},
					update: {},
					where: { id: 1 },
					include: { chatNode: { include: { channel: true } } },
				});
			}

			await fs.writeJson(path.join(PROJECT_ROOT_DIR, 'data.json'), {
				business: {
					productPriceIncrease: 500,
					productPriceIncreaseActive: false,
					deliveryCostCalculatePerDistance: 1000,
					deliveryCostCalculatePerDistanceActive: true,
					deliveryCostCalculatePerWeight: 0,
					deliveryCostCalculatePerWeightActive: false,
				},
				model: {
					open: false,
					openBy: '',
					openAt: '',
					link: '',
				},
				slides: [{ id: 0, src: '', href: '' }],
			});

			await fs.promises.writeFile(
				path.join(SERVER_PUBLIC_DIR, 'seed.json'),
				JSON.stringify(fake, undefined, '\t')
			);

			console.log(
				chalk.bgBlack.white`Seeding Database`,
				chalk.green`[Success]`
			);
		} catch (error: any) {
			console.log(chalk.bgBlack.white`Seeding Database`, chalk.green`[Failed]`);
			console.error(error);
		} finally {
			await orm.$disconnect();
		}
	}
}
