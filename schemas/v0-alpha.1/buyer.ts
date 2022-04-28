import type {
	Data,
	DataHistory,

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
} from '../../models/buyer';

export type {
	Data,
	DataHistory,

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

export type LoginData = {
	username: string;
	password: string;
};
export type RegisterData = LoginData & {
	email: string;
};
export type UnregisterData = {
	username: string;
	password: string;
};
export type ChangePasswordData = {
	username: string;
	password: string;
	newPassword: string;
	confirmPassword: string;
};
export type Verify = {
	otp: string;
	email: string;
}
export type ResetPasswordData = {
	email: string;
	username: string;
	new_password: string;
};
