import bcrypt from 'bcrypt';
import type UserModel from 'models/user';

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

  LoginData,
  RegisterData,
  UnregisterData,
  ChangePasswordData,
  GenerateOTP,
  VerifyOTP,
  Subscribe,
  Unsubscribe,
  GetParam,
} from 'schemas/v0-alpha.1/user';

export default class UserFeature {
  public model: UserModel
  public salt!: string
  constructor(model: UserModel,) {
    this.model = model;
  }
  public async init() {
    this.salt = await bcrypt.genSalt(6)
  }
  public async register(data: RegisterData) {
    return this.model.create({
      data: {
        name: data.name,
        password: await bcrypt.hash(data.password, this.salt),
        email: data.email,
        role: data.role,
      }
    })
  }
  public async unregister(data: UnregisterData) {
    const user = await this.login(data);
    return this.model.delete({
      where: {
        id: user.id
      }
    })
  }
  public async login(data: LoginData) {
    const user = await this.model.search({
      where: {
        name: data.name
      }
    })
    if (user) {
      const is_same = await bcrypt.compare(data.password, user.password);
      if (is_same) {
        return user
      }
      throw new Error("Incorrect Name and Password")
    }
    throw new Error("Unknown User")
  }
  public async change_password(data: ChangePasswordData) {
    if (data.confirmPassword == data.newPassword) {
      const user = await this.login(data);
      return this.model.update({
        data: {
          password: await bcrypt.hash(data.confirmPassword, 16)
        },
        where: {
          id: user.id
        }
      })
    }
    throw new Error("New password mismatch with Confirm password");
  }
  public async generate_otp(data: GenerateOTP) {
    const user = await this.model.get({
      where: {
        email: data.email
      }
    });
    if (user) {
      if (!user.verified) {
        return user;
      }
      throw new Error("User Already Verified");
    }
    throw new Error("Unknown User");
  }
  public async verify_otp(data: VerifyOTP) {
    const user = await this.model.get({
      where: {
        email: data.email
      }
    });
    if (user) {
      if (user.verified) {
        throw new Error("User Already Verified");
      }
      return await this.model.update({
        data: {
          verified: true,
        },
        where: {id: user.id},
      })
    }
    throw new Error("Unknown User");
  }
  public async subscribe(data: Subscribe) {}
  public async unsubscribe(data: Unsubscribe) {}
  public async get(data: GetParam) {
    return this.model.search({
      where: {
        id: data.id,
      }
    })
  }
  public async get_all() {
    return this.model.searchMany({});
  }
}