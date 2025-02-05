export interface Mapping<TModel, TEntity, TDto> {
  /**
   *
   *
   * @returns {TModel}
   * @memberof Mapping
   */
  toModel?(): TModel;

  /**
   *
   *
   * @param {TModel} model
   * @memberof Mapping
   */
  fromModel?(model: TModel): void;

  /**
   *
   *
   * @returns {TEntity}
   * @memberof Mapping
   */
  toEntity?(): TEntity;

  /**
   *
   *
   * @param {TEntity} entity
   * @memberof Mapping
   */
  fromEntity?(entity: TEntity): void;

  /**
   *
   *
   * @returns {TModel}
   * @memberof Mapping
   */
  toDto?(): TDto;

  /**
   *
   *
   * @param {TDto} dto
   * @memberof Mapping
   */
  fromDto?(dto: TDto): void;
}
