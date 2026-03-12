type QueryParams = Record<string, unknown>;

class AppQuery {
  private query: QueryParams;

  private where: QueryParams = {};
  private orderBy: QueryParams[] = [];
  private take = 10;
  private skip = 0;
  private select: QueryParams | null = null;
  private include: QueryParams | null = null;

  constructor(query: QueryParams) {
    this.query = query;
  }

  search(fields: string[]) {
    const search = this.query.search;

    if (search) {
      this.where.OR = fields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    return this;
  }

  filter() {
    const query = { ...this.query };
    const excludeFields = [
      'search',
      'sort',
      'limit',
      'page',
      'fields',
      'include',
    ];
    excludeFields.forEach((field) => delete query[field]);

    this.where = {
      ...this.where,
      ...query,
    };

    return this;
  }

  sort() {
    const sortParam = this.query.sort as string;
    if (sortParam) {
      this.orderBy = sortParam.split(',').map((field) => {
        const direction = field.startsWith('-') ? 'desc' : 'asc';
        const fieldName = field.replace(/^-/, '');
        return { [fieldName]: direction };
      });
    } else {
      this.orderBy = [{ created_at: 'desc' }];
    }

    return this;
  }

  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    this.take = limit;
    this.skip = (page - 1) * limit;

    return this;
  }

  fields() {
    const fields = this.query.fields as string;

    if (fields) {
      const fieldsArr = fields.split(',');
      this.select = fieldsArr.reduce(
        (acc, field) => {
          acc[field] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    }

    return this;
  }

  relations() {
    const relations = this.query.relations as string;

    if (relations) {
      const relationsArr = relations.split(',');
      this.include = relationsArr.reduce(
        (acc, field) => {
          acc[field] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    }

    return this;
  }

  build() {
    const query: QueryParams = {
      where: this.where,
      orderBy: this.orderBy,
      take: this.take,
      skip: this.skip,
    };

    if (this.select) {
      query.select = this.select;
    }

    if (this.include) {
      query.include = this.include;
    }

    return query;
  }
}

export default AppQuery;
