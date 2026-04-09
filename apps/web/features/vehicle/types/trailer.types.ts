import {
  type CreateTrailerDto,
  type ITrailerView,
  TrailerViewSchema,
  type UpdateTrailerDto,
} from '@logistica/shared';

export type Trailer = ITrailerView;
export type TrailerFormValues = CreateTrailerDto;
export type TrailerUpdateFormValues = UpdateTrailerDto;

export { TrailerViewSchema };
