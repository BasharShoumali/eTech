export function pick(obj, allowed) {
  const out = {};
  for (const k of allowed) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

export function buildInsert(table, data) {
  const keys = Object.keys(data);
  if (!keys.length) throw new Error("No fields to insert");
  const cols = keys.map((k) => `\`${k}\``).join(",");
  const placeholders = keys.map((_) => "?").join(",");
  return {
    sql: `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`,
    params: keys.map((k) => data[k]),
  };
}

export function buildUpdate(table, data, idCol) {
  const keys = Object.keys(data);
  if (!keys.length) throw new Error("No fields to update");
  const set = keys.map((k) => `\`${k}\`=?`).join(",");
  return {
    sql: `UPDATE ${table} SET ${set} WHERE ${idCol} = ?`,
    params: [...keys.map((k) => data[k]), undefined], // we'll push id later
  };
}
