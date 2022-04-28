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
} from '../../models/feature';

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

export interface Body {
	name: string;
	meta: object;
	data: object;
};

export interface GetParam {
	name: string;
}
export interface CreateParam extends Body { }
export interface UpdateParam {
	id: number;
	data: Body;
}
export interface DeleteParam {
	id: number;
}
export interface PushParam {

}
export interface PopParam {

}
export interface CreateParam {

}
export interface DailyCleaningData {
	building_areas: {
		hour: number;
		cost: number;
	}[];
	job_details: {
		name: string;
		image: string;
		image_file: object;
		count: number;
	}[];
}
