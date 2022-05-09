import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Dummy {
  @PrimaryKey()
  id: number;
}
