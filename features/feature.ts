import type FeatureModel from 'models/feature';
import type {
  Data,
  CreateParam,
  UpdateParam,
  DeleteParam,

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
  GetParam,
} from 'schemas/v0-alpha.1/feature';

export default class FeatureFeature {
  public model: FeatureModel
  public salt!: string
  constructor(model: FeatureModel) {
    this.model = model;
  }
  public async init() { }
  public async get(param: GetParam) {
    return this.model.get({
      where: {
        name: param.name,
      }
    });
  }
  public async get_all() {
    return this.model.searchMany()
  }
  public async create(param: CreateParam) {
    return this.model.create({
      data: {
        name: param.name,
        meta: param.meta,
        data: param.data,
      },
    });
  }
  public async update(param: UpdateParam) {
    return this.model.update({
      data: {
        name: param.data.name,
        meta: param.data.meta,
        data: param.data.data,
      },
      where: {
        id: param.id,
      }
    });
  }
  public async delete(param: DeleteParam) {
    return this.model.delete({
      where: {
        id: param.id,
      }
    });
  }
}