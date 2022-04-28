import type {
	Data,

	GetQuery,
	SearchQuery,
	CreateQuery,
	UpdateQuery,
	UpsertQuery,
	DeleteQuery,
	AggregateQuery,
	GroupQuery,
	BatchQuery,

	SearchManyQuery,
	CreateManyQuery,
	UpdateManyQuery,
	DeleteManyQuery,

	ValidateQuery,

	QueringGet,
	QueringSearch,
	QueringCreate,
	QueringUpdate,
	QueringUpsert,
	QueringDelete,
	QueringAggregate,
	QueringGroup,
	QueringBatch,

	QueringSearchMany,
	QueringCreateMany,
	QueringUpdateMany,
	QueringDeleteMany,
} from '../../models/transaction';

import {
	Data as UserData,
} from '../../models/user';


export type {
	Data,

	GetQuery,
	SearchQuery,
	CreateQuery,
	UpdateQuery,
	UpsertQuery,
	DeleteQuery,
	AggregateQuery,
	GroupQuery,
	BatchQuery,

	SearchManyQuery,
	CreateManyQuery,
	UpdateManyQuery,
	DeleteManyQuery,

	ValidateQuery,

	QueringGet,
	QueringSearch,
	QueringCreate,
	QueringUpdate,
	QueringUpsert,
	QueringDelete,
	QueringAggregate,
	QueringGroup,
	QueringBatch,

	QueringSearchMany,
	QueringCreateMany,
	QueringUpdateMany,
	QueringDeleteMany,
};

export interface GetParam {
	id: number;
}
export interface GetAllByParam {
	id: number;
	by: string;
	status?: string;
}
export interface CreateParam {
	name: string;
	data: object;
	cost: number;
	created_by: number;
}
export interface CancelParam {
	id: number;
}
export interface FinishParam {
	id: number;
}
export interface AssignParam {
	id: number;
	related_by: number;
}
export interface AcceptParam {
	id: number;
}
export interface DeclineParam {
	id: number;
}
export interface TransactionData {
	id: number;
	status: string;
	address: { coord: [number, number], name: string };
	datetime: { timestamp: number; name: string };
	payment_method: { name: string };
	service: {
		daily_cleaning?: DailyCleaningService;
	};
	services: string[];
	total_cost: number;
}
export interface DailyCleaningService {
	name: string;
	cost: number;
	cleaner?: { name: string };
	building_area: {
		hour: number;
		cost: number;
	};
	job_details: {
		name: string;
		image: string;
		image_file: object;
		count: number;
	}[];
}

export interface GetReturn extends Data {
	created_by: UserData;
}
