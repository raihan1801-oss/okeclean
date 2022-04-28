import type TransactionModel from 'models/transaction';
import type {
  Data,
  GetParam,
  GetAllByParam,
  CreateParam,
  AcceptParam,
  AssignParam,
  CancelParam,
  DeclineParam,
  FinishParam,

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
} from 'schemas/v0-alpha.1/transaction';

export default class TransactionFeature {
  public model: TransactionModel
  public salt!: string
  constructor(model: TransactionModel) {
    this.model = model;
  }
  public async init() { }
  public async get(param: GetParam) {
    return this.model.get({
      where: {
        id: param.id,
      },
      include: {
        created_by: true,
        related_by: true,
      }
    });
  }
  public async get_all() {
    return this.model.searchMany();
  }
  public async get_all_by(data: GetAllByParam) {
    if (data.by == "customer") {
      return this.model.searchMany({
        where: {
          AND: [
            {
              created_by: {
                id: data.id
              },
            },
            {
              status: data.status,
            }
          ],
        },
        include: {
          related_by: true,
        },
      });
    } else {
      return this.model.searchMany({
        where: {
          AND: [
            {
              related_by: {
                id: data.id
              },
            },
            {
              status: data.status,
            }
          ],
        },
        include: {
          created_by: true,
        },
      });
    }
  }
  public async create(data: CreateParam) {
    return this.model.create({
      data: {
        status: "create",
        cost: data.cost,
        created_on: new Date(),
        data: data.data,
        created_by: {
          connect: {
            id: data.created_by,
          }
        }
      }
    })
  }
  public async cancel(data: CancelParam) {
    return this.model.update({
      where: {
        id: data.id,
      },
      data: {
        status: "cancel",
      }
    });
  }
  public async finish(data: FinishParam) {
    return this.model.update({
      where: {
        id: data.id,
      },
      data: {
        status: "finish",
        finished_on: new Date,
      }
    });
  }
  public async assign(data: AssignParam) {
    return this.model.update({
      where: {
        id: data.id,
      },
      data: {
        status: "proccess",
        related_by: {
          connect: {
            id: data.related_by,
          }
        }
      }
    });
  }
  public async accept(data: AcceptParam) {

  }
  public async decline(data: DeclineParam) {

  }
}