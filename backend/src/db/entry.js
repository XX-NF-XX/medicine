const knex = require('./knex');

const { responseResultsPerPage: limit } = require('../config');

async function getEntriesWhere(
  whereClause,
  { onlyFirst = false, page = 1, filter = null },
) {
  // eslint-disable-next-line no-param-reassign
  if (page < 1) page = 1;

  function addSelect(query) {
    return query.select(
      'e.id',
      { ownerId: 'o.id' },
      { ownerName: 'o.name' },
      { creatorId: 'c.id' },
      { creatorName: 'c.name' },
      { entryTypeId: 'et.id' },
      { entryTypeName: 'et.name ' },
      { entryTypeDescription: 'et.description' },
      'e.title',
      'e.description',
      'e.result',
      'e.created',
    );
  }

  const clause = whereClause;
  if (clause.id != null) {
    clause['e.id'] = clause.id;
    delete clause.id;
  }

  const query = knex({ e: 'entry' })
    .where(clause)
    .join('user as o', { 'e.ownerId': 'o.id' })
    .join('user as c', { 'e.creatorId': 'c.id' })
    .join('entryType as et', { 'e.typeId': 'et.id' });

  if (filter) {
    if (clause.ownerId == null) {
      query.andWhere('o.name', 'ilike', `%${filter}%`);
    } else if (clause.creatorId == null) {
      query.andWhere('c.name', 'ilike', `%${filter}%`);
    }
  }

  if (onlyFirst) {
    addSelect(query);
    return query.first();
  }

  const { count } = await query
    .clone()
    .count()
    .first();

  const offset = (page - 1) * limit;
  query
    .offset(offset)
    .limit(limit)
    .orderBy('e.created', 'desc');

  const entries = await addSelect(query);
  return { page, total: count, limit, entries };
}

module.exports = {
  createEntry({ ownerId, creatorId, typeId, title, description, result }) {
    return knex('entry')
      .returning('id')
      .insert({
        ownerId,
        creatorId,
        typeId,
        title,
        description,
        result,
      })
      .then(ids => ids[0]);
  },

  getEntry(id) {
    return getEntriesWhere({ id }, { onlyFirst: true });
  },

  getEntries(
    { ownerId = null, creatorId = null, typeId = null },
    page,
    filter,
  ) {
    let where = { ownerId, creatorId, typeId };

    where = Object.entries(where).reduce((acc, pair) => {
      const [name, value] = pair;

      if (value != null) acc[name] = value;

      return acc;
    }, {});

    return getEntriesWhere(where, { page, filter });
  },

  updateEntry({ id, title, description, result }) {
    return knex('entry')
      .where({ id })
      .returning('id')
      .update({
        title,
        description,
        result,
      })
      .then(ids => ids[0]);
  },
};
