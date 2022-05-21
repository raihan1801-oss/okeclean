import { ChatNodeModel } from 'models/chat-node';
import { ChatChannelModel } from 'models/chat-channel';
import { ChatMessageModel } from 'models/chat-message';

import type * as ChatNode from '../schemas/v0-alpha.1/chat-node';
import type * as ChatChannel from '../schemas/v0-alpha.1/chat-channel';
import type * as ChatMessage from '../schemas/v0-alpha.1/chat-message';

import type { PrismaClient } from '@prisma/client';
import EventEmitter from 'events';

export type CreateContact = {
	id: number;
	name: string;
	image: string;
	role: string;
	type: 'per' | 'group';
};
export type ConnectContact = {
	myId: number;
	theirId: number;
};
export type HasContact = {
	myId: number;
	theirId: number;
};
export type GetChannel = {
	nodeId: number;
};
export type Message = ChatMessage.Data & {
	sender: ChatNode.Data;
	recipient: ChatNode.Data[];
	replyFor: ChatMessage.Data | null;
};
export type Join = { from: number; to: number; channel: Channel[] };
export type Channel = {
	id: number;
	nodeId: number;
	name: string;
	image: string;
	type: ChatChannel.Type;
	message: Message[];
};
export type ToClientChannel = ChatNode.Data & {
	channel: (ChatChannel.Data & {
		message: (ChatMessage.Data & {
			sender: ChatNode.Data;
			recipient: ChatNode.Data[];
			replyFor: ChatMessage.Data | null;
		})[];
		node: ChatNode.Data[];
	})[];
};
export type Connect = {
	nodeId: number;
	channel: Channel[];
}
export type ChatSendFormat<D = any> = {
	tag: 'message' | 'join' | 'connect';
	data: D;
};
export type ChatReceiveFormat<D = any> = {
	tag: 'message' | 'join' | 'connect';
	status: 'success' | 'failed';
	data: D;
	message: string;
};

export type { ChatNode, ChatChannel, ChatMessage };

const event = new EventEmitter();

export default class ChatFeature {
	contact;
	channel;
	message;
	event = event;
	constructor(orm: PrismaClient) {
		this.contact = new ChatNodeModel(orm);
		this.channel = new ChatChannelModel(orm);
		this.message = new ChatMessageModel(orm);
	}
	createContact({ id, name, image, role, type }: CreateContact) {
		return this.contact.create({
			data: {
				name,
				image,
				user: {
					connect: { id },
				},
				role: role,
				type: type == 'per' ? 'PerToPer' : 'PerToGroup',
			},
		});
	}
	hasContact({ myId, theirId }: HasContact) {
		return this.channel.search({
			where: {
				AND: [
					{ node: { some: { id: myId } } },
					{ node: { some: { id: theirId } } },
				],
			},
		});
	}
	async connectContact({ myId, theirId }: ConnectContact) {
		const result = await this.hasContact({ myId, theirId });

		if (result) {
			return result;
		}

		const myConntact = await this.contact.get({
			where: { id: myId },
			rejectOnNotFound: true,
		});
		const theirContact = await this.contact.get({
			where: { id: theirId },
			include: { channel: true },
			rejectOnNotFound: true,
		});

		if (theirContact.type == 'PerToGroup') {
			const result = await this.channel.update({
				data: {
					node: { connect: { id: myConntact.id } },
				},
				where: { id: theirContact.channel[0].id },
				include: {
					message: {
						include: { sender: true, recipient: true, replyFor: true },
					},
					node: true,
				},
			});
			event.emit('join', {
				from: myConntact.id,
				to: theirContact.id,
				channel: await this.toClientChannel({
					...theirContact,
					channel: [result],
				}),
			} as Join);
			return result;
		} else {
			const result = await this.channel.create({
				data: {
					node: { connect: [{ id: myConntact.id }, { id: theirContact.id }] },
				},
				include: {
					message: {
						include: { sender: true, recipient: true, replyFor: true },
					},
					node: true,
				},
			});
			event.emit('join', {
				from: myConntact.id,
				to: theirContact.id,
				channel: await this.toClientChannel({
					...theirContact,
					channel: [result],
				}),
			} as Join);
			return result;
		}
	}
	async getChannel({ nodeId }: GetChannel) {
		const contact = await this.contact.get({
			where: { id: nodeId },
			include: {
				channel: {
					include: {
						node: true,
						message: {
							include: { recipient: true, sender: true, replyFor: true },
						},
					},
				},
			},
			rejectOnNotFound: true,
		});
		return this.toClientChannel(contact);
	}
	async toClientChannel(data: ToClientChannel) {
		const channels: Channel[] = [];
		for (const channel of data.channel) {
			if (channel.type == 'PerToPer') {
				node: for (const node of channel.node) {
					if (node.id != data.id) {
						channels.push({
							id: channel.id,
							nodeId: node.id,
							type: channel.type,
							name: node.name,
							image: node.image,
							message: channel.message,
						});
						break node;
					}
				}
			} else {
				node: for (const node of channel.node) {
					if (node.type == 'PerToGroup') {
						channels.push({
							id: channel.id,
							nodeId: node.id,
							type: channel.type,
							name: node.name,
							image: node.image,
							message: channel.message,
						});
						break node;
					}
				}
			}
		}
		return channels;
	}
}
